const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const MathUtil = require('../../util/math-util');
const RateLimiter = require('../../util/rateLimiter.js');

let BLE = null;
if (window.cordova && (window.cordova.platformId === 'android' || window.cordova.platformId === 'ios')) {
    BLE = require('../../io/cordovaBle');
} else if (navigator.bluetooth) {
    BLE = require('../../io/webBle');
} else {
    BLE = require('../../io/ble');
}

const LATEST_FIRMWARE_VERSION = "0.0.7";
const FIRMWARE = {
    '0x1000': 'kaka-firmware/kaka-mammoth-coding-firmware.ino.bootloader.bin',
    '0x8000': 'kaka-firmware/kaka-mammoth-coding-firmware.ino.partitions.bin',
    '0xe000': 'kaka-firmware/boot_app0.bin',
    '0x10000': 'kaka-firmware/kaka-mammoth-coding-firmware.ino.bin',
}

/**
 * 蓝牙发送每秒最多传输的次数，用于蓝牙发送速率限制
 * @type {number}
 */
const BLESendRateMax = 10;

/**
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 100;

/**
 * 读取数据的间隔时间
 * @type {number}
 */
const InputIntervalMs = 20;

/**
 * 设备设置
 */
const DeviceSettings = {
    AnalogResolution: 10,
    PWMResolution: 8,
}
DeviceSettings.PWMMax = 2 ** DeviceSettings.PWMResolution - 1;
DeviceSettings.AnalogMax = 2 ** DeviceSettings.AnalogResolution - 1;

/**
 * 卡卡的图标
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = `data:image/png;base64,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`;

/**
 * 卡卡设备的服务UUID
 * 
 * DEVICE_SERVICE: 设备相关的服务
 * IO_SERVICE: 输入输出相关的服务
 */
const BLEService = {
    DEVICE_SERVICE: '00001001-2d6f-4fcd-aff9-7e305f8fce48',
    IO_SERVICE: '00002001-2d6f-4fcd-aff9-7e305f8fce48'
};

/**
 * 卡卡设备的特征UUID
 *
 * DEVICE_SERVICE的特征:
 * - ATTACHED_IO
 * - LOW_VOLTAGE_ALERT
 *
 * IO_SERVICE的特征:
 * - INPUT_VALUES: 输入值
 * - INPUT_COMMAND: 输入命令
 * - OUTPUT_COMMAND: 输出命令
 *
 * @enum
 */
const BLECharacteristic = {
    ATTACHED_IO: '00001002-2d6f-4fcd-aff9-7e305f8fce48',
    LOW_VOLTAGE_ALERT: '00001003-2d6f-4fcd-aff9-7e305f8fce48',
    VERSION: '00001004-2d6f-4fcd-aff9-7e305f8fce48',
    INPUT_VALUES: '00002002-2d6f-4fcd-aff9-7e305f8fce48',
    INPUT_COMMAND: '00002003-2d6f-4fcd-aff9-7e305f8fce48',
    OUTPUT_COMMAND: '00002004-2d6f-4fcd-aff9-7e305f8fce48'
};

/**
 * 设备相关的动作
 */
const DeviceAction = {
    CHANGE_NAME: 0x01,
    RESET_IO: 0x02,
};

/**
 * 卡卡输入设备的类型，编号预留64个， 0x00-0x3F
 */
const KakaInputDevice = {
    DigitalInput: 0x01,
    Analog: 0x02,
    Button: 0x03,
    Sound: 0x04,
    ColorSensor: 0x05,
    Ultrasonic: 0x06,
}

/**
 * 卡卡输出设备的类型，编号预留64个， 0x40-0x7F
 */
const KakaOutputDevice = {
    DigitalOutput: 0x41,
    PWM: 0x42,
    Buzzer: 0x43,
    Servo: 0x44,
    Motor: 0x45,
    SegmentDisplay: 0x46,
    LTMotor: 0x47,
}

/**
 * 卡卡设备, 包含输入输出设备
 */
const KakaDevice = Object.assign({}, KakaInputDevice, KakaOutputDevice);

/**
 * 卡卡设备的动作
 */
const KakaAction = {
    DigitalOutput: 1,
    DigitalInput: 2,
    PWMPulseWidthPercent: 3,
    PWMFrequency: 4,
    AnalogInput: 5,
    AnalogInputFiltered: 6,
    BuzzerPlayTone: 7,
    BuzzerStop: 8,
    BuzzerPlayToneFor: 9,
    UltrasonicGetDistance: 10,
    SegmentDisplayShowValue: 11,
    SegmentDisplayClear: 12,
    ColorSensorGetColor: 13,
    MotorSetStatus: 14,
    ServoSetAngle: 15,
    LTMotorSetValue: 16,
    GetSoundLevel: 17,
}

/**
 * 颜色传感器的颜色列表
 */
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
 * 控制卡卡设备的链接和设备控制的类
 */
class Kaka {
    constructor(runtime, extensionId) {
        /**
         * Scratch 3.0 的运行环境
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        // 项目停止时，停止所有设备
        this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

        /**
         * 固件版本号
         */
        this.version = null;

        /**
         * 扩展的ID
         */
        this._extensionId = extensionId;

        /**
         * 蓝牙链接的实例
         * @type {BLE}
         * @private
         */
        this._ble = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

        // 设备当前注册的id记录
        this._deviceId = 0;
        /**
         * 已注册的设备
         * ```js
         * {
         *   deviceId: {
         *     name: "name",
         *     device: KakaDevice,
         *     pins: []
         *   }
         * }
         * ```
         */
        this._devices = {};
        /**
         * 输入设备当前正在读取的ID值
         */
        this._inputDeviceId = 0;
        /**
         * 读取输入设备的定时器
         */
        this._inputInterval = null;

        /**
         * 速度限制器, 用来限制蓝牙发送速度读，防止设备崩溃的
         * @type {RateLimiter}
         * @private
         */
        this._rateLimiter = new RateLimiter(BLESendRateMax);

        this.reset = this.reset.bind(this);
        this.stopAll = this.stopAll.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this.buttonIDs = {
            "A": 41,
            "B": 42,
        }
        for (button in this.buttonIDs) {
            let id = this.buttonIDs[button];
            this._devices[id] = {
                value: 1,
            }
        }
    }

    /**
     * 获取设备的版本号
     * @return {Promise} 返回一个Promise，resolve的值为设备的版本号
     */
    getPeripheralFirmwareVersion () {
        return new Promise(resolve => {
            this._ble.read(BLEService.DEVICE_SERVICE, BLECharacteristic.VERSION).then(version => {
                let uint8Array = Uint8Array.from(version);
                version = new TextDecoder().decode(uint8Array);
                resolve(version);
            });
        })
    }

    /**
     * 获取设备的版本号
     * @return {Promise} 返回一个Promise，resolve的值为设备的版本号
     */
    getFirmwareVersion () {
        return new Promise((resolve,reject)  => {
            let count = 0;
            if (this.version) {
                resolve(this.version);
            }
            let interval = setInterval(() => {
                count += 1;
                if (this.version) {
                    clearInterval(interval);
                    resolve(this.version);
                }
                if (count > 10) {
                    clearInterval(interval);
                    reject('timeout');
                }
            }, 1000);
        });
    }

    /**
     * 获取最新的版本号
     * @return {string} 最新的版本号
     */
    getLatestFirmwareVersion () {
        return LATEST_FIRMWARE_VERSION;
    }

    /**
     * 烧录最新的固件
     */
    flashLatestFirmware () {
        let event = new CustomEvent('onFlashESP32', {detail:{firmware: FIRMWARE}});
        document.dispatchEvent(event);
    }

    /**
     * 获取设备的名称
     * @return {string} 设备名称.
     */
    getPeripheralName() {
        if (!this._ble) return '';
        return this._ble.getPeripheralName();
    }

    /**
     * 给设备重命名
     * @param {string} name 设备的新名称
     */
    rename(name) {
        return this._ble.write(BLEService.DEVICE_SERVICE, BLECharacteristic.ATTACHED_IO, [DeviceAction.CHANGE_NAME, name.length, ...name.split('').map(c => c.charCodeAt(0))]);
    }

    /**
     * 关闭电机
     * @param {Object} device 需要关闭的设备信息
     */
    stopMotor(device) {
        let pin = device.pins[0];
        // Set motor off without using the rate limiter.
        this.setMotorStatus(pin, 0, false);
    }

    /**
     * 关闭蜂鸣器
     */
    stopBuzzer() {
        // Set buzzer stop without using the rate limiter.
        this.buzzerStop(false);
    }

    /**
     * 关闭动力电机
     * @param {Object} device 需要关闭的设备信息
     */
    stopLTMotor(device) {
        let pinA = device.pins[0];
        let pinB = device.pins[1];
        // Set LT motor off without using the rate limiter.
        this.setLTMotorValue(pinA, pinB, 0, 0, false);
    }

    /**
     * 关闭数码管
     * @param {Object} device 需要关闭的设备信息
     */
    stopSegmentDisplay(device) {
        let dio = device.pins[0];
        let clk = device.pins[1];
        // Clear segment display without using the rate limiter.
        this.segmentDisplayClear(dio, clk, false);
    }

    /**
     * 关闭所有设备
     */
    stopAll() {
        this.reset();
        if (!this.isConnected()) return;
        for (const deviceId in this._devices) {
            let device = this._devices[deviceId];
            switch (device.type) {
                case KakaDevice.Motor:
                    this.stopMotor(device);
                    break;
                case KakaDevice.Buzzer:
                    this.stopBuzzer();
                    break;
                case KakaDevice.LTMotor:
                    this.stopLTMotor(device);
                    break;
                case KakaDevice.SegmentDisplay:
                    this.stopSegmentDisplay(device)
                    break;
            }
        }
    }

    /**
     * 扫描周围的设备
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
     * 连接设备
     * @param {number} id 设备的id
     */
    connect(id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this._ble) {
            this._ble.disconnect();
        }
        this.version = null;
        this.reset();
    }

    /**
     * 重置设备
     */
    reset() {
        this._deviceId = 0;
        this._devices = {};
        this._inputDeviceId = 0;
        if (this._ble) {
            return this._ble.write(
                BLEService.DEVICE_SERVICE,
                BLECharacteristic.ATTACHED_IO,
                [DeviceAction.RESET_IO]
            );
        }
    }

    /**
     * 获取设备的连接状态
     * @return {boolean} 设备的连接状态
     */
    isConnected() {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

    /**
     * 发送数据
     * @param {number} uuid 需要发送到的服务UUID
     * @param {Array} message 需要发送的数据
     * @param {boolean} [useLimiter=true] 是否使用限制器，默认使用
     * @return {Promise} 发送数据的Promise
     */
    send(uuid, message, useLimiter = true) {
        if (!this.isConnected()) return Promise.resolve();
        if (useLimiter && !this._rateLimiter.okayToSend()) return Promise.resolve();

        return this._ble.write(
            BLEService.IO_SERVICE,
            uuid,
            message,
        );
    }

    /**
     * 生成需要发送的输出命令数据
     *
     * @param  {number} deviceType   - 设备的类型
     * @param  {number} id           - 设备的id
     * @param  {array}  pins         - 设备的引脚
     * @param  {number} action       - 设备的动作
     * @param  {array}  values       - 设备的值
     * @return {array}               - 生成的数据
     */
    generateOutputCommand(deviceType, id, action, pins, values = null,) {
        let command = [
            deviceType,
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
     * 生成需要发送的输入命令数据
     *
     * @param  {number}  deviceType          - 设备的类型
     * @param  {number}  id                  - 设备的id
     * @param  {number}  action              - 设备的动作
     * @param  {array}   pins                - 设备的引脚
     * @return {array}                       - 生成的数据
     */
    generateInputCommand(deviceType, id, action, pins) {
        return [
            deviceType,
            id,
            action,
            pins.length,
            ...pins,
        ];
    }

    /**
     * 在连接成功后，开始监听输入数据
     */
    _onConnect() {
        this.getPeripheralFirmwareVersion().then(version => {
            this.version = version;
        })
        this._ble.startNotifications(BLEService.IO_SERVICE, BLECharacteristic.INPUT_VALUES, this._onInput.bind(this));
    }

    /**
     * 处理输入通知数据
     * @param {array} data - 输入通知数据
     */
    _onInput(data) {
        let valueLength = data[0];
        let dataIndex = 0;
        for (let i = 0; i < valueLength; i++) {
            let id = data[++dataIndex];
            let length = data[++dataIndex];
            let valueList = data.slice(++dataIndex, dataIndex + length);
            dataIndex += length;
            let value = 0;
            valueList.reverse();
            for (let j = 0; j < valueList.length; j++) {
                value += valueList[j] << (j * 8);
            }
            if (!this._devices[id]){
                this._devices[id] = {};
            }
            this._devices[id].value = value;
        }
    }

    /**
     * 读取设备的值
     */
    get devices() {
        return this._devices;
    }

    /**
     * Register a device to the Kaka peripheral.
     * @param {number} type         - 设备的类型
     * @param {array}  pins         - 设备的引脚
     * @param {number} action       - 设备的动作
     * @returns {array}             - 设备的id
     */
    _registerDevice(type, pins, action) {
        let name = `device${type}_${pins}`;
        let id = null;
        let newDevice = false;
        if (this._isDeviceRegistered(name)) {
            id = this._getDeviceId(name);
        } else {
            newDevice = true;
            id = this._deviceId++;
            this._devices[id] = {
                id: id,
                type: type,
                name: name,
                value: null,
                pins: pins,
                action: action,
            };
        }
        return {id: id, newDevice: newDevice};
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
    _outputDevice(device, action, pins, values, useLimiter = true) {
        if (!this.isConnected()) return Promise.resolve();
        let result = this._registerDevice(device, pins);
        let id = result.id;
        const command = this.generateOutputCommand(
            device,
            id,
            action,
            pins,
            values
        );
        return this.send(BLECharacteristic.OUTPUT_COMMAND, command, useLimiter);
    }

    /**
     * 输入设备的通用读取函数
     * @param {number} type    - 设备的类型
     * @param {array} pins     - 设备的引脚
     * @returns {any}          - 设备的值
     */
    _inputDevice(type, action, pins, useLimiter = true) {
        if (!this.isConnected()) return Promise.resolve();
        let result = this._registerDevice(type, pins, action);
        let id = result.id;
        if (useLimiter && !this._rateLimiter.okayToSend()) return Promise.resolve(this._devices[id].value);

        if (result.newDevice) {
            const command = this.generateInputCommand(type, id, action, pins);
            this.send(BLECharacteristic.INPUT_COMMAND, command, useLimiter)
        }
        return Promise.resolve(this._devices[id].value);
    }

    /**
     * Digital output.
     * @param {number} pin - the pin to write to.
     * @param {number} value - the value to write.
     */
    setDigitalOutput(pin, value, useLimiter = true) {
        return this._outputDevice(KakaDevice.DigitalOutput, KakaAction.DigitalOutput, [pin], [value], useLimiter);
    }

    /**
     * Digital input.
     * @param {number} pin - the pin to read from.
     * @return {number} - the value read.
     */
    getDigitalInput(pin, useLimiter = true) {
        return this._inputDevice(KakaDevice.DigitalInput, KakaAction.DigitalInput, [pin], useLimiter);
    }

    /**
     * PWM output.
     * @param {number} pin - the pin to write to.
     * @param {number} value - the value to write, 0~255.
     */
    setPwmOutput(pin, value, useLimiter = true) {
        if (value > DeviceSettings.PWMMax) {
            value = DeviceSettings.PWMMax;
        }
        return this._outputDevice(KakaDevice.PWM, KakaAction.PWMPulseWidthPercent, [pin], [value], useLimiter);
    }

    /**
     * Analog input.
     * @param {number} pin - the pin to read from.
     * @param {boolean} filtered - whether to use the filtered value.
     * @return {number} - the value read.
     */
    getAnalogInput(pin, filtered = false, useLimiter = true) {
        let action = filtered ? KakaAction.AnalogInputFiltered : KakaAction.AnalogInput;
        return this._inputDevice(KakaDevice.Analog, action, [pin], useLimiter);
    }

    /**
     * Sound level
     * @returns {number} - the value read.
     */
    getSoundLevel(useLimiter = true) {
        return new Promise((resolve, reject) => {
            this._inputDevice(KakaDevice.Sound, KakaAction.GetSoundLevel, [], useLimiter).then(value => {
                this.soundLevel = value;
                resolve(value);
            }, reject);
        });
    }

    /**
     * Get Button Input.
     * @param {string} button - the button to read from.
     * @return {number} - the value read.
     */
    getButtonInput(button) {
        let id = this.buttonIDs[button];
        if (this._devices[id]) {
            return this._devices[id].value == 0;
        }
        return false;
    }

    /**
     * Buzzer Play Tone.
     * @param {number} tone - the tone to play.
     * @param {number} useLimiter - use limiter or not.
     */
    buzzerPlayTone(tone, useLimiter = true) {
        return this._outputDevice(KakaDevice.Buzzer, KakaAction.BuzzerPlayTone, [], [tone >> 8, tone & 0xFF], useLimiter);
    }

    /**
     * Buzzer Play Tone for
     * @param {number} tone - the tone to play.
     * @param {number} duration - the duration to play.
     * @param {number} useLimiter - use limiter or not.
     */
    buzzerPlayToneFor(tone, duration, useLimiter = true) {
        return this._outputDevice(KakaDevice.Buzzer, KakaAction.BuzzerPlayToneFor, [], [tone >> 8, tone & 0xFF, duration >> 8, duration & 0xFF], useLimiter);
    }

    /**
     * Buzzer Stop Tone.
     * @param {number} useLimiter - use limiter or not.
     */
    buzzerStop(useLimiter = true) {
        return this._outputDevice(KakaDevice.Buzzer, KakaAction.BuzzerStop, [], [], useLimiter);
    }

    /**
     * Ultrasonic Sensor Distance.
     * @param {number} trig - ultrasonic trig pin.
     * @param {number} echo - ultrasonic echo pin.
     * @param {number} useLimiter - use limiter or not.
     */
    ultrasonicDistance(trig, echo, useLimiter = true) {
        return this._inputDevice(KakaDevice.Ultrasonic, KakaAction.UltrasonicGetDistance, [trig, echo], useLimiter);
    }

    /**
     * Segment display show a value.
     * @param {number} dio - Segment display echo pin.
     * @param {number} clk - Segment display clk pin.
     * @param {number} value - value to show.
     * @param {number} useLimiter - use limiter or not.
     */
    segmentDisplayShowValue(dio, clk, value, useLimiter = true) {
        data = []
        str = value.toString();
        for (let i = 0; i < str.length; i++) {
            data.push(str.charCodeAt(i));
        }
        return this._outputDevice(KakaDevice.SegmentDisplay, KakaAction.SegmentDisplayShowValue, [dio, clk], data, useLimiter);
    }

    /**
     * Segment display Clear.
     * @param {number} dio - Segment display echo pin.
     * @param {number} clk - Segment display clk pin.
     * @param {string} useLimiter - use limiter or not.
     */
    segmentDisplayClear(dio, clk, useLimiter = true) {
        return this._outputDevice(KakaDevice.SegmentDisplay, KakaAction.SegmentDisplayClear, [dio, clk], [], useLimiter);
    }

    /**
     * Color Sensor Get Color.
     * @param {number} sda - SDA pin
     * @param {number} scl - SCL pin
     * @param {string} useLimiter - use limiter or not.
     */
    colorSensorGetColor(sda, scl, useLimiter = true) {
        return this._inputDevice(KakaDevice.ColorSensor, KakaAction.ColorSensorGetColor, [sda, scl], useLimiter);
    }

    /**
     * Set motor state.
     * @param {number} pin - the pin to write to.
     * @param {number} state - the state to write.
     * @param {string} useLimiter - use limiter or not.
     */
    setMotorStatus(pin, state, useLimiter = true) {
        return this._outputDevice(KakaDevice.Motor, KakaAction.MotorSetStatus, [pin], [state], useLimiter);
    }

    /**
     * Set servo angle.
     * @param {number} pin - the pin to write to.
     * @param {number} angle - the angle to write(0~180).
     * @param {string} useLimiter - use limiter or not.
     */
    setServoAngle(pin, angle, useLimiter = true) {
        angle = MathUtil.clamp(angle, 0, 180);
        return this._outputDevice(KakaDevice.Servo, KakaAction.ServoSetAngle, [pin], [angle], useLimiter);
    }

    /**
     * Set LT motor value.
     * @param {number} pinA - the pinA to write to.
     * @param {number} pinB - the pinB to write to.
     * @param {number} value - the value to write(-100~100).
     * @param {string} useLimiter - use limiter or not.
     */
    setLTMotorValue(pinA, pinB, value, useLimiter = true) {
        value = MathUtil.clamp(value, -100, 100);
        return this._outputDevice(KakaDevice.LTMotor, KakaAction.LTMotorSetValue, [pinA, pinB], [value], useLimiter);
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
                // Potentiometer
                {
                    opcode: 'getPotentiometer',
                    text: formatMessage({
                        id: 'kaka.getPotentiometer',
                        default: 'Potentiometer [PIN] Value',
                        description: 'Get value of a potentiometer'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'analogInputPins',
                            defaultValue: "13"
                        },
                    },
                },
                // Light Sensor
                {
                    opcode: 'getLightSensor',
                    text: formatMessage({
                        id: 'kaka.getLightSensor',
                        default: 'Light Sensor [PIN] Value',
                        description: 'Get value of a light sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'analogInputPins',
                            defaultValue: "13"
                        },
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
                // When button pressed
                {
                    opcode: 'whenButton',
                    text: formatMessage({
                        id: 'kaka.whenButton',
                        default: 'When button [BUTTON] pressed',
                        description: 'When a button is pressed'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.STRING,
                            menu: 'buttons',
                            defaultValue: "A"
                        },
                    },
                },
                // if Button state
                {
                    opcode: 'ifButtonPressed',
                    text: formatMessage({
                        id: 'kaka.ifButtonPressed',
                        default: 'Pressing Button [BUTTON] ?',
                        description: 'if state of a button is pressed/released'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.STRING,
                            menu: 'buttons',
                            defaultValue: "A"
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
                        default: 'Ultrasonic Distance(cm) [PORT]',
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
                        default: 'Segment Display [PORT] show [VALUE]',
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
                // colorSensorGetColor
                {
                    opcode: 'colorSensorGetColor',
                    text: formatMessage({
                        id: 'kaka.colorSensorGetColor',
                        default: 'Color Sensor [PORT] color',
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
                            type: ArgumentType.STRING,
                            menu: 'onOff',
                            defaultValue: "1"
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
                            type: ArgumentType.STRING,
                            menu: 'servoPins',
                            defaultValue: "15"
                        },
                        ANGLE: {
                            type: ArgumentType.NUMBER,
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
                            type: ArgumentType.STRING,
                            menu: 'digitalOutputPins',
                            defaultValue: "2"
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'digitalOutputLevels',
                            defaultValue: "1"
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
                            type: ArgumentType.STRING,
                            menu: 'digitalInputPins',
                            defaultValue: "0"
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
                            type: ArgumentType.STRING,
                            menu: 'pwmOutputPins',
                            defaultValue: "2"
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
                            type: ArgumentType.STRING,
                            menu: 'analogInputPins',
                            defaultValue: "13"
                        },
                    },
                },
            ],
            menus: {
                digitalOutputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '2', value: "2" },
                        { text: '13', value: "13" },
                        { text: '14', value: "14" },
                        { text: '26', value: "26" },
                        { text: '33', value: "33" },
                    ]
                },
                digitalInputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '0', value: "0" },
                        { text: '5', value: "5" },
                        { text: '13', value: "13" },
                        { text: '14', value: "14" },
                        { text: '26', value: "26" },
                        { text: '33', value: "33" },
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
                            }),
                            value: "1"
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.digitalOutputLevels.low',
                                default: 'LOW',
                                description: 'Logic level low'
                            }),
                            value: "0"
                        },
                    ]
                },
                pwmOutputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '2', value: "2" },
                        { text: '13', value: "13" },
                        { text: '14', value: "14" },
                        { text: '26', value: "26" },
                        { text: '33', value: "33" },
                    ]
                },
                analogInputPins: {
                    acceptReporters: true,
                    items: [
                        { text: '13', value: "13" },
                        { text: '14', value: "14" },
                        { text: '26', value: "26" },
                        { text: '33', value: "33" },
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
                            }),
                            value: '>'
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.soundLevelOps.lt',
                                default: '<',
                                description: 'Sound level less than'
                            }),
                            value: '<'
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
                            }),
                            value: "A"
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.buttons.b',
                                default: 'B',
                                description: 'Button B'
                            }),
                            value: "B"
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
                            }),
                            value: "0"
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.buttonEvents.released',
                                default: 'released',
                                description: 'Button released'
                            }),
                            value: "1"
                        },
                    ]
                },
                servoPins: {
                    acceptReporters: true,
                    items: [
                        { text: '15', value: "15" },
                        { text: '4', value: "4" },
                        { text: '16', value: "16" },
                        { text: '17', value: "17" },
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
                            }), value: "1"
                        },
                        {
                            text: formatMessage({
                                id: 'kaka.onOff.off',
                                default: 'OFF',
                                description: 'Logic on off, off'
                            }), value: "0"
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

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    getDigitalInput(args) {
        let pin = Cast.toNumber(args.PIN);
        return this._peripheral.getDigitalInput(pin);
    }

    setPwmOutput(args) {
        let pin = Cast.toNumber(args.PIN);
        let value = Cast.toNumber(args.VALUE);
        this._peripheral.setPwmOutput(pin, value);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
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
        let result = (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
        return result.toFixed(2)
    }

    whenSoundLevel(args) {
        let level = Cast.toNumber(args.LEVEL);
        this._peripheral.getSoundLevel();
        let soundLevel = this._peripheral.soundLevel;
        if (args.OP === '>') {
            return soundLevel > level;
        } else {
            return soundLevel < level;
        }
    }

    getPotentiometer(args) {
        let pin = Cast.toNumber(args.PIN);
        let filtered = true;
        return new Promise(resolve => {
            this._peripheral.getAnalogInput(pin, filtered).then(value => {
                resolve(4095 - value);
            });
        });
    }

    getLightSensor(args) {
        return this.getAnalogInput(args);
    }

    getSoundLevel() {
        return this._peripheral.getSoundLevel();
    }

    whenButton(args) {
        let button = args.BUTTON;
        return this._peripheral.getButtonInput(button);
    }

    ifButtonPressed(args) {
        let button = args.BUTTON;
        return this._peripheral.getButtonInput(button);
    }

    buzzerPlayNoteFor(args) {
        let note = Cast.toNumber(args.NOTE);
        let duration = Cast.toNumber(args.DURATION) * 1000;
        let tone = this._noteToTone(note);
        this._peripheral.buzzerPlayToneFor(tone, duration);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    buzzerStop() {
        this._peripheral.buzzerStop();

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
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

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    segmentDisplayClear(args) {
        let dio = Cast.toNumber(args.PORT.split(',')[0]);
        let clk = Cast.toNumber(args.PORT.split(',')[1]);
        this._peripheral.segmentDisplayClear(dio, clk);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
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

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    setServoAngle(args) {
        let pin = Cast.toNumber(args.PIN);
        let angle = Cast.toNumber(args.ANGLE);
        this._peripheral.setServoAngle(pin, angle);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    setLTMotorValue(args) {
        let pinA = Cast.toNumber(args.PORT.split(',')[0]);
        let pinB = Cast.toNumber(args.PORT.split(',')[1]);
        let value = Cast.toNumber(args.VALUE);
        value = MathUtil.clamp(value, -100, 100);
        this._peripheral.setLTMotorValue(pinA, pinB, value);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
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
