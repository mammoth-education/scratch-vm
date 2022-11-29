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
        this._devices = {};
        this._bleServer = null;

        // let services = [];
        // let filters = peripheralOptions.filters
        // for (let i = 0; i < filters.length; i++) {
        //     services = services.concat(filters[i].services);
        // }
        // services = services.concat(peripheralOptions.optionalServices);
        // console.log("Services: ", services);
        console.log("Peripheral Options: ", peripheralOptions);
        navigator.bluetooth.requestDevice(peripheralOptions).then(this._onDiscoverDevice, this._onScanError);
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
        console.log("connectPeripheral: ", id);
        let onConnected = (server) => {
            console.log("connected");
            this._bleServer = server;
            this._connected = true;
            this._deviceId = id;
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
            this._connectCallback();
        }
        let onDisconnected = () => {
            console.log("onDisconnected");
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
        }
        this._devices[id].gatt.connect().then(onConnected, onDisconnected);
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
     * Start receiving notifications from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to get notifications from.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote startNotifications request.
     */
    startNotifications = (serviceId, characteristicId, onCharacteristicChanged = null) => {
        return new Promise((resolve, reject) => {
            console.log("startNotifications: ", this, serviceId, characteristicId);

            this._bleServer.getPrimaryService(serviceId).then(service => {
                service.getCharacteristic(characteristicId).then(characteristic => {
                    characteristic.startNotifications().then(() => {
                        if (onCharacteristicChanged) {
                            characteristic.addEventListener('oncharacteristicvaluechanged', onCharacteristicChanged);
                            resolve();
                        }
                    }, reject);
                }, reject);
            }, reject);
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
        return new Promise((resolve, reject) => {
            console.log("read: ", serviceId, characteristicId);
            this._bleServer.getPrimaryService(serviceId).then(service => {
                service.getCharacteristic(characteristicId).then(characteristic => {
                    if (optStartNotifications) {
                        this.startNotifications(serviceId, characteristicId, onCharacteristicChanged);
                    }
                    characteristic.readValue().then(resolve, reject);
                }, reject);
            }, reject);
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
        return new Promise((resolve, reject) => {
            let data = Uint8Array.from(message);
            this._bleServer.getPrimaryService(serviceId).then(service => {
                service.getCharacteristic(characteristicId).then(characteristic => {
                    if (withResponse) {
                        characteristic.writeValueWithResponse(data.buffer).then(resolve, reject);
                    } else {
                        characteristic.writeValueWithoutResponse(data.buffer).then(resolve, reject);
                    }
                }, reject);
            }, reject);
        });
    }

    _handleError = (e) => {
        console.log(e);
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
    }
};

module.exports = WebBle;
