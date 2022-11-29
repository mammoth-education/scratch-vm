const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const RateLimiter = require('../../util/rateLimiter.js');

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

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = 'data:image/png;base64,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';

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
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 100;

/**
 * A maximum number of BLE message sends per second, to be enforced by the rate limiter.
 * @type {number}
 */
const BLESendRateMax = 20;

/**
 * Enum for Kaka sensor and output types.
 * @readonly
 * @enum {number}
 */
const KakaDevice = {
    Motor: 1,
    PowerMotor: 2,
    Buzzer: 3,
    LED: 4,
    Servo: 5,
    Microphone: 6,
    Button: 7,
    SegmentDisplay: 8,
    ColorSensor: 9,
    LightSensor: 10,
    Potentiometer: 11,
    Ultrasonic: 12,
    Digital: 13,
    Analog: 14,
    PWM: 15,
};

const KakaVariableType = {
    Boolean: 1,
    Number: 2,
    String: 3,
}

const KakaOutputAction = {
    BuzzerPlayTone: 1,
    BuzzerStop: 2,
    BuzzerPlayToneFor: 3,
    Digital: 4,
    PWM: 6,
}

const KakaInputMode = {
    Digital: 1,
    Analog: 2,
}

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

        /**
         * A rate limiter utility, to help limit the rate at which we send BLE messages
         * over the socket to Scratch Link to a maximum number of sends per second.
         * @type {RateLimiter}
         * @private
         */
        this._rateLimiter = new RateLimiter(BLESendRateMax);

        /**
         * An interval id for the battery check interval.
         * @type {number}
         * @private
         */

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);

        this._valuebuffer = {};
    }

    /**
     * Stop the tone playing and motors on the Kaka peripheral.
     */
    stopAll() {
        if (!this.isConnected()) return;
        this.buzzerStop();
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
    send(uuid, message, useLimiter = true) {
        if (!this.isConnected()) return Promise.resolve();

        if (useLimiter) {
            if (!this._rateLimiter.okayToSend()) return Promise.resolve();
        }

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
     * @param  {number} pin          - the pin of the device is connected to, see KakaPort.
     * @param  {number} action       - the action of the device, see KakaOutputAction.
     * @param  {number} variableType - the variable type of the command, see KakaVariableType.
     * @param  {array}  values       - the list of values to write to the command.
     * @return {array}               - a generated output command.
     */
    generateOutputCommand(device, pin, action, variableType = null, values = null,) {
        let command = [device, pin, action, variableType];
        if (values) {
            command.push(values.length);
            command = command.concat(values);
        }
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
     * @param  {number}  pin                 - the pin of the input sensor.
     * @param  {number}  mode                - the mode of the input sensor, see KakaInputMode.
     * @param  {boolean} enableNotifications - whether to enable notifications.
     * @return {array}                       - a generated input command.
     */
    generateInputCommand(device, pin, mode, enableNotifications = false) {
        const command = [
            device,
            pin,
            mode,
            enableNotifications ? 1 : 0
        ];
        return command;
    }

    /**
     * Sets LED mode and initial color and starts reading data from peripheral after BLE has connected.
     * @private
     */
    _onConnect() {
        console.log("kaka/index.js onConnected");
        this._ble.startNotifications(
            BLEService.IO_SERVICE,
            BLECharacteristic.INPUT_VALUES,
            onCharacteristicChanged = null
        );
    }

    /**
     * Process the sensor data from the incoming BLE characteristic.
     * @param {object} base64 - the incoming BLE data.
     * @private
     */
    _onMessage(data) {
        console.log(data)
    }

    /**
     * Digital output.
     * @param {number} pin - the pin to write to.
     * @param {number} value - the value to write.
     */
    digitalOutput(pin, value) {
        if (!this.isConnected()) return;
        const command = this.generateOutputCommand(
            KakaDevice.Digital,
            pin,
            KakaOutputAction.DigitalOutput,
            KakaVariableType.Boolean,
            [value]
        );
        this.send(KakaCharacteristic.Output, command);
    }

    /**
     * Digital input.
     * @param {number} pin - the pin to read from.
     * @return {number} - the value read.
     */
    digitalInput(pin) {
        let valuebufferName = "digitalInput_" + pin;
        if (this._valuebuffer[valuebufferName] === undefined) {
            this._valuebuffer[valuebufferName] = 0;
            if (!this.isConnected()) return 0;
            const command = this.generateInputCommand(
                KakaDevice.Digital,
                pin,
                KakaInputMode.Digital);
            this.send(KakaCharacteristic.Input, command);
        }
        return this._valuebuffer[valuebufferName];
    }

    /**
     * PWM output.
     * @param {number} pin - the pin to write to.
     * @param {number} value - the value to write.
     */
    pwmOutput(pin, value) {
        if (!this.isConnected()) return;
        const command = this.generateOutputCommand(
            KakaDevice.PWM,
            pin,
            KakaOutputAction.PWM,
            KakaVariableType.Number,
            [value]
        );
        this.send(KakaCharacteristic.Output, command);
    }

    /**
     * Buzzer Play Tone.
     * @param {number} tone - the tone to play.
     */
    buzzerPlayTone(tone) {
        if (!this.isConnected()) return;
        console.log(`buzzerPlayTone tone: ${tone}`)
        let cmd = this.generateOutputCommand(
            KakaDevice.Buzzer,
            null,
            KakaOutputAction.BuzzerPlayTone,
            KakaVariableType.Number,
            [tone >> 8, tone & 0xFF]
        );
        console.log(`buzzerPlayTone command: ${cmd}`)
        this.send(BLECharacteristic.OUTPUT_COMMAND, cmd);
    }

    /**
     * Buzzer Play Tone for
     * @param {number} tone - the tone to play.
     * @param {number} duration - the duration to play.
     */
    buzzerPlayToneFor(tone, duration) {
        if (!this.isConnected()) return;
        console.log(`buzzerPlayToneFor tone: ${tone} duration: ${duration}`)
        let cmd = this.generateOutputCommand(
            KakaDevice.Buzzer,
            null,
            KakaOutputAction.BuzzerPlayToneFor,
            KakaVariableType.Number,
            [tone >> 8, tone & 0xFF, duration >> 8, duration & 0xFF]
        );
        console.log(`buzzerPlayToneFor command: ${cmd}`)
        this.send(BLECharacteristic.OUTPUT_COMMAND, cmd);
    }

    /**
     * Buzzer Stop Tone.
     */
    buzzerStop() {
        if (!this.isConnected()) return;
        console.log(`buzzerStop`)
        let cmd = this.generateOutputCommand(
            KakaDevice.Buzzer,
            null,
            KakaOutputAction.BuzzerStop
        );
        this.send(BLECharacteristic.OUTPUT_COMMAND, cmd);
    }
}

/**
 * Scratch 3.0 blocks to interact with a Mammoth Kaka peripheral.
 */
class MammothKakaBlocks {

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
        this._peripheral = new Kaka(this.runtime, MammothKakaBlocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: MammothKakaBlocks.EXTENSION_ID,
            name: 'Kaka',
            blockIconURI: iconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'digitalOutput',
                    text: formatMessage({
                        id: 'kaka.digitalOutput',
                        default: 'Digital Output [PIN] set to [LEVEL]',
                        description: 'Set a digital output pin to specific level'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalOutputPins',
                            defaultValue: 0
                        },
                        LEVEL: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalOutputLevels',
                            defaultValue: 1
                        }
                    },
                },
                {
                    opcode: 'digitalInput',
                    text: formatMessage({
                        id: 'kaka.digitalInput',
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
                {
                    opcode: 'pwmOutput',
                    text: formatMessage({
                        id: 'kaka.pwmOutput',
                        default: 'PWM Output [PIN] set to [VALUE]',
                        description: 'Set a PWM output pin to specific value(0-255)'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'pwmOutputPins',
                            defaultValue: 0
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    },
                },
                {
                    opcode: 'analogInput',
                    text: formatMessage({
                        id: 'kaka.analogInput',
                        default: 'Analog Input [PIN]',
                        description: 'Get value of a analog input pin'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'analogInputPins',
                            defaultValue: 13
                        },
                    },
                },
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
                            defaultValue: 0
                        },
                        FROM_LOW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        FROM_HIGH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1023
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
                            defaultValue: 500
                        }
                    },
                },
                {
                    opcode: 'buzzerStop',
                    text: formatMessage({
                        id: 'kaka.buzzerStop',
                        default: 'buzzer Stop',
                        description: 'Stop the buzzer'
                    }),
                    blockType: BlockType.COMMAND,
                },
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
                {
                    opcode: 'setSegmentDisplay',
                    text: formatMessage({
                        id: 'kaka.setSegmentDisplay',
                        default: 'Set Segment Display [NAME] DIO, CLK to [PORT]',
                        description: 'Initialize a segment display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "display"
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        }
                    }
                },
                {
                    opcode: 'segmentDisplayShowValue',
                    text: formatMessage({
                        id: 'kaka.segmentDisplayShowValue',
                        default: 'Segment Display [NAME] show [VALUE]',
                        description: 'Show value on segment display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "display"
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "1234"
                        }
                    }
                },
                {
                    opcode: 'segmentDisplayClear',
                    text: formatMessage({
                        id: 'kaka.segmentDisplayClear',
                        default: 'Segment Display [NAME] clear',
                        description: 'Clear segment display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "display"
                        }
                    }
                },
                {
                    opcode: 'setColorSensor',
                    text: formatMessage({
                        id: 'kaka.setColorSensor',
                        default: 'Set Color Sensor [NAME] SCL, SDA to [PORT]',
                        description: 'Initialize a color sensor'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "bh"
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        }
                    }
                },
                {
                    opcode: 'colorSensorColor',
                    text: formatMessage({
                        id: 'kaka.colorSensorColor',
                        default: 'Color Sensor [NAME] color',
                        description: 'Get color from Color Sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "bh"
                        },
                    }
                },
                {
                    opcode: 'setMotor',
                    text: formatMessage({
                        id: 'kaka.setMotor',
                        default: 'Set Motor [NAME] to [PORT]',
                        description: 'Initialize a motor'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "motor"
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ports',
                            defaultValue: "32,33"
                        }
                    }
                },
                {
                    opcode: 'setMotorState',
                    text: formatMessage({
                        id: 'kaka.setMotorState',
                        default: 'Set Motor [NAME] to [ONOFF]',
                        description: 'Set motor state'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "motor"
                        },
                        ONOFF: {
                            type: ArgumentType.NUMBER,
                            menu: 'onOff',
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'setServo',
                    text: formatMessage({
                        id: 'kaka.setServo',
                        default: 'Set Servo [NAME] to [PIN]',
                        description: 'Initialize a Servo'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "servo"
                        },
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'servoPins',
                            defaultValue: 4
                        }
                    }
                },
                {
                    opcode: 'setServoAngle',
                    text: formatMessage({
                        id: 'kaka.setServoAngle',
                        default: 'Set Servo [NAME] to [ANGLE]',
                        description: 'Set Servo to angle'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "servo"
                        },
                        ANGLE: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'setLTMotor',
                    text: formatMessage({
                        id: 'kaka.setLTMotor',
                        default: 'Set LT Motor [NAME] to [PORT]',
                        description: 'Initialize a LT Motor'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "lt_motor"
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'ltMotorPorts',
                            defaultValue: "32,33"
                        }
                    }
                },
                {
                    opcode: 'setLTMotorState',
                    text: formatMessage({
                        id: 'kaka.setLTMotorState',
                        default: 'Set LT Motor [NAME] to [VALUE]',
                        description: 'Set LT Motor state'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "lt_motor"
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
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
                pwmOutputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '2', value: 2 },
                        { text: '13', value: 13 },
                        { text: '14', value: 14 },
                        { text: '26', value: 26 },
                        { text: '33', value: 33 },
                    ]
                },
                analogInputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '13', value: 13 },
                        { text: '14', value: 14 },
                        { text: '26', value: 26 },
                        { text: '33', value: 33 },
                    ]
                },
                servoPins: {
                    acceptReporters: true,
                    items: [
                        { text: '4', value: 4 },
                        { text: '15', value: 15 },
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
                }
            }
        };
    }

    /**
     * Digital output block.
     */
    digitalOutput(args) {
        this._peripheral.digitalOutput(args.PIN, args.LEVEL);
    }

    /**
     * Digital input block.
     * @returns {number} level of the digital input pin.
     */
    digitalInput(args) {
        return this._peripheral.digitalInput(args.PIN);
    }

    /**
     * PWM output
     */
    pwmOutput(args) {
        this._peripheral.pwmOutput(args.PIN, args.VALUE);
    }

    /**
     * Analog input block.
     * @returns {number} value of the analog input pin.
     */
    analogInput(args) {
        return this._peripheral.analogInput(args.PIN);
    }

    /**
     * Map Value from a range to another range
     */
    mapValue(args) {
        return args.VALUE * (args.TO_HIGH - args.TO_LOW) / (args.FROM_HIGH - args.FROM_LOW) + args.TO_LOW;
    }

    /**
     * Play Note.
     */
    playNote(args) {
        let tone = this._noteToTone(args.NOTE);
        this._peripheral.buzzerPlayTone(tone);
    }


    /**
     * Play Note for.
     */
    buzzerPlayNoteFor(args) {
        let tone = this._noteToTone(args.NOTE);
        this._peripheral.buzzerPlayToneFor(tone, args.DURATION);
    }

    /**
     * Stop the buzzer.
     */
    buzzerStop() {
        this._peripheral.buzzerStop();
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

module.exports = MammothKakaBlocks;
