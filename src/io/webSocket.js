class webSocket {
  constructor(runtime, extensionId, onReceive, DATA_SEND_INTERVAL) {
    this._runtime = runtime;
    this._extensionId = extensionId;
    this.socket = null;
    this._deviceName = null;
    this._info = null;
    this._staIp = null;
    this._webSocketObjList = [];
    this._manualDisconnect = false; //手动断开连接
    this._payload = null; //需要发送的数据
    this._onReceive = onReceive; //将接收到的数据进行转换
    this._receivedData = null; //接收到的数据
    this._networks = null; //附近WiFi名称
    this.autoConnect();
    // this._onSend();
    this._clickConnect = false;
    this._historyWSObject = [];
    this._timeoutList = [];
    this._scanWSObj = {};
    this._shouldStopScan = false; // 添加停止扫描标志
    this._isManualDisconnect = false; //是否手动断开连接
    this._scanedDevices = [], //扫描出来的设备
      this._reconnectCount = 0; //重连次数
    this._scanSuccessList = [];// 扫描成功的列表
    this._sendTimer = null;
    this._DATA_SEND_INTERVAL = DATA_SEND_INTERVAL ? DATA_SEND_INTERVAL : 100; //发送数据间隔时间
    this._keepAliveInterval = null;
    this._isConnected = false; //是否连接
    this._isStarted = false; //是否开始发送数据
    this._isPingPongType = false;
    this._PING_PONG_TYPE_LIST = [
      "Zeus_Car",
      "Mars Rover",
      "PICO-4WD Car",
      "Nano Sloth",
    ];
    this._keepAliveTimeout = null;
    this.SET_DEVICE_FIELD = "SET+";
    this.DATA_SEND_FIELD = "DATA+";
    this.clear_after_send = false; //发送完数据后是否清除
    this._activeSockets = []; // 活跃的 WebSocket 连接
    this._setWifiState = null;
    this._heartbeatTimer = null; // 心跳定时器
    this._pongTimer = null; // Pong 响应定时器
    this._pongTimeout = 5000; // 5秒没收到pong认为断开
    this._heartbeatInterval = 1000; // 1秒发一次ping
    this._waitingPong = false;
    this._pingTimer = null;
    this._pingTimeout = 1000; // 1.5秒发送一次ping
    this._dataReceiveState = false; //数据接收状态
  }

  setClearAfterSend(bool) {
    this.clear_after_send = bool;
  }

  setSendPayload(payload) {
    this._payload = payload;
    if (this._isConnected) {
      this._isStarted = true;
    }
  }

  // 测试连接
  testConnect(url, timeout, sen) {
    return new Promise((resolve, reject) => {
      if (this._clickConnect) return;
      // 创建 WebSocket 连接
      const socket = new WebSocket(url);
      // this._activeSockets.push(socket);
      socket.binaryType = 'arraybuffer';
      let timerId = null;
      const cleanup = () => {
        clearTimeout(timerId);
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
      };

      // 当连接建立时触发
      socket.onopen = () => {
        console.log('WebSocket 连接已建立');
        this.sendPing(socket); // 发送ping
        clearTimeout(timerId);
        resolve();
      };

      // 当接收到服务器发送的消息时触发
      socket.onmessage = (event) => {
        this._activeSockets.push(socket);
        try {
          const data = JSON.parse(event.data);
          console.log('收到服务器消息：', data);
          // 在这里处理消息
          let ip = event.origin.split("//")[1].split(":")[0];
          if (data != null && data.Check) {
            const scanSuccess = { [ip]: socket };
            // 判断是否已经存在相同的 IP
            const socketExists = this._scanSuccessList.some(item => Object.keys(item)[0] === ip);
            if (!socketExists) {
              this._scanSuccessList.push(scanSuccess);
            }
            // console.log('扫描成功webSocketd对象列表：', this._scanSuccessList);
            if (this._deviceName) {
              // 添加数据
              this._deviceName[data.name] = {
                name: data.Name,
                Type: data.Type,
                video: data.video,
                Check: data.Check,
                ip: ip
              }
            } else {
              this._deviceName = {
                [data.name]: {
                  name: data.Name,
                  Type: data.Type,
                  video: data.video,
                  Check: data.Check,
                  ip: ip
                },
              };
            }
            let info = {
              Name: data.Name,
              Type: data.Type,
              video: data.video,
              Check: data.Check,
              ip: ip,
              ai_api_key: data.ai_api_key,
            };
            // 判断是否已经存在相同的 info
            const exists = this._scanedDevices.some(device =>
              device.Name === info.Name &&
              device.Type === info.Type &&
              device.video === info.video &&
              device.Check === info.Check &&
              device.ip === info.ip &&
              device.ai_api_key === info.ai_api_key
            );

            // 如果不存在，则推入新对象
            if (!exists) {
              this._scanedDevices.push(info);
              // console.log('扫描设备列表：', this._scanedDevices);
            }
            this._runtime.emit(
              this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
              // this._deviceName
              this._scanedDevices
            );
            // this._info = info;
            if (this._PING_PONG_TYPE_LIST.indexOf(info.Type) !== -1) {
              this._isPingPongType = true;
            }
            // socket.close();
          }
        } catch (error) {
          console.error('解析服务器消息时出现错误:', error);
        }
      };

      // 当连接关闭时触发
      socket.onclose = (event) => {
        this._clickConnect = false;
        cleanup();
        // console.log('WebSocket 连接已关闭');
      };

      // 当发生错误时触发
      socket.onerror = (error) => {
        // console.error('WebSocket 错误：', error);
        cleanup();
        socket.close();
        reject(error);
      };

      // 设置超时时间，超时则关闭连接并进行下一次连接
      timerId = setTimeout(() => {
        console.log('WebSocket 连接超时', url);
        cleanup(); // 清理定时器和 WebSocket 连接
        socket.close();
        reject(new Error('WebSocket 连接超时'));
      }, timeout);
    });
  }
  // 连接设备
  connectToDevice(url) {
    this.stopSendPing();
    console.log("开始连接设备：", url, this._scanSuccessList);
    // let ip = url.split("//")[1].split(":")[0];
    let ip = url;
    const socketObj = this._scanSuccessList.find(obj => obj[ip] !== undefined);
    // 关闭其它socket
    for (let i = 0; i < this._scanSuccessList.length; i++) {
      const item = this._scanSuccessList[i];
      const itemIp = Object.keys(item)[0];
      if (itemIp !== ip) {
        const socket = item[itemIp];
        if (socket) {
          console.log("socket已存在，关闭socket")
          socket.close();
          delete item[itemIp];
        }
      }
    }
    if (this.socket) {
      console.log("socket已存在，关闭socket")
      this.stopHeartbeat();
      this.stopSendPing();
      this.socket.close();
      this.socket = null;
      this._waitingPong = false;
    }
    this._clickConnect = true;
    // 连接新设备
    const socket = socketObj[ip];
    this.socket = socket;
    console.log('已连接设备：', url);
    const matchedDevice = this._scanedDevices.find(device => device.ip === ip); // 找到匹配的设备
    const newVideo = `http://${url}:9000/mjpg`
    matchedDevice.video = newVideo;
    this._info = matchedDevice;
    // 保存连接成功的IP
    const historyIp = JSON.parse(localStorage.getItem("historyIp"));
    if (!historyIp) {
      const historyIp = [];
      historyIp.push(ip);
      localStorage.setItem("historyIp", JSON.stringify(historyIp));
    } else {
      // 判断是否已经存在
      if (!historyIp.includes(ip)) {
        historyIp.push(ip);
        localStorage.setItem("historyIp", JSON.stringify(historyIp));
      }
    }

    setTimeout(() => {
      this._isConnected = true;
      this._manualDisconnect = false;
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
      this._isStarted = true; // 开始发送数据
      this.start();
      this.startHeartbeat();
    }, 0);


    // 当接收到服务器发送的消息时触发
    socket.onmessage = (event) => {
      let message = event.data;
      this._dataReceiveState = true;
      this._pingTimer = null;

      if (typeof (message) == "string" && message.substring(0, 4) != "pong") {
        try {
          // 拿DATA+后面的数据
          const prefix = 'DATA+';
          if (message.startsWith(prefix)) {
            const jsonStr = message.slice(prefix.length);
            message = JSON.parse(jsonStr);
          } else {
            console.log("不是DATA+开头的字符串：", message);
            message = JSON.parse(message);
          }

          // console.log('收到字符串：', message);
          if (message.Name && message.video) {
            const ipRegex = /\/\/([^\s\/:]+)(?::\d+)?/;
            let match = url.match(ipRegex);
            message.ip = match ? match[1] : "";
            this._info = message;
          }
          if (message.state && message.state === "OK") {
            console.log("Wifi修改成功！");
          }
          if (message.state && message.ip) {
            this._staIp = {
              StaIp: message.ip,
            }
            console.log("设备连接wifi成功！", this._staIp);
          }
          if (message.state && message.errors.length > 0) {
            console.log("设置失败：", message.errors[0]);
            this._setWifiState = message.errors[0];
            this._staIp = null;
          }
          if (message.state && message.networks) {
            this._networks = message.networks;
          }

          if (message.io_data) {
            this._receivedData = message.io_data;
            // console.log("webSocket收到的数据：", this._receivedData);
            this._onReceive(message.io_data);
          }
          return message;
        } catch (error) {
          return;
        }
      } else if (typeof (message) == "string" && message.substring(0, 4) === "pong") {
        console.log("收到 pong");
        this._waitingPong = false;
        clearTimeout(this._pongTimer);
        return;
      }
      else {
        // console.log('收到其他：', message);
        this._receivedData = this._onReceive(message);
        // console.log("收到的数据：", this._receivedData);
      }
    };

    // 当连接关闭时触发
    socket.onclose = (event) => {
      this._isConnected = false;
      this._isStarted = false;
      this._networks = null;
      this._setWifiState = null;
      this._staIp = null;
      this._clickConnect = false;
      // if (event.code === 1000) {
      console.log('WebSocket 连接已关闭!!!!!!');
      this.stopHeartbeat();
      this.stopSendPing();
      // 修改block连接UI
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
      // 弹窗提示连接中断
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
        message: `Lost connection to`,
        extensionId: this._extensionId
      });
      if (!this._manualDisconnect) {
        this.reconnect();
      }
      // } else {
      //   console.log('设备没电或设备主动断开连接');
      // }
    };

    // 当发生错误时触发
    socket.onerror = (error) => {
      this._isConnected = false;
      this._isStarted = false;
      this.stopSendPing();
      console.error('WebSocket 错误：', error);
    };
  }

  /**
     * @return {bool} whether the peripheral is connected.
     */
  isConnected = () => {
    return this._isConnected;
  }

  // 重新连接
  reconnect() {
    console.log("开始重连");
    if (this._manualDisconnect) return;
    if (this._reconnectCount < 3) {
      if (!this._isConnected) {
        const ip = `ws://${this._info.ip}:30102`
        this.connectToDevice(ip);
      }
      this._reconnectCount++;
    } else {
      console.log("重连失败");
      this._reconnectCount = 0;
      this._isConnected = false;
    }
  }

  start() {
    if (!this._isConnected) {
      console.warn("连接未建立，无法发送数据");
      return;
    }
    const DATA_SEND_INTERVAL = this._DATA_SEND_INTERVAL;

    this._sendTimer = setInterval(() => {
      if (!this._isStarted) {
        // console.log("发送任务已停止");
        return;
      }
      if (!this._isConnected) {
        console.log("连接断开，无法发送数据");
        clearInterval(this._sendTimer);
        this._sendTimer = null;
        return;
      }
      try {
        if (this._payload) {
          // console.log("发送数据:", this._payload);
          this.send(this._payload);
          if (this.clear_after_send) {
            this._payload = {};
          }
          // this._ws.send(this._payload);
        } else {
          this._payload = {};
          this.send(this._payload);
        }
      } catch (err) {
        console.error("发送失败:", err);
      }
    }, DATA_SEND_INTERVAL);
  }

  // 停止发送数据
  stop() {
    this._isStarted = false;
    if (this._sendTimer) {
      clearInterval(this._sendTimer);
      this._sendTimer = null;
    }
  }

  send(data) {
    // console.log("发送数据：", data);
    if (this.socket.readyState !== 1) {
      return;
    }

    if (data instanceof ArrayBuffer) {
      this.socket.send(data);
    } else if (typeof (data) == "object") {
      if (Object.keys(data).length > 0) {
        console.log("发送数据：", data);
      }
      data = JSON.stringify(data);
      let newData = this.DATA_SEND_FIELD + data;
      // console.log("发送数据：", newData);
      this.socket.send(newData);
    }
    else {
      this.socket.send(data);
    };
  }

  scan(deviceIp) {
    // 状态检查
    if (this._isScanning) {
      console.log('扫描正在进行中...');
      return;
    }

    // 重置状态
    this._isScanning = true;
    this._info = null;
    this._deviceName = null;
    this._webSocketObjList = [];

    // 关闭现有连接
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.stopScanAndCloseSockets();

    // 验证IP格式
    const ipParts = deviceIp.split('.');
    if (!ipParts || ipParts.length !== 4) {
      console.error('Invalid IP format');
      this._isScanning = false;
      return;
    }
    // 重置停止标志
    this._shouldStopScan = false;
    const timeout = 5000;
    const BATCH_SIZE = 50;
    let currentBatch = 0;

    const processBatch = () => {
      if (this._shouldStopScan) {
        console.log('扫描已停止');
        this._isScanning = false;
        return;
      }

      const promises = [];
      const start = currentBatch * BATCH_SIZE + 1;
      const end = Math.min(start + BATCH_SIZE, 256);

      for (let i = start; i < end; i++) {
        const ip = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${i}`;
        // this._webSocketObjList.push(
        promises.push(
          this.testConnect(`ws://${ip}:30102`, timeout)
            .then(() => ip)
            .catch(() => null)
        );
      }

      // Promise.all(this._webSocketObjList)
      Promise.all(promises)
        .then(results => {
          // 处理当前批次结果
          results.forEach(ip => {
            if (ip) {
              console.log('发现设备:', ip);
            }
          });

          // 检查是否需要处理下一批
          currentBatch++;
          if (currentBatch * BATCH_SIZE < 255 && !this._deviceName) {
            processBatch();
          } else {
            // 扫描完成
            console.log('扫描完成！');
            if (this._deviceName) {
              this._runtime.emit(
                this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
                // this._deviceName
                this._scanedDevices
              );
            } else {
              this._runtime.emit(
                this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT
              );
            }
            this._isScanning = false;
          }
        })
        .catch(error => {
          console.error('批次扫描错误:', error);
          this._runtime.emit(
            this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT
          );
          this._isScanning = false;
        });
    };

    // 开始第一批扫描
    processBatch();
  }

  stopScan() {
    if (this._isScanning) {
      this._shouldStopScan = true; // 设置停止标志
      console.log('停止扫描请求已发出');
    } else {
      console.log('没有正在进行的扫描');
    }
  }

  // 断开所有扫描连接
  stopScanAndCloseSockets() {
    this._shouldStopScan = true;
    this._isScanning = false;

    if (this._activeSockets && this._activeSockets.length > 0) {
      for (const socket of this._activeSockets) {
        try {
          socket.close();
        } catch (e) {
          console.warn('关闭 WebSocket 失败:', e);
        }
      }
    }

    this._activeSockets = [];
    this._webSocketObjList = [];
    this._scanSuccessList = [];
    console.log('已手动停止扫描并关闭所有 WebSocket');
  }

  // 心跳检测
  startHeartbeat() {

    this.stopHeartbeat();

    this._waitingPong = false;

    this._heartbeatTimer = setInterval(() => {

      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.log("socket未连接，停止心跳");
        this.stopHeartbeat();
        this.stopSendPing();
        return;
      }

      // 如果上一次 ping 还没收到 pong，跳过本次 ping，等待超时或响应
      if (this._waitingPong) {
        return;
      }

      try {

        console.log("发送 ping");

        this._waitingPong = true;

        this.socket.send("ping");

        // 启动 pong 超时检测
        clearTimeout(this._pongTimer);

        this._pongTimer = setTimeout(() => {

          if (this._waitingPong) {

            console.log("pong超时，关闭连接", this.socket);

            if (this.socket) {
              this.socket.close();
              this._isConnected = false;
              this._isStarted = false;
              this._networks = null;
              this._setWifiState = null;
              this._staIp = null;
              this._clickConnect = false;
              this.socket = null;
              // if (event.code === 1000) {
              console.log('pong超时,WebSocket 连接已关闭!!!!!!');
              this.stopHeartbeat();
              this.stopSendPing();
              // 修改block连接UI
              this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
              // 弹窗提示连接中断
              this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
                message: `Lost connection to`,
                extensionId: this._extensionId
              });
              if (!this._manualDisconnect) {
                this.reconnect();
              }
            }

          }

        }, this._pongTimeout);

      } catch (err) {

        console.log("ping发送失败", err);

      }

    }, this._heartbeatInterval);
  }

  // 停止心跳检测
  stopHeartbeat() {

    clearInterval(this._heartbeatTimer);
    clearTimeout(this._pongTimer);

    this._heartbeatTimer = null;
    this._pongTimer = null;
    this._waitingPong = false;
  }

  // 发送ping
  sendPing(socket) {
    if (this._pingTimer) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      this._pingTimer = setInterval(() => {
        socket.send("ping");
      }, this._pingTimeout);
    } else {
      this.stopSendPing();
    }
  }

  stopSendPing() {
    if (this._pingTimer) {
      clearInterval(this._pingTimer);
      this._pingTimer = null;
    }
  }
  // 给数据添加长度校准验证
  addLengthCheck() {
    // 长度校验， 长度预设4位0开头的数字字符串。
    // 先添加长度校验参数
    data["Len"] = "0000";
    // 计算字符串总长
    let string_ = JSON.stringify(data);
    // 把长度值转字符串，并且不足4位，在前面补0
    let len = string_.length;
    let lenString = len.toString();
    while (lenString.length < 4) lenString = "0" + lenString;
    // 补零候，重新赋值到数据对象
    data["Len"] = lenString;
    return data;
  }

  // 获取手机的WiFi信息
  getDeviceIp() {
    return new Promise((resolve, reject) => {
      if (window.testDeviceIP) {
        resolve({ ip: window.testDeviceIP });
        return;
      }
      networkinterface.getWiFiIPAddress(resolve, reject);
    });
  }

  /**
   * Get device name.
   */
  getPeripheralName = () => {
    return this._info.Name;
  }

  autoConnect() {
    const ipList = JSON.parse(localStorage.getItem("historyIp"));
    if (ipList) {
      for (let i = 0; i < ipList.length; i++) {
        const ip = ipList[i];
        this.testConnect(`ws://${ip}:30102`, 5000)
          .then(() => {
            console.log('连接成功');
            return true;
          })
          .catch(() => {
            console.log('连接失败');
            return false;
          });
      }
    }



    if (window.cordova) {
      this.getDeviceIp()
        .then((deviceIP) => {
          console.log('deviceIP.ip', deviceIP);
          if (this.socket) {
            this.socket.close();
          }
          return this.scan(deviceIP.ip);
        })
        .catch((error) => {
          console.log('获取设备IP时出现错误:', error);
        });
    } else {
      if (this.socket) {
        this.socket.close();
      }
      // this.scan("192.168.4.1");
      // this.scan("192.168.100.1");
      let ip = localStorage.getItem("ip") ? localStorage.getItem("ip") : "192.168.4.1";
      this.scan(ip);
    }
  }

  // 手动断开连接
  disconnect() {
    if (this.socket) {
      this._clickConnect = false;
      this.socket.close();
      this.socket = null;
      this._isConnected = false;
      this._isPingPongType = false;
      this._isStarted = false;
      this._manualDisconnect = true;
      this._reconnectCount = 0;
      this.stopSendPing();
      clearInterval(this._sendTimer);
      clearInterval(this._keepAliveTimeout);
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
      console.log('已手动断开连接');
    }
  }

  // 设置WiFi
  setDeviceWifi = (data) => {
    if (this._isConnected) {
      console.log("setDeviceWifi", data)
      this._setWifiState = null;
      if (data.staSsid && data.staPassword) {
        this._staIp = null;
      }
      let newData = JSON.stringify(data);
      newData = this.SET_DEVICE_FIELD + newData;
      this.send(newData);
    } else {
      console.error('WebSocket 处于非 OPEN 状态。无法启动。');
    }
  }

  // 暂停发送数据
  setSendDataState = (state) => {
    this._isStarted = state;
  }

  /**
     * 打开移动设备WiFi设置
  */
  openMobileDeviceWifi = () => {
    if (window.cordova && window.cordova.plugins.settings) {
      window.cordova.plugins.settings.open("wifi", function () {
        console.log('opened settings');
      },
        () => {
          console.log('打开失败');
        }
      );
    } else {
      console.log('openNativeSettingsTest is not active!');
    }
  }



  /**
   * Get device info.
   */
  getDeviceInfo = () => {
    return this._info;
  }

  getWebSocketData = () => {
    return this;
  }

  // Get WiFi IP
  getDeviceWifiIp = () => {
    console.log("this._staIp", this._staIp)
    return this._staIp;
  }
}

module.exports = webSocket;