/**
 * Web BLE
 * 
 * Web bluetooth API wrap
 * 
 * 
 * 这个代码很奇葩，这里做下记录。
 * 
 * 1. Scratch的连接流程是这样的：
 *      1. 实例化WebBle对象时就要触发搜索，
 *      2. 搜索的结果通过`this._runtime.emit`发送`PERIPHERAL_LIST_UPDATE`事件给Scratch VM，
 *      3. Scratch VM收到事件后，给到GUI显示设备列表
 *      4. 用户在设备列表中选择设备，点击连接
 *      5. 连接事件触发`connectPeripheral`函数来连接设备
 * 
 * 2. 由于网页有安全限制，需要用户在浏览器上给连接设备权限给网页，所以设备列表和选择设备需要在浏览器端实现
 *     因此，下面的`navigator.bluetooth.requestDevice`的回调函数是直接连接设备，因为用户已经在浏览器上选择
 *     了设备，相当于上面的步骤跳过了2，3，4步。网页也根本拿不到设备列表，只能拿到最后用户选择的设备。
 * 
 * 3. 而Electron作为一个Chromium内核的桌面应用，本质和浏览器是一样的，但他把蓝牙设备选择的部分留给了用户实现
 *      而我们又为了统一桌面应用和移动端应用的一致性，所以决定用Scratch自带的蓝牙设备选择界面。又因为，Web Bloetooth
 *      的连接是不能直接通过设备ID连接的，应该也是为了安全，必须要用户选择设备后，由`navigator.bluetooth.requestDevice`
 *      的回调返回因此就有了以下
 *      奇怪的实现流程：
 *      1. 实例化WebBle对象时就要触发搜索，这里没有变，而且和浏览器一样，`navigator.bluetooth.requestDevice`
 *          的回调函数是直接连接设备。
 *      2. Electron那边在`mammoth-coding\platforms\electron\platform_www\cdv-electron-main.js`中，`select-bluetooth-device`
 *          的触发事件中，会触发`onBluetoothDevicesFound`事件，这个事件会把设备列表发送给网页。这里用的是
 *          ElectronAPP和网页之间的通信方式。
 *      3. 在`mammoth-coding\platforms\electron\platform_www\cdv-electron-preload.js`中收到了设备列表，会触发，再
 *          通过触发自定义事件`onBluetoothDevicesFound`发送给网页。
 *      4. 在`scratch-vm\src\io\webBle.js`中监听了`onBluetoothDevicesFound`事件，收到设备列表后，通过`this._onDiscoverDevice`
 *          函数把设备列表，通过“this._runtime.emit”发送“PERIPHERAL_LIST_UPDATE”事件给Scratch VM，
 *      5. 这样Scratch GUI页面就呈现了设备列表，和园本的流程一样
 *      6. 在用户选择设备，点击连接后，触发`connectPeripheral`函数，函数再触发`onBluetoothDeviceSelected`事件，把需要连接的ID传给Electron
 *      7. 传给Electron的方法还是需要先经过`mammoth-coding\platforms\electron\platform_www\cdv-electron-preload.js`，监听`onBluetoothDeviceSelected`
 *          事件，然后再通过ipcRenderer.send发送给Electron APP。
 *      8. 在`mammoth-coding\platforms\electron\platform_www\cdv-electron-main.js`中, 通过`ipcMain.on` `onBluetoothDeviceSelected`事件
 *          接收到ID，再通过`bluetoothDeviceSelected`把`BluetoothDevice`对象返回给`navigator.bluetooth.requestDevice`的回调函数。
 *      9. 这样就完成了连接设备的流程。
 */

const formatMessage = require("format-message");

// 设定是否使用模拟的notify方式，因为目前测试无法使用原生notify
let VIRTUAL_NOTIFY = true;

class WebBle {
    /**
     * A BLE peripheral socket object.  It handles connecting, over web sockets, to
     * BLE peripherals, and reading and writing data to them.
     * @param {Runtime} runtime - the Runtime for sending/receiving GUI update events.
     * @param {string} extensionId - the id of the extension using this socket.
     * @param {object} peripheralOptions - the list of options for peripheral discovery.
     * @param {object} connectCallback - a callback for connection.
     * @param {object} resetCallback - a callback for resetting extension state.
     */
    constructor(runtime, extensionId, peripheralOptions, connectCallback, resetCallback = null) {
        this._runtime = runtime;
        this._extensionId = extensionId;
        this._peripheralOptions = peripheralOptions;
        this._connectCallback = connectCallback;
        this._resetCallback = resetCallback;
        this._connected = false;
        this._availablePeripherals = {};
        this._deviceId = null;
        this._deviceName = null;
        this._bleServer = null;
        this._scanStarted = false;
        this._services = {};

        //  Electron的奇葩实现
        if (navigator.userAgent.indexOf("Electron/") > 0) {
            document.addEventListener('onBluetoothDevicesFound', (event) => {
                let deviceList = event.detail;
                this._onDiscoverDevice(deviceList);
            })
        }
        
        navigator.bluetooth.requestDevice(peripheralOptions).then(this.connectDevice, this._onScanError);
        this._scanStarted = true;
        

        // 现在notify不支持，所以写一个定时器，每隔一段时间读取一次，来模拟notify
        if (VIRTUAL_NOTIFY) {
            this._onCharacteristicChangedCallbacks = {};
            this._onCharacteristicChangedTimer = null;
        }
    }

    /**
     * Scan callback for BLE peripheral discovery.
     * @param {array} deviceList - the discovered peripheral.
     */
    _onDiscoverDevice = (deviceList) => {
        if (deviceList && deviceList.length <= 0) {
            return;
        }
        deviceList.forEach(device => {
            this._availablePeripherals[device.deviceId] = {
                "peripheralId": device.deviceId,
                "name": device.deviceName || formatMessage({
                    id: "ble.unknownDevice",
                    default: "Unknown Device",
                    description: "Name of an unknown BLE device"
                }),
                "rssi": device.rssi,
            };
        });
        this._runtime.emit(
            this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
            this._availablePeripherals
        );
    }

    /**
     * Error callback for BLE peripheral discovery.
     * @param {object} error - the error object.
     */
    _onScanError = (error) => {
        console.warn(error);
        if (error.code === 8) {
            return;
        }
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: error,
            extensionId: this._extensionId
        });
    }

    cancelScan = () => {
        if (navigator.userAgent.indexOf("Electron/") > 0) {
            const event = new CustomEvent('onCanceledBluetoothDevice', { detail: "Canceled" });
            document.dispatchEvent(event);
        }
        this._scanStarted = false;
    }

    /**
     * 当网页内部设备列表上点击连接设备时， 触发这个函数。Electron的特殊情况，需要把设备id传给Electron
     * Electron再生成一个BluetoothDevice对象，返回到navigator.bluetooth.requestDevice，并在那里回调
     * connectDevice来连接设备。
     * @param {number} id - BluetoothDevice Object
     */
    connectPeripheral = (id) => {
        const event = new CustomEvent('onSelectedBluetoothDevice', { detail: id });
        document.dispatchEvent(event);
    }

    _startNotifyTimer = () => {
        // 现在notify不支持，所以写一个定时器，每隔一段时间读取一次，来模拟notify
        this._onCharacteristicChangedTimer = setInterval(() => {
            for (let service in this._onCharacteristicChangedCallbacks) {
                for (let characteristic in this._onCharacteristicChangedCallbacks[service]) {
                    this.read(service, characteristic).then((data) => {
                        for (let callback of this._onCharacteristicChangedCallbacks[service][characteristic]) {
                            callback(data);
                        }
                    });
                }
            }
        }, 100);
    }

    /**
     * Connect the device
     * @param {BluetoothDevice} device - BluetoothDevice Object
     */
    connectDevice = (device) => {
        let onConnected = (server) => {
            this._bleServer = server;
            this._connected = true;
            this._deviceId = device.id;
            this._deviceName = device.name;
            this._scanStarted = false;
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
            this._connectCallback();
            if (VIRTUAL_NOTIFY) {
                this._startNotifyTimer();
            }
        }
        device.addEventListener('gattserverdisconnected', this._handleDisconnectError);
        device.gatt.connect().then(onConnected, this._handleError);
    }

    /**
     * Close the websocket.
     */
    disconnect = () => {
        if (this._connected) {
            this._connected = false;
        }
        if (this.isConnected()) {
            this._bleServer.disconnect();
        }
        if (this._scanStarted) {
            this.cancelScan();
        }
        this._bleServer = null;
        this._deviceId = null;
        this._deviceName = null;
        this._services = {};
        if (VIRTUAL_NOTIFY) {
            this._onCharacteristicChangedCallbacks = {};
            clearInterval(this._onCharacteristicChangedTimer);
        }
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
    }

    /**
     * @return {bool} whether the peripheral is connected.
     */
    isConnected = () => {
        if (this._bleServer) {
            return this._bleServer.connected;
        } else {
            return false;
        }
    }

    /**
     * Get peripheral name
     * @return {string} the peripheral name.
     */
    getPeripheralName = () => {
        return this._deviceName;
    }

    /**
     * Get Service
     * @param {number} serviceId - the ble service to read.
     * @return {Promise} - a promise from the remote read request.
     * @private
     */
    _getService = (serviceId) => {
        return new Promise((resolve, reject) => {
            if (this._services[serviceId]) {
                resolve(this._services[serviceId].service);
            } else {
                this._bleServer.getPrimaryService(serviceId).then((service) => {
                    this._services[serviceId] = {
                        service: service,
                        characteristics: {},
                    };
                    resolve(service);
                }, this._handleError);
            }
        });
    }

    /**
     * Get Characteristic
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to read.
     * @return {Promise} - a promise from the remote read request.
     * @private
     */
    _getCharacteristic = (serviceId, characteristicId) => {
        return new Promise((resolve, reject) => {
            this._getService(serviceId).then((service) => {
                if (this._services[serviceId].characteristics[characteristicId]) {
                    resolve(this._services[serviceId].characteristics[characteristicId]);
                } else {
                    service.getCharacteristic(characteristicId).then((characteristic) => {
                        this._services[serviceId].characteristics[characteristicId] = characteristic;
                        resolve(characteristic);
                    }, this._handleError);
                }
            });
        });
    }
            

    /**
     * Start receiving notifications from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to get notifications from.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote startNotifications request.
     */
    startNotifications = (serviceId, characteristicId, onCharacteristicChanged = null) => {
        return new Promise((resolve, reject) => {
            // 现在notify不支持，所以写一个定时器，每隔一段时间读取一次，来模拟notify
            if (VIRTUAL_NOTIFY) {
                // 模拟notify
                if (!this._onCharacteristicChangedCallbacks[serviceId]) {
                    this._onCharacteristicChangedCallbacks[serviceId] = {};
                }
                if (!this._onCharacteristicChangedCallbacks[serviceId][characteristicId]) {
                    this._onCharacteristicChangedCallbacks[serviceId][characteristicId] = [];
                }
                if (onCharacteristicChanged) {
                    this._onCharacteristicChangedCallbacks[serviceId][characteristicId].push(onCharacteristicChanged);
                }
                resolve();
            } else {
                // 正常做法
                this._getCharacteristic(serviceId, characteristicId).then((characteristic) => {
                    characteristic.startNotifications().then(() => {
                        if (onCharacteristicChanged) {
                            characteristic.addEventListener('oncharacteristicvaluechanged', onCharacteristicChanged);
                            resolve();
                        }
                    }, reject);
                }, reject);
            }
        });
    }

    /**
     * Read from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to read.
     * @param {boolean} optStartNotifications - whether to start receiving characteristic change notifications.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote read request with array data.
     */
    read = (serviceId, characteristicId, optStartNotifications = false, onCharacteristicChanged = null) => {
        if (!this.isConnected()) {
            return Promise.reject('Not connected to a device');
        }
        return new Promise((resolve) => {
            this._getCharacteristic(serviceId, characteristicId).then((characteristic) => {
                if (optStartNotifications) {
                    this.startNotifications(serviceId, characteristicId, onCharacteristicChanged);
                }
                characteristic.readValue().then(dataView => {
                    let arrayBuffer = dataView.buffer;
                    let uint8buffer = new Uint8Array(arrayBuffer);
                    var array = Array.from(uint8buffer);
                    resolve(array);
                }, this._handleDisconnectError);
            }, this._handleDisconnectError);
        });
    }

    /**
     * Write data to the specified ble service.
     * @param {number} serviceId - the ble service to write.
     * @param {number} characteristicId - the ble characteristic to write.
     * @param {array} data - the data to send.
     * @param {boolean} withResponse - if true, resolve after peripheral's response.
     * @return {Promise} - a promise from the remote send request.
     */
    write = (serviceId, characteristicId, data, withResponse = null) => {
        return new Promise((resolve) => {
            let uint8Array = Uint8Array.from(data);
            let arrayBuffer = uint8Array.buffer;
            this._getCharacteristic(serviceId, characteristicId).then((characteristic) => {
                if (withResponse) {
                    characteristic.writeValueWithResponse(arrayBuffer).then(resolve, this._handleDisconnectError);
                } else {
                    characteristic.writeValueWithoutResponse(arrayBuffer).then(resolve, this._handleDisconnectError);
                }
            }, this._handleDisconnectError);
        });
    }

    _handleDisconnectError = (e) => {
        if (!this._connected) return;
        // ignore: GATT operation already in progress.
        if (e.code === 19) {
            return;
        }
        console.warn("_handleDisconnectError", e);

        this.disconnect();

        if (this._resetCallback) {
            this._resetCallback();
        }

        this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
            message: `Lost connection to`,
            extensionId: this._extensionId
        });
    }

    _handleError = (e) => {
        console.warn(e);
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: `Lost connection to`,
            extensionId: this._extensionId
        });
    }
};

module.exports = WebBle;
