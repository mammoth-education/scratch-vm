class webSocket {
  constructor(runtime, extensionId, payload, onReceive) {
    this._runtime = runtime;
    this._extensionId = extensionId;
    this.socket = null;
    this._deviceName = null;
    this._info = null;
    this._devicesWifiData = null;
    this._manualDisconnect = false; //手动断开连接
    this._payload = payload; //需要发送的数据
    this._onReceive = onReceive; //将接收到的数据进行转换
    this._receivedData = null; //接收到的数据
    this.autoConnect();
    // this._onSend();
    this._clickConnect = false;
    this._historyWSObject = [];
    this._timeoutList = [];
    this._CONNECTION_TIMEOUT_OUT = 10000;  // 连接超时时间
    this._scanWSObj = {};
    this._isManualDisconnect = false; //是否手动断开连接
    this._scanedDevices = [], //扫描出来的设备
      this._reconnectCount = 0; //重连次数
    this._sendTimer = null;
    this._DATA_SEND_INTERVAL = 100; //发送数据间隔时间
    this._keepAliveInterval = null;
    this._isConnected = false; //是否连接
    this._isStarted = false; //是否开始发送数据
    this._PING_PONG_SEND_INTERVAL = 500; // 心跳发送间隔
    this._isPingPongType = false;
    this._PING_PONG_TYPE_LIST = [
      "Zeus_Car",
      "Mars Rover",
      "PICO-4WD Car",
      "Nano Sloth",
    ];
    this._keepAliveTimeout = null;
    this._PING_PONG_TIMEOUT = 2000;  // 心跳检测超时时间
    this.SET_DEVICE_FIELD = "SET+";
  }
  setSendPayload(payload) {
    this._payload = payload;
    clearInterval(this._sendTimer);
    if (this._isConnected) {
      this.start();
    }
  }

  // 测试连接
  testConnect(url, timeout, sen) {
    return new Promise((resolve, reject) => {
      if (this._clickConnect) return;
      // 创建 WebSocket 连接
      const socket = new WebSocket(url);
      let timerId = null;

      // 当连接建立时触发
      socket.onopen = () => {
        console.log('WebSocket 连接已建立');
        clearTimeout(timerId);
        // 获取连接的 IP 地址
        resolve();
      };

      // 当接收到服务器发送的消息时触发
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('收到服务器消息：', data);
        // 在这里处理消息
        let ip = event.origin.split("//")[1].split(":")[0];
        if (data != null) {
          this._deviceName = {
            "58:BF:25:1D:82:1A": {
              peripheralId: '58:BF:25:1D:82:1A',
              name: data.Name,
              rssi: -57,
              Type: data.Type,
              video: data.video,
              Check: data.Check,
              ip: ip
            }
          };
          let info = {
            Name: data.Name,
            Type: data.Type,
            video: data.video,
            Check: data.Check,
            ip: ip
          };
          this._runtime.emit(
            this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
            this._deviceName
          );
          this._info = info;
          if (this._PING_PONG_TYPE_LIST.indexOf(info.Type) !== -1) {
            this._isPingPongType = true;
          }
        }
      };

      // 当连接关闭时触发
      socket.onclose = (event) => {
        // console.log('WebSocket 连接已关闭');
      };

      // 当发生错误时触发
      socket.onerror = (error) => {
        // console.error('WebSocket 错误：', error);
        clearTimeout(timerId);
        socket.close();
        reject(error);
      };

      // 设置超时时间，超时则关闭连接并进行下一次连接
      timerId = setTimeout(() => {
        console.log('WebSocket 连接超时');
        socket.close();
        reject(new Error('WebSocket 连接超时'));
      }, timeout);
    });
  }
  // 连接设备
  connectToDevice(url) {
    console.log("connectToDevice", this)
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this._clickConnect = true;
    // 连接新设备
    const socket = new WebSocket(url);
    // socket.onclose = this.onDisconnected();
    socket.binaryType = 'arraybuffer';
    this.socket = socket;
    // 当连接建立时触发
    socket.onopen = () => {
      console.log('已连接设备：', url);
      // 发送数据到服务器
      // if(this.socket){
      //   var intervalId = setInterval(() => {
      //     this.socket.send("{\"P\":true}");
      //   }, 100);
      // }else{
      //   clearInterval(intervalId);
      // }
      // setTimeout(() => {
      //   clearInterval(intervalId);
      // }, 100000);
      this._isConnected = true;
      this._manualDisconnect = false;
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
      this.start();
      if (!this._isStarted) {
        console.log("没有开始发送数据,开始发送ping");
        this.keepAlive();
      }
    };

    // 当接收到服务器发送的消息时触发
    socket.onmessage = (event) => {
      let message = event.data;
      if (typeof (message) == "string" && message.substring(0, 4) != "pong") {
        message = JSON.parse(message);
        console.log('收到字符串：', message);
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
          this._devicesWifiData = {
            StaIp: message.ip,
          }
          console.log("设备连接wifi成功！", this._devicesWifiData);
        }
      } else {
        // console.log('收到其他：', message);
        this._receivedData = this._onReceive(message);
        // console.log("收到的数据：", this._receivedData);
      }
    };

    // 当连接关闭时触发
    socket.onclose = (event) => {
      this._isConnected = false;
      // if (event.code === 1000) {
      console.log('WebSocket 连接已关闭!!!!!!');
      // 修改block连接UI
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
      // 弹窗提示连接中断
      this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
        message: `Lost connection to`,
        extensionId: this._extensionId
      });
      if (this._manualDisconnect) {
        this.reconnect();
      }
      // } else {
      //   console.log('设备没电或设备主动断开连接');
      // }
    };

    // 当发生错误时触发
    socket.onerror = (error) => {
      this._isConnected = false;
      console.error('WebSocket 错误：', error);
    };
  }

  /**
     * @return {bool} whether the peripheral is connected.
     */
  isConnected = () => {
    return this._isConnected;
  }
  pingPongTimeOut() {
    console.warn("ping pong timeout");
    if (this._manualDisconnect || this._reconnectCount == 3) {
      return;
    }
    this.reconnect();
  }

  // 重新连接
  reconnect() {
    console.log("开始重连");
    if (this._manualDisconnect) return;
    if (this._reconnectCount < 3) {
      if (!this._isConnected) {
        ip = `ws://${this._info.ip}:30102`
        this.connectToDevice(ip);
      }
      this._reconnectCount++;
    } else {
      console.log("重连失败");
      this._reconnectCount = 0;
      this._isConnected = false;
    }
  }

  // 开始发送数据
  start() {
    // 每100毫秒发送一次
    this._isStarted = true;
    this._sendTimer = setInterval(() => {
      // let data = { P: true };
      // let send = this.addLengthCheck(data);
      // let string = JSON.stringify(send);
      // 连接建立成功以后，就可以使用这个连接对象通信了
      // send 方法发送数据
      // console.log(`Send Data, reconnectCount: ${WS.reconnectCount}, send count: ${WS.count}`);
      // console.log("发送数据:", this._payload);
      this.send(this._payload);
    }, this._DATA_SEND_INTERVAL);
  }
  onDisconnected() {
    console.error('__onDisconnected__');
  }

  send(data) {
    if (this.socket.readyState !== 1) {
      return;
    }
    this.socket.send(data);
  }

  scan(deviceIp) {
    console.log('扫描！');
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    const timeout = 5000; // 设置超时时间
    const promises = [];
    deviceIp = deviceIp.split('.');
    for (let i = 1; i < 256; i++) {
      let ip = `${deviceIp[0]}.${deviceIp[1]}.${deviceIp[2]}.${i}`;
      let promise = new Promise((resolve, reject) => {
        // this.testConnect(`ws://${ip}:30102`, timeout)
        this.testConnect(`ws://${ip}:30102`, timeout)
          .then(() => resolve(ip), () => resolve(null))
          .catch(() => {
            resolve(null); // 如果连接失败，则返回 null
          });
      });
      promises.push(promise);
    }

    function connectNext(index = 0) {
      if (this._clickConnect && index < promises.length) {
        const promise = promises[index];
        promise
          .then(ip => {
            if (ip) {
              console.log('连接成功：', ip);
            }
            // else {
            //   console.log('连接失败');
            // }
            connectNext(index + 1); // 递归调用，连接下一个设备
          })
          .catch(() => {
            connectNext(index + 1); // 连接失败时也继续连接下一个设备
          });
      } else {
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
        console.log('信息：', this._info, this._deviceName);
        // 将设备名称传给组件中显示
        // this._runtime.emit(
        //   this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
        //   this._deviceName
        // );
      }
    }

    connectNext();
  }

  // 配置长链接的心跳检测
  keepAlive() {
    clearInterval(this._keepAliveInterval);
    this._keepAliveInterval = setInterval(() => {
      if (this._isConnected) {
        // 只有在没有开始时，才会发心跳，开始后因为有数据收发，所以不需要心跳证明已经连接。
        if (!this._isStarted) {
          this.send("ping");
          // console.log("ping, reconnectCount: ",);
        }
      } else {
        console.log("心跳检测断开连接");
        clearInterval(this._keepAliveInterval);
      }
    }, this._PING_PONG_SEND_INTERVAL);
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
      this.scan("192.168.4.1");
      // this.scan("192.168.137.1");
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
      let newData = JSON.stringify(data);
      newData = this.SET_DEVICE_FIELD + newData;
      this.send(newData);
    } else {
      console.error('WebSocket 处于非 OPEN 状态。无法启动。');
    }
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

  // Get WiFi IP
  getDeviceWifiIp = () => {
    console.log("this._devicesWifiData", this._devicesWifiData)
    return this._devicesWifiData;
  }
}


module.exports = webSocket;