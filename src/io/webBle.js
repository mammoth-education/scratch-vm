/**
 * Cordova ble plugin for iOS.
 * 
 * cordova-plugin-ble-central wrap
 */


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
        this._devices = {};
        this._bleServer = null;

        navigator.bluetooth.requestDevice(peripheralOptions).then(this._onDiscoverDevice, this._onScanError);

        // 现在notify不支持，左移写一个定时器，每隔一段时间读取一次，来模拟notify
        this._onCharacteristicChangedCallbacks = {};
        this._onCharacteristicChangedTimer = null;
    }

    /**
     * Scan callback for BLE peripheral discovery.
     * @param {object} device - the discovered peripheral.
     */
    _onDiscoverDevice = (device) => {
        this._devices[device.id] = device;
        this._availablePeripherals[device.id] = {
            "peripheralId": device.id,
        };
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
        console.log("Scan error");
        console.log(error);
    }

    /**
     * Try connecting to the input peripheral id, and then call the connect
     * callback if connection is successful.
     * @param {number} id - the id of the peripheral to connect to
     */
    connectPeripheral = (id) => {
        let onConnected = (server) => {
            this._bleServer = server;
            this._connected = true;
            this._deviceId = id;
            this._deviceName = this._devices[id].name;
            console.log("connected device name: " + this._deviceName);
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
            this._connectCallback();
            // 现在notify不支持，左移写一个定时器，每隔一段时间读取一次，来模拟notify
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
        // let onDisconnected = () => {
        //     console.log("onDisconnected");
        //     this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
        // }
        this._devices[id].addEventListener('gattserverdisconnected', this._handleDisconnectError);
        this._devices[id].gatt.connect().then(onConnected, this._handleError);
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
        this._bleServer = null;
        this._deviceId = null;
        this._deviceName = null;
        this._devices = {};
        this._onCharacteristicChangedCallbacks = {};
        clearInterval(this._onCharacteristicChangedTimer);
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
     * Start receiving notifications from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to get notifications from.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote startNotifications request.
     */
    startNotifications = (serviceId, characteristicId, onCharacteristicChanged = null) => {
        return new Promise((resolve, reject) => {
            // 现在notify不支持，左移写一个定时器，每隔一段时间读取一次，来模拟notify
            // 正常做法
            // this._bleServer.getPrimaryService(serviceId).then(service => {
            //     service.getCharacteristic(characteristicId).then(characteristic => {
            //         characteristic.startNotifications().then(() => {
            //             if (onCharacteristicChanged) {
            //                 characteristic.addEventListener('oncharacteristicvaluechanged', onCharacteristicChanged);
            //                 resolve();
            //             }
            //         }, reject);
            //     }, reject);
            // }, reject);
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
        });
    }

    /**
     * Read from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to read.
     * @param {boolean} optStartNotifications - whether to start receiving characteristic change notifications.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote read request.
     */
    read = (serviceId, characteristicId, optStartNotifications = false, onCharacteristicChanged = null) => {
        return new Promise((resolve) => {
            this._bleServer.getPrimaryService(serviceId).then(service => {
                service.getCharacteristic(characteristicId).then(characteristic => {
                    if (optStartNotifications) {
                        this.startNotifications(serviceId, characteristicId, onCharacteristicChanged);
                    }
                    characteristic.readValue().then(data => {
                        var arraybuffer = data.buffer;
                        var uint8buffer = new Uint8Array(arraybuffer);
                        resolve(uint8buffer);
                    }, this._handleDisconnectError);
                }, this._handleDisconnectError);
            }, this._handleDisconnectError);
        });
    }

    /**
     * Write data to the specified ble service.
     * @param {number} serviceId - the ble service to write.
     * @param {number} characteristicId - the ble characteristic to write.
     * @param {string} message - the message to send.
     * @param {boolean} withResponse - if true, resolve after peripheral's response.
     * @return {Promise} - a promise from the remote send request.
     */
    write = (serviceId, characteristicId, message, withResponse = null) => {
        return new Promise((resolve) => {
            let data = Uint8Array.from(message);
            this._bleServer.getPrimaryService(serviceId).then(service => {
                service.getCharacteristic(characteristicId).then(characteristic => {
                    if (withResponse) {
                        characteristic.writeValueWithResponse(data.buffer).then(resolve, this._handleDisconnectError);
                    } else {
                        characteristic.writeValueWithoutResponse(data.buffer).then(resolve, this._handleDisconnectError);
                    }
                }, this._handleDisconnectError);
            }, this._handleDisconnectError);
        });
    }

    _handleDisconnectError = (e) => {
        if (!this._connected) return;
        // ignore: GATT operation already in progress.
        if (e.code === 19) {
            return;
        }
        console.log("_handleDisconnectError", e);

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
        console.log(e);
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: `Lost connection to`,
            extensionId: this._extensionId
        });
    }
};

module.exports = WebBle;
