/**
 * Cordova ble plugin for iOS.
 * 
 * cordova-plugin-ble-central wrap
 */


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
        if (ble.isConnected(this._peripheralId)) {
            ble.disconnect(this._peripheralId);
        }
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
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
        return new Promise((resolve, reject) => {
            ble.startNotification(this._deviceId, serviceId, characteristicId, onCharacteristicChanged, reject);
            resolve();
        })
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
            if (optStartNotifications) {
                this.startNotifications(serviceId, characteristicId, onCharacteristicChanged);
            }
            ble.read(this._deviceId, serviceId, characteristicId, resolve, reject);
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
        let data = Uint8Array.from(message);
        return new Promise((resolve, reject) => {
            if (withResponse) {
                ble.write(this._deviceId, serviceId, characteristicId, data.buffer, resolve, reject);
            } else {
                ble.writeWithoutResponse(this._deviceId, serviceId, characteristicId, data.buffer, resolve, reject);
            }
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
