/**
 * Cordova ble plugin for iOS.
 * 
 * cordova-plugin-ble-central wrap
 */

const formatMessage = require("format-message");


class CordovaBle {
    /**
     * A BLE peripheral socket object.  It handles connecting, over web sockets, to
     * BLE peripherals, and reading and writing data to them.
     * @param {Runtime} runtime - the Runtime for sending/receiving GUI update events.
     * @param {string} extensionId - the id of the extension using this socket.
     * @param {object} peripheralOptions - the list of options for peripheral discovery.
     * @param {object} connectCallback - a callback for connection.
     * @param {object} resetCallback - a callback for resetting extension state.
     */
     constructor (runtime, extensionId, peripheralOptions, connectCallback, resetCallback = null) {
        this._runtime = runtime;
        this._extensionId = extensionId;
        this._peripheralOptions = peripheralOptions;
        this._connectCallback = connectCallback;
        this._resetCallback = resetCallback;
        this._connected = false;
        this._availablePeripherals = {};
        this._deviceId = null;
        this._deviceName = null;

        let services = [];
        let filters = peripheralOptions.filters
        for (let i = 0; i < filters.length; i++) {
            services = services.concat(filters[i].services);
        }
        services = services.concat(peripheralOptions.optionalServices);

        ble.scan(services, 5, this._onDiscoverDevice, this._onScanError);
    }

    /**
     * Scan callback for BLE peripheral discovery.
     * @param {object} device - the discovered peripheral.
     */
    _onDiscoverDevice = (device) => {
        this._availablePeripherals[device.id] = {
            "peripheralId": device.id,
            "name": device.name || formatMessage({
                id: "ble.unknownDevice",
                default: "Unknown Device",
                description: "Name of an unknown BLE device"
            }),
            "rssi": device.rssi,
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
        let onConnected = () => {
            this._connected = true;
            this._deviceId = id;
            this._deviceName = this._availablePeripherals[id].name;
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
            this._connectCallback();
        }
        let onDisconnected = () => {
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
        }
        ble.connect(id, onConnected, onDisconnected);
    }

    /**
     * Close the websocket.
     */
    disconnect = () => {
        if (this._connected) {
            this._connected = false;
        }
        ble.isConnected(this._deviceId, () => {
            ble.disconnect(this._deviceId);
        });
        this._deviceId = null;
        this._deviceName = null;
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
    }

    /**
     * Get device name.
     */
    getPeripheralName = () => {
        return this._deviceName;
    }

    /**
     * @return {bool} whether the peripheral is connected.
     */
    isConnected = () => {
        return this._connected;
    }

    /**
     * Start receiving notifications from the specified ble service.
     * @param {number} serviceId - the ble service to read.
     * @param {number} characteristicId - the ble characteristic to get notifications from.
     * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
     * @return {Promise} - a promise from the remote startNotifications request.
     */
    startNotifications = (serviceId, characteristicId, onCharacteristicChanged = null) => {
        ble.startNotification(this._deviceId, serviceId, characteristicId, (arrayBuffer) => {
            var uint8buffer = new Uint8Array(arrayBuffer);
            var array = Array.from(uint8buffer);
            onCharacteristicChanged(array);
        }, this._handleDisconnectError);
        return Promise.resolve();
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
            if (optStartNotifications) {
                this.startNotifications(serviceId, characteristicId, onCharacteristicChanged);
            }
            ble.read(this._deviceId, serviceId, characteristicId, (arraybuffer => {
                var uint8buffer = new Uint8Array(arraybuffer);
                var array = Array.from(uint8buffer);
                resolve(array);
            }), this._handleDisconnectError);
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
        let uint8Array = Uint8Array.from(data);
        let arrayBuffer = uint8Array.buffer;
        return new Promise((resolve) => {
            if (cordova.platformId === 'ios') {
                ble.write(this._deviceId, serviceId, characteristicId, arrayBuffer, resolve, this._handleDisconnectError);
            } else {
                ble.writeWithoutResponse(this._deviceId, serviceId, characteristicId, arrayBuffer, resolve, this._handleDisconnectError);
            }
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
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
    }
};

module.exports = CordovaBle;
