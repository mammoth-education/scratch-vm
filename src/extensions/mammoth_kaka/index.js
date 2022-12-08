const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const MathUtil = require('../../util/math-util');

let BLE = null;
if (window.cordova) {
    console.log("BLE: cordova");
    BLE = require('../../io/cordovaBle');
} else if (navigator.bluetooth) {
    console.log("BLE: webBle");
    BLE = require('../../io/webBle');
} else {
    console.log("BLE: scratch ble");
    BLE = require('../../io/ble');
}

const DeviceSettings = {
    AnalogResolution: 10,
    PWMResolution: 8,
}
DeviceSettings.PWMMax = 2 ** DeviceSettings.PWMResolution - 1;
DeviceSettings.AnalogMax = 2 ** DeviceSettings.AnalogResolution - 1;

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = `data:image/png;base64,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`;

/**
 * A list of Kaka BLE service UUIDs.
 * @enum
 */
const BLEService = {
    DEVICE_SERVICE: '00001001-2d6f-4fcd-aff9-7e305f8fce48',
    IO_SERVICE: '00002001-2d6f-4fcd-aff9-7e305f8fce48'
};

/**
 * A list of Kaka BLE characteristic UUIDs.
 *
 * Characteristics on DEVICE_SERVICE:
 * - ATTACHED_IO
 * - LOW_VOLTAGE_ALERT
 *
 * Characteristics on IO_SERVICE:
 * - INPUT_VALUES
 * - INPUT_COMMAND
 * - OUTPUT_COMMAND
 *
 * @enum
 */
const BLECharacteristic = {
    ATTACHED_IO: '00001002-2d6f-4fcd-aff9-7e305f8fce48',
    LOW_VOLTAGE_ALERT: '00001003-2d6f-4fcd-aff9-7e305f8fce48',
    INPUT_VALUES: '00002002-2d6f-4fcd-aff9-7e305f8fce48',
    INPUT_COMMAND: '00002003-2d6f-4fcd-aff9-7e305f8fce48',
    OUTPUT_COMMAND: '00002004-2d6f-4fcd-aff9-7e305f8fce48'
};

/**
 * Device Actions
 */
const DeviceAction = {
    CHANGE_NAME: 0x01,
};

/**
 * Enum for Kaka sensor and output types.
 * @readonly
 * @enum {number}
 */
const KakaDevice = {
    Motor: 1,
    Buzzer: 3,
    LED: 4,
    Servo: 5,
    Sound: 6,
    Button: 7,
    SegmentDisplay: 8,
    ColorSensor: 9,
    LightSensor: 10,
    Potentiometer: 11,
    Ultrasonic: 12,
    Digital: 13,
    Analog: 14,
    PWM: 15,
    LTMotor: 16,
};

const KakaAction = {
    DigitalOutput: 1,
    DigitalInput: 2,
    PWMPulseWidthPercent: 3,
    PWMFrequency: 4,
    AnalogInput: 5,
    BuzzerPlayTone: 6,
    BuzzerStop: 7,
    BuzzerPlayToneFor: 8,
    UltrasonicGetDistance: 9,
    SegmentDisplayShowValue: 10,
    SegmentDisplayClear: 11,
    ColorSensorGetColor: 12,
    MotorSetStatus: 13,
    ServoSetAngle: 14,
    LTMotorSetValue: 15,
    GetSoundLevel: 16,
}

const ColorSensorColors = [
    formatMessage({
        id: 'kaka.colorSensor.red',
        default: 'Red',
        description: 'Red color'
    }),
    formatMessage({
        id: 'kaka.colorSensor.orange',
        default: 'Orange',
        description: 'Orange color'
    }),
    formatMessage({
        id: 'kaka.colorSensor.yellow',
        default: 'Yellow',
        description: 'Yellow color'
    }),
    formatMessage({
        id: 'kaka.colorSensor.green',
        default: 'Green',
        description: 'Green color'
    }),
    formatMessage({
        id: 'kaka.colorSensor.cyan',
        default: 'Cyan',
        description: 'Cyan color'
    }),
    formatMessage({
        id: 'kaka.colorSensor.blue',
        default: 'Blue',
        description: 'Blue color'
    }),
    formatMessage({
        id: 'kaka.colorSensor.purple',
        default: 'Purple',
        description: 'Purple color'
    }),
    formatMessage({
        id: 'kaka.colorSensor.magenta',
        default: 'Magenta',
        description: 'Magenta color'
    }),
];


/**
 * Manage communication with a Kaka peripheral over a Bluetooth Low Energy client socket.
 */
class Kaka {

    constructor(runtime, extensionId) {
        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * The Bluetooth connection socket for reading/writing peripheral data.
         * @type {BLE}
         * @private
         */
        this._ble = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);

        // 读回输入值的缓冲区
        this._valuebuffer = {};
        // 设备id记录
        this._deviceId = 0;
        // 已注册的设备{deviceId: {name: "name", device: KakaDevice, pins: []}}
        this._devices = {};
        this._lastButtonState = {
            0: 1,
            5: 1,
        };

        this.soundLevel = 0;
        this.buttonEvent = {};
        this.stopDevice = {};
        this.stopDevice[KakaDevice.Motor] = this.stopMotor;
        this.stopDevice[KakaDevice.Buzzer] = this.stopBuzzer;
        this.stopDevice[KakaDevice.LTMotor] = this.stopLTMotor;
        this.stopDevice[KakaDevice.SegmentDisplay] = this.stopSegmentDisplay;
    }

    /**
     * Change device name
     * @param {string} name - the name to change.
     */
    changeDeviceName(name) {
        return this._ble.write(BLEService.DEVICE_SERVICE, BLECharacteristic.ATTACHED_IO, [DeviceAction.CHANGE_NAME, name.length, ...name.split('').map(c => c.charCodeAt(0))]);
    }

    /**
     * Stop Motor
     * @param {Object} device - the device object to stop. see this._devices 
     */
    stopMotor(device) {
        let pin = device.pins[0];
        this.setMotorStatus(pin, 0);
    }

    /**
     * Stop Buzzer
     */
    stopBuzzer() {
        this.buzzerStop();
    }

    /**
     * Stop LT Motor
     * @param {Object} device - the device object to stop. see this._devices 
     */
    stopLTMotor(device) {
        let pinA = device.pins[0];
        let pinB = device.pins[1];
        this.setLTMotorValue(pinA, pinB, 0);
    }

    /**
     * Stop Segment Display
     * @param {Object} device - the device object to stop. see this._devices
     */
    stopSegmentDisplay(device) {
        let dio = device.pins[0];
        let clk = device.pins[1];
        this.segmentDisplayClear(dio, clk);
    }

    /**
     * Stop the tone playing and motors on the Kaka peripheral.
     */
    stopAll() {
        if (!this.isConnected()) return;
        for (const deviceId in this._devices) {
            let device = this._devices[deviceId];
            if (this.stopDevice[device.device]) {
                this.stopDevice[device.device](device);
            }
        }
        this.reset();
    }

    /**
     * Called by the runtime when user wants to scan for a Kaka peripheral.
     */
    scan() {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble = new BLE(this._runtime, this._extensionId, {
            filters: [{
                services: [BLEService.DEVICE_SERVICE]
            }],
            optionalServices: [BLEService.IO_SERVICE]
        }, this._onConnect, this.reset);
    }

    /**
     * Called by the runtime when user wants to connect to a certain Kaka peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect(id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * Disconnects from the current BLE socket.
     */
    disconnect() {
        if (this._ble) {
            this._ble.disconnect();
        }

        this.reset();
    }


    /**
     * Reset all the state and timeout/interval ids.
     */
    reset() {
        this._valuebuffer = {};
        this._deviceId = 0;
        this._devices = {};
    }

    /**
     * Called by the runtime to detect whether the Kaka peripheral is connected.
     * @return {boolean} - the connected state.
     */
    isConnected() {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

    /**
     * Write a message to the Kaka peripheral BLE socket.
     * @param {number} uuid - the UUID of the characteristic to write to
     * @param {Array} message - the message to write.
     * @param {boolean} [useLimiter=true] - if true, use the rate limiter
     * @return {Promise} - a promise result of the write operation
     */
    send(uuid, message) {
        if (!this.isConnected()) return Promise.resolve();

        return this._ble.write(
            BLEService.IO_SERVICE,
            uuid,
            message,
        );
    }

    /**
     * Generate a Kaka 'Output Command' in the byte array format
     * (CONNECT ID, COMMAND ID, NUMBER OF BYTES, VALUES ...).
     *
     * This sends a command to the Kaka to actuate the specified outputs.
     *
     * @param  {number} device       - the device to send a command to, see KakaDevice.
     * @param  {number} id           - the id of the input sensor.
     * @param  {array}  pins         - the pins of the device is connected to.
     * @param  {number} action       - the action of the device, see KakaAction.
     * @param  {array}  values       - the list of values to write to the command.
     * @return {array}               - a generated output command.
     */
    generateOutputCommand(device, id, action, pins, values = null,) {
        let command = [
            device,
            id,
            action,
            pins.length,
            ...pins,
            values.length,
            ...values,
        ];
        return command;
    }

    /**
     * Generate a Kaka 'Input Command' in the byte array format
     * (COMMAND ID, COMMAND TYPE, CONNECT ID, TYPE ID, MODE, DELTA INTERVAL (4 BYTES),
     * UNIT, NOTIFICATIONS ENABLED).
     *
     * This sends a command to the Kaka that sets that input format
     * of the specified inputs and sets value change notifications.
     *
     * @param  {number}  device              - the device of input sensor, see KakaDevices.
     * @param  {number}  id                  - the id of the input sensor.
     * @param  {number}  action              - the action of the device, see KakaAction.
     * @param  {array}   pins                - the pins of the input sensor.
     * @return {array}                       - a generated input command.
     */
    generateInputCommand(device, id, action, pins) {
        return [
            device,
            id,
            action,
            pins.length,
            ...pins,
        ];
    }

    /**
     * Sets LED mode and initial color and starts reading data from peripheral after BLE has connected.
     * @private
     */
    _onConnect() {
        console.log("kaka/index.js onConnected");
        // this._ble.startNotifications(
        //     BLEService.IO_SERVICE,
        //     BLECharacteristic.INPUT_VALUES,
        //     this._onMessage
        // );
    }

    /**
     * Process the sensor data from the incoming BLE characteristic.
     * @param {object} base64 - the incoming BLE data.
     * @private
     */
    _onMessage(data) {
        let arraybuffer = data.buffer;
        let uint8buffer = new Uint8Array(arraybuffer);
        let id = uint8buffer[0];
        let valueLength = uint8buffer[1];
        let value = uint8buffer.slice(2, 2 + valueLength);
        // console.log(`device: ${device}, id: ${id}, value: ${value}`);
        this._devices[id].value = value;
    }

    /**
     * Register a device to the Kaka peripheral.
     * @param {number} device   device identifier, see KakaDevice
     * @param {array}  pins     pins of the device
     * @returns {array}         device id and status of registered, true: register success
     */
    _registerDevice(device, pins) {
        let name = `device${device}_${pins}`;
        let id = null;
        if (this._isDeviceRegistered(name)) {
            id = this._getDeviceId(name);
        } else {
            id = this._deviceId++;
            this._devices[id] = {
                device: device,
                name: name,
                value: null,
            };
        }
        return id;
    }

    /**
     * Checkt if the device is registered by name.
     * @param {number} device   device identifier, see KakaDevice
     * @returns {boolean}       true if the device is connected
     */
    _isDeviceRegistered(name) {
        let registered = false;
        for (let id in this._devices) {
            if (this._devices[id].name === name) {
                registered = true;
                break;
            }
        }
        return registered;
    }

    /**
     * Get device id by name.
     * @param {number} device   device identifier, see KakaDevice
     * @returns {number}        id of the device
     */
    _getDeviceId(name) {
        let id = null;
        for (let key in this._devices) {
            if (this._devices[key].name === name) {
                id = Cast.toNumber(key);
                break;
            }
        }
        return id;
    }

    /**
     * Input device read function.
     * @param {number}  device    device identifier, see KakaDevice
     * @param {array}   pins      pins of the device
     * @returns {array} values    value of the device
     */
    _outputDevice(device, action, pins, values) {
        if (!this.isConnected()) return;
        let id = this._registerDevice(device, pins);
        const command = this.generateOutputCommand(
            device,
            id,
            action,
            pins,
            values
        );
        console.log("Command:", command);
        this.send(BLECharacteristic.OUTPUT_COMMAND, command);
    }

    /**
     * Input device read function.
     * @param {number} device  device identifier, see KakaDevice
     * @param {array} pins     pins of the device
     * @returns {any}          value of the device
     */
    _inputDevice(device, action, pins) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected()) reject("Not Connected");
            let id = this._registerDevice(device, pins);
            this._devices[id].value = null;
            const command = this.generateInputCommand(device, id, action, pins);
            this.send(BLECharacteristic.INPUT_COMMAND, command);
            this._ble.read(BLEService.IO_SERVICE, BLECharacteristic.INPUT_VALUES).then(data => {
                let arraybuffer = data.buffer;
                let uint8buffer = new Uint8Array(arraybuffer);
                let receiveID = uint8buffer[0];
                if (receiveID === id) {
                    let valueLength = uint8buffer[1];
                    if (valueLength === 1) {
                        resolve(uint8buffer[2]);
                    } else if (valueLength === 2) {
                        let value = uint8buffer[2] << 8 | uint8buffer[3];
                        resolve(value);
                    } else {
                        reject("Value length error");
                    }
                }
            });
            // this._ble.startNotifications(BLECharacteristic.INPUT_VALUES, this._onMessage);
            // let interval = setInterval(() => {
            //     if (this._devices[id].value !== null) {
            //         clearInterval(interval);
            //         this._ble.stopNotifications(BLECharacteristic.INPUT_VALUES);
            //         resolve(this._devices[id].value);
            //     }
            // }, 10);
        });
    }

    /**
     * Digital output.
     * @param {number} pin - the pin to write to.
     * @param {number} value - the value to write.
     */
    setDigitalOutput(pin, value) {
        this._outputDevice(KakaDevice.Digital, KakaAction.DigitalOutput, [pin], [value]);
    }

    /**
     * Digital input.
     * @param {number} pin - the pin to read from.
     * @return {number} - the value read.
     */
    getDigitalInput(pin) {
        return this._inputDevice(KakaDevice.Digital, KakaAction.DigitalInput, [pin]);
    }

    /**
     * PWM output.
     * @param {number} pin - the pin to write to.
     * @param {number} value - the value to write, 0~255.
     */
    setPwmOutput(pin, value) {
        if (value > DeviceSettings.PWMMax) {
            value = DeviceSettings.PWMMax;
        }
        this._outputDevice(KakaDevice.PWM, KakaAction.PWMPulseWidthPercent, [pin], [value]);
    }

    /**
     * Analog input.
     * @param {number} pin - the pin to read from.
     * @return {number} - the value read.
     */
    getAnalogInput(pin) {
        return this._inputDevice(KakaDevice.Analog, KakaAction.AnalogInput, [pin]);
        // return new Promise((resolve, reject) => {
        //     this._inputDevice(KakaDevice.Analog, KakaAction.AnalogInput, [pin]).then(value => {
        //         if (DeviceSettings.AnalogMax > 255) {
        //             value = value[0] << 8 | value[1];
        //         }
        //         resolve(value);
        //     }, reject);
        // });
    }

    /**
     * Sound level
     * @returns {number} - the value read.
     */
    getSoundLevel() {
        return new Promise((resolve, reject) => {
            this._inputDevice(KakaDevice.Sound, KakaAction.GetSoundLevel, []).then(value => {
                this.soundLevel = value;
                resolve(value);
            }, reject);
        });
    }

    /**
     * Get button event.
     * @param {number} pin - the pin to read from.
     */
    getButtonEvent(pin) {
        return new Promise((resolve, reject) => {
            this.getDigitalInput(pin).then(value => {
                let result;
                if (value === 0) {        // Pressed
                    result = 1;
                } else if (value === 1) { // Released
                    if (this._lastButtonState[pin] === 1) {
                        result = 0;
                    } else {              // Clicked
                        result = 2;
                    }
                }
                this._lastButtonState[pin] = value;
                console.log(`getButtonEvent pin: ${pin} value: ${value} result: ${result}`)
                this.buttonEvent[pin] = result;
                resolve(result);
            }, reject);
        });
    }

    /**
     * Buzzer Play Tone.
     * @param {number} tone - the tone to play.
     */
    buzzerPlayTone(tone) {
        console.log(`buzzerPlayTone tone: ${tone}`);
        this._outputDevice(KakaDevice.Buzzer, KakaAction.BuzzerPlayTone, [], [tone >> 8, tone & 0xFF]);
    }

    /**
     * Buzzer Play Tone for
     * @param {number} tone - the tone to play.
     * @param {number} duration - the duration to play.
     */
    buzzerPlayToneFor(tone, duration) {
        console.log(`buzzerPlayToneFor tone: ${tone} duration: ${duration}`)
        this._outputDevice(KakaDevice.Buzzer, KakaAction.BuzzerPlayToneFor, [], [tone >> 8, tone & 0xFF, duration >> 8, duration & 0xFF]);
    }

    /**
     * Buzzer Stop Tone.
     */
    buzzerStop() {
        console.log(`buzzerStop`)
        this._outputDevice(KakaDevice.Buzzer, KakaAction.BuzzerStop, [], []);
    }

    /**
     * Ultrasonic Sensor Distance.
     * @param {number} trig - ultrasonic trig pin.
     * @param {number} echo - ultrasonic echo pin.
     */
    ultrasonicDistance(trig, echo) {
        return this._inputDevice(KakaDevice.Ultrasonic, KakaAction.UltrasonicGetDistance, [trig, echo]);
    }

    /**
     * Segment display show a value.
     * @param {number} dio - Segment display echo pin.
     * @param {number} clk - Segment display clk pin.
     * @param {string} value - value to show.
     */
    segmentDisplayShowValue(dio, clk, str) {
        data = []
        for (let i = 0; i < str.length; i++) {
            data.push(str.charCodeAt(i));
        }
        this._outputDevice(KakaDevice.SegmentDisplay, KakaAction.SegmentDisplayShowValue, [dio, clk], data);
    }

    /**
     * Segment display Clear.
     * @param {number} dio - Segment display echo pin.
     * @param {number} clk - Segment display clk pin.
     */
    segmentDisplayClear(dio, clk) {
        this._outputDevice(KakaDevice.SegmentDisplay, KakaAction.SegmentDisplayClear, [dio, clk], []);
    }

    /**
     * Color Sensor Get Color.
     * @param {number} sda - SDA pin
     * @param {number} scl - SCL pin
     */
    colorSensorGetColor(sda, scl) {
        console.log("colorSensorGetColor");
        return this._inputDevice(KakaDevice.ColorSensor, KakaAction.ColorSensorGetColor, [sda, scl]);
    }

    /**
     * Set motor state.
     * @param {number} pin - the pin to write to.
     * @param {number} state - the state to write.
     */
    setMotorStatus(pin, state) {
        this._outputDevice(KakaDevice.Motor, KakaAction.MotorSetStatus, [pin], [state]);
    }

    /**
     * Set servo angle.
     * @param {number} pin - the pin to write to.
     * @param {number} angle - the angle to write(0~180).
     */
    setServoAngle(pin, angle) {
        angle = MathUtil.clamp(angle, 0, 180);
        this._outputDevice(KakaDevice.Servo, KakaAction.ServoSetAngle, [pin], [angle]);
    }

    /**
     * Set LT motor value.
     * @param {number} pinA - the pinA to write to.
     * @param {number} pinB - the pinB to write to.
     * @param {number} value - the value to write(-100~100).
     */
    setLTMotorValue(pinA, pinB, value) {
        value = MathUtil.clamp(value, -100, 100);
        this._outputDevice(KakaDevice.LTMotor, KakaAction.LTMotorSetValue, [pinA, pinB], [value]);
    }

}

/**
 * Scratch 3.0 blocks to interact with a Mammoth Kaka peripheral.
 */
class KakaBlocks {

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID() {
        return 'kaka';
    }

    /**
     * Construct a set of Kaka blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor(runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new Kaka peripheral instance
        this._peripheral = new Kaka(this.runtime,
            KakaBlocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: KakaBlocks.EXTENSION_ID,
            name: 'Kaka',
            blockIconURI: iconURI,
            showStatusButton: true,
            blocks: [
                // setDigitalOutput
                {
                    opcode: 'setDigitalOutput',
                    text: formatMessage({
                        id: 'kaka.setDigitalOutput',
                        default: 'Digital Output [PIN] set to [LEVEL]',
                        description: 'Set a digital output pin to specific level'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalOutputPins',
                            defaultValue: 2
                        },
                        LEVEL: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalOutputLevels',
                            defaultValue: 1
                        }
                    },
                },
                // getDigitalInput
                {
                    opcode: 'getDigitalInput',
                    text: formatMessage({
                        id: 'kaka.getDigitalInput',
                        default: 'Digital Input [PIN]',
                        description: 'Get level of a digital input pin'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalInputPins',
                            defaultValue: 0
                        },
                    },
                },
                // setPwmOutput
                {
                    opcode: 'setPwmOutput',
                    text: formatMessage({
                        id: 'kaka.setPwmOutput',
                        default: 'PWM Output [PIN] set to [VALUE]',
                        description: 'Set a PWM output pin to specific value(0-255)'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'setPwmOutputPins',
                            defaultValue: 2
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    },
                },
                // getAnalogInput
                {
                    opcode: 'getAnalogInput',
                    text: formatMessage({
                        id: 'kaka.getAnalogInput',
                        default: 'Analog Input [PIN]',
                        description: 'Get value of a analog input pin'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'getAnalogInputPins',
                            defaultValue: 13
                        },
                    },
                },
                // mapValue
                {
                    opcode: 'mapValue',
                    text: formatMessage({
                        id: 'kaka.mapValue',
                        default: 'Map [VALUE] from [FROM_LOW]~[FROM_HIGH] to [TO_LOW]~[TO_HIGH]',
                        description: 'Map a value from one range to another'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        FROM_LOW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        FROM_HIGH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        },
                        TO_LOW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        TO_HIGH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255
                        }
                    },
                },
                // When sound level
                {
                    opcode: 'whenSoundLevel',
                    text: formatMessage({
                        id: 'kaka.whenSoundLevel',
                        default: 'When sound level [OP] [LEVEL]',
                        description: 'When sound level is greater than or less than a specific value'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        OP: {
                            type: ArgumentType.STRING,
                            menu: 'soundLevelOps',
                            defaultValue: '>'
                        },
                        LEVEL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 600
                        },
                    },
                },
                // Sound level
                {
                    opcode: 'getSoundLevel',
                    text: formatMessage({
                        id: 'kaka.getSoundLevel',
                        default: 'Sound level',
                        description: 'Get sound level'
                    }),
                    blockType: BlockType.REPORTER,
                },
                // When button pressed/released/clicked
                {
                    opcode: 'whenButton',
                    text: formatMessage({
                        id: 'kaka.whenButton',
                        default: 'When button [BUTTON] [STATE]',
                        description: 'When a button is pressed/released/clicked'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.int,
                            menu: 'buttons',
                            defaultValue: 0
                        },
                        STATE: {
                            type: ArgumentType.int,
                            menu: 'buttonEvents',
                            defaultValue: 1
                        }
                    },
                },
                // Button state
                {
                    opcode: 'getButtonState',
                    text: formatMessage({
                        id: 'kaka.getButtonState',
                        default: 'Button [BUTTON] state',
                        description: 'Get state of a button'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.int,
                            menu: 'buttons',
                            defaultValue: 0
                        },
                    },
                },
                // buzzerPlayNoteFor
                {
                    opcode: 'buzzerPlayNoteFor',
                    text: formatMessage({
                        id: 'kaka.buzzerPlayNoteFor',
                        default: 'play note [NOTE] for [DURATION] ms',
                        description: 'play a certain note for miliseconds'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NOTE: {
                            type: ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    },
                },
                // buzzerStop
                {
                    opcode: 'buzzerStop',
                    text: formatMessage({
                        id: 'kaka.buzzerStop',
                        default: 'buzzer Stop',
                        description: 'Stop the buzzer'
                    }),
                    blockType: BlockType.COMMAND,
                },
                // ultrasonicDistance
                {
                    opcode: 'ultrasonicDistance',
                    text: formatMessage({
                        id: 'kaka.ultrasonicDistance',
                        default: 'Ultrasonic Distance(cm) trig, echo:[PORT]',
                        description: 'Get distance from ultrasonic sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        },
                    },
                },
                // segmentDisplayShowValue
                {
                    opcode: 'segmentDisplayShowValue',
                    text: formatMessage({
                        id: 'kaka.segmentDisplayShowValue',
                        default: 'Segment Display DIO, CLK:[PORT] show [VALUE]',
                        description: 'Show value on segment display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "1234"
                        }
                    }
                },
                // segmentDisplayClear
                {
                    opcode: 'segmentDisplayClear',
                    text: formatMessage({
                        id: 'kaka.segmentDisplayClear',
                        default: 'Segment Display DIO, CLK:[PORT] clear',
                        description: 'Clear segment display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        },
                    }
                },
                // colorSensorGetColor
                {
                    opcode: 'colorSensorGetColor',
                    text: formatMessage({
                        id: 'kaka.colorSensorGetColor',
                        default: 'Color Sensor SCL, SDA[PORT] color',
                        description: 'Get color from Color Sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        },
                    }
                },
                // setMotorStatus
                {
                    opcode: 'setMotorStatus',
                    text: formatMessage({
                        id: 'kaka.setMotorStatus',
                        default: 'Set Motor [PORT] to [ONOFF]',
                        description: 'Set motor state'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        },
                        ONOFF: {
                            type: ArgumentType.NUMBER,
                            menu: 'onOff',
                            defaultValue: 1
                        }
                    }
                },
                // setServoAngle
                {
                    opcode: 'setServoAngle',
                    text: formatMessage({
                        id: 'kaka.setServoAngle',
                        default: 'Set Servo [PIN] to [ANGLE]',
                        description: 'Set Servo to angle'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'servoPins',
                            defaultValue: 15
                        },
                        ANGLE: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 90
                        }
                    }
                },
                // setLTMotorValue
                {
                    opcode: 'setLTMotorValue',
                    text: formatMessage({
                        id: 'kaka.setLTMotorValue',
                        default: 'Set LT Motor [PORT] to [VALUE]',
                        description: 'Set LT Motor state'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ltMotorPorts',
                            defaultValue: "19,18"
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
            ],
            menus: {
                digitalOutputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '2', value: 2 },
                        { text: '13', value: 13 },
                        { text: '14', value: 14 },
                        { text: '26', value: 26 },
                        { text: '33', value: 33 },
                    ]
                },
                digitalInputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '0', value: 0 },
                        { text: '5', value: 5 },
                        { text: '13', value: 13 },
                        { text: '14', value: 14 },
                        { text: '26', value: 26 },
                        { text: '33', value: 33 },
                    ]
                },
                digitalOutputLevels: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'kaka.digitalOutputLevels.high',
                                default: 'HIGH',
                                description: 'Logic level high'
                            }), value: 1
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.digitalOutputLevels.low',
                                default: 'LOW',
                                description: 'Logic level low'
                            }), value: 0
                        },
                    ]
                },
                setPwmOutputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '2', value: 2 },
                        { text: '13', value: 13 },
                        { text: '14', value: 14 },
                        { text: '26', value: 26 },
                        { text: '33', value: 33 },
                    ]
                },
                getAnalogInputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '13', value: 13 },
                        { text: '14', value: 14 },
                        { text: '26', value: 26 },
                        { text: '33', value: 33 },
                    ]
                },
                soundLevelOps: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'kaka.soundLevelOps.gt',
                                default: '>',
                                description: 'Sound level greater than'
                            }), value: '>'
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.soundLevelOps.lt',
                                default: '<',
                                description: 'Sound level less than'
                            }), value: '<'
                        },
                    ]
                },
                buttons: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'kaka.buttons.a',
                                default: 'A',
                                description: 'Button A'
                            }), value: 0
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.buttons.b',
                                default: 'B',
                                description: 'Button B'
                            }), value: 5
                        },
                    ]
                },
                buttonEvents: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'kaka.buttonEvents.pressed',
                                default: 'pressed',
                                description: 'Button pressed'
                            }), value: 1
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.buttonEvents.released',
                                default: 'released',
                                description: 'Button released'
                            }), value: 0
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.buttonEvents.clicked',
                                default: 'clicked',
                                description: 'Button clicked'
                            }), value: 2
                        },
                    ]
                },
                servoPins: {
                    acceptReporters: true,
                    items: [
                        { text: '15', value: 15 },
                        { text: '4', value: 4 },
                        { text: '16', value: 16 },
                        { text: '17', value: 17 },
                    ]
                },
                ports: {
                    acceptReporters: true,
                    items: [
                        { text: '32, 33', value: '32,33' },
                        { text: '25, 26', value: '25,26' },
                        { text: '12, 14', value: '12,14' },
                        { text: '27, 13', value: '27,13' },
                    ]
                },
                ltMotorPorts: {
                    acceptReporters: true,
                    items: [
                        { text: '19, 18', value: '19,18' },
                        { text: '22, 21', value: '22,21' },
                    ]
                },
                onOff: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'kaka.onOff.on',
                                default: 'ON',
                                description: 'Logic on off, on'
                            }), value: 1
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.onOff.off',
                                default: 'OFF',
                                description: 'Logic on off, off'
                            }), value: 0
                        },
                    ]
                },
            }
        };
    }

    setDigitalOutput(args) {
        let pin = Cast.toNumber(args.PIN);
        let level = Cast.toNumber(args.LEVEL);
        this._peripheral.setDigitalOutput(pin, level);
    }

    getDigitalInput(args) {
        let pin = Cast.toNumber(args.PIN);
        return this._peripheral.getDigitalInput(pin);
    }

    setPwmOutput(args) {
        let pin = Cast.toNumber(args.PIN);
        let value = Cast.toNumber(args.VALUE);
        this._peripheral.setPwmOutput(pin, value);
    }

    getAnalogInput(args) {
        let pin = Cast.toNumber(args.PIN);
        return this._peripheral.getAnalogInput(pin);
    }

    mapValue(args) {
        let value = Cast.toNumber(args.VALUE);
        let toLow = Cast.toNumber(args.TO_LOW);
        let toHigh = Cast.toNumber(args.TO_HIGH);
        let fromLow = Cast.toNumber(args.FROM_LOW);
        let fromHigh = Cast.toNumber(args.FROM_HIGH);
        let result = value * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
        return result.toFixed(2)
    }

    whenSoundLevel(args) {
        let level = Cast.toNumber(args.LEVEL);
        this._peripheral.getSoundLevel();
        let soundLevel = this._peripheral.soundLevel;
        console.log('soundLevel', soundLevel)
        if (args.OP === '>') {
            return soundLevel > level;
        } else {
            return soundLevel < level;
        }
        // return new Promise((resolve, reject) => {
        //     this._peripheral.getSoundLevel().then((soundLevel) => {
        //         console.log('soundLevel', soundLevel)
        //         if (args.OP === '>') {
        //             resolve(soundLevel > level);
        //         } else {
        //             resolve(soundLevel < level);
        //         }
        //     }, reject);
        // });
    }

    getSoundLevel() {
        return this._peripheral.getSoundLevel();
    }

    whenButton(args) {
        let pin = Cast.toNumber(args.BUTTON);
        let state = Cast.toNumber(args.STATE);
        this._peripheral.getButtonEvent(pin);
        return this._peripheral.buttonEvent[pin] === state;
    }

    getButtonState(args) {
        let pin = Cast.toNumber(args.BUTTON);
        return this._peripheral.getDigitalInput(pin);
    }

    buzzerPlayNoteFor(args) {
        let note = Cast.toNumber(args.NOTE);
        let duration = Cast.toNumber(args.DURATION) * 1000;
        let tone = this._noteToTone(note);
        this._peripheral.buzzerPlayToneFor(tone, duration);
    }

    buzzerStop() {
        this._peripheral.buzzerStop();
    }

    ultrasonicDistance(args) {
        let trig = Cast.toNumber(args.PORT.split(',')[0]);
        let echo = Cast.toNumber(args.PORT.split(',')[1]);
        return this._peripheral.ultrasonicDistance(trig, echo);
    }

    segmentDisplayShowValue(args) {
        let dio = Cast.toNumber(args.PORT.split(',')[0]);
        let clk = Cast.toNumber(args.PORT.split(',')[1]);
        let value = args.VALUE;
        this._peripheral.segmentDisplayShowValue(dio, clk, value);
    }

    segmentDisplayClear(args) {
        let dio = Cast.toNumber(args.PORT.split(',')[0]);
        let clk = Cast.toNumber(args.PORT.split(',')[1]);
        this._peripheral.segmentDisplayClear(dio, clk);
    }

    colorSensorGetColor(args) {
        let scl = Cast.toNumber(args.PORT.split(',')[0]);
        let sda = Cast.toNumber(args.PORT.split(',')[1]);
        return new Promise((resolve, reject) => {
            this._peripheral.colorSensorGetColor(sda, scl).then(color => {
                resolve(ColorSensorColors[color]);
            }, reject);
        });
    }

    setMotorStatus(args) {
        let pin = Cast.toNumber(args.PORT.split(',')[1]);
        let status = Cast.toNumber(args.ONOFF);
        this._peripheral.setMotorStatus(pin, status);
    }

    setServoAngle(args) {
        let pin = Cast.toNumber(args.PIN);
        let angle = Cast.toNumber(args.ANGLE);
        this._peripheral.setServoAngle(pin, angle);
    }

    setLTMotorValue(args) {
        let pinA = Cast.toNumber(args.PORT.split(',')[0]);
        let pinB = Cast.toNumber(args.PORT.split(',')[1]);
        let value = Cast.toNumber(args.VALUE);
        value = MathUtil.clamp(value, 0, 100);
        this._peripheral.setLTMotorValue(pinA, pinB, value);
    }

    /**
     * @param {number} midiNote - the MIDI note value to convert.
     * @return {number} - the frequency, in Hz, corresponding to that MIDI note value.
     * @private
     */
    _noteToTone(midiNote) {
        // Note that MIDI note 69 is A4, 440 Hz
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
}

module.exports = KakaBlocks;
