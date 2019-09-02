"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('SimpleMQTTPluginClimate');
var mqtt = require('mqtt');
var HMWDS40THI_1 = require("../devices/HMWDS40THI");
var SimpleMQTTPluginClimate = /** @class */ (function () {
    function SimpleMQTTPluginClimate() {
        this.name = 'SimpleMQTTPluginClimate';
        this.devices = [];
        //states and vars
        this.mqttAvailable = false;
        this.mqttConnection = null;
    }
    SimpleMQTTPluginClimate.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.mqttServer = p.pluginParams.mqttServer;
        this.mqttUserName = p.pluginParams.mqttUserName;
        this.mqttPassword = p.pluginParams.mqttPassword;
        this.mqttPublishHumidityTopic = p.pluginParams.mqttHumidityTopic;
        this.mqttPublishTemperatureTopic = p.pluginParams.mqttTemperatureTopic;
        if (p.pluginParams.mqttPublishHumidityTopic) {
            this.mqttPublishHumidityTopic = p.pluginParams.mqttPublishHumidityTopic;
        }
        if (p.pluginParams.mqttPublishTemperatureTopic) {
            this.mqttPublishTemperatureTopic = p.pluginParams.mqttPublishTemperatureTopic;
        }
        else {
            this.mqttPublishTemperatureTopic = this.mqttPublishTemperatureTopic;
        }
        if (p.pluginParams.mqttSubscribeHumidityTopic) {
            this.mqttSubscribeHumidityTopic = p.pluginParams.mqttSubscribeHumidityTopic;
        }
        else {
            this.mqttSubscribeHumidityTopic = this.mqttPublishHumidityTopic;
        }
        if (p.pluginParams.mqttSubscribeTemperatureTopic) {
            this.mqttSubscribeTemperatureTopic = p.pluginParams.mqttSubscribeTemperatureTopic;
        }
        else {
            this.mqttSubscribeTemperatureTopic = this.mqttPublishTemperatureTopic;
        }
        if (p.pluginParams.mqttMessageMode) {
            this.mqttMessageMode = p.pluginParams.mqttMessageMode;
        }
        else {
            this.mqttMessageMode = "value";
        }
        var device = new HMWDS40THI_1.HMWDS40THI(p.deviceName);
//        device.events.on('onTurnOn', this.onTurnOn.bind(this));
//        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        var that = this;
        this.mqttConnect();
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
//    SimpleMQTTPluginClimate.prototype.onTurnOn = function (device) {
//        logger.debug('onTurnOn()');
//        logger.info('Device %s turned on.', device.deviceName);
//        this.mqttPublish(this.mqttPublishHumidityTopic, '1');
//    };
//    SimpleMQTTPluginClimate.prototype.onTurnOff = function (device) {
//        logger.debug('onTurnOff()');
//        logger.info('Device %s turned off.', device.deviceName);
//        this.mqttPublish(this.mqttPublishTemperatureTopic, '0');
//    };
    SimpleMQTTPluginClimate.prototype.mqttConnect = function () {
        if (this.mqttUserName) {
            this.mqttConnection = mqtt.connect('mqtt://' + this.mqttServer, {
                username: this.mqttUserName,
                password: this.mqttPassword
            });
        }
        else {
            this.mqttConnection = mqtt.connect('mqtt://' + this.mqttServer, {});
        }
        var that = this;
        this.mqttConnection.on('connect', function () {
            logger.info('MQTT connected');
            that.mqttAvailable = true;
            that.mqttSubscribe(that.mqttSubscribeHumidityTopic);
            if (that.mqttSubscribeHumidityTopic !== that.mqttSubscribeTemperatureTopic) {
                that.mqttSubscribe(that.mqttSubscribeTemperatureTopic);
            }
        });
        this.mqttConnection.on('message', function (topic, message) {

            that.handleIncommingSubscribedMqttMessage(that, topic, message);
        });
    };
    SimpleMQTTPluginClimate.prototype.mqttPublish = function (mqttTopic, mqttMessage) {
        if (this.mqttAvailable) {
            logger.debug('publish to', mqttTopic, mqttMessage);
            this.mqttConnection.publish(mqttTopic, mqttMessage);
        }
    };
    SimpleMQTTPluginClimate.prototype.mqttSubscribe = function (mqttTopic) {
        if (this.mqttAvailable) {
            logger.info('"subscribing: "' + mqttTopic + '"');
            this.mqttConnection.subscribe(mqttTopic, null, function (err) {
                if (err) {
                    logger.error(err, '" subscribing: "' + mqttTopic + '"');
                }
                else {
                    logger.info('"subscribed: "' + mqttTopic + '"');
                }
            });
        }
    };
    SimpleMQTTPluginClimate.prototype.handleIncommingSubscribedMqttMessage = function (that, topic, message) {
        logger.info("subscribed mqtt message received:", topic, message.toString());
        var device = that.devices[0];
        var val;
        if (that.mqttMessageMode == "value") {
            var messageString = message.toString().toLowerCase();
            if (messageString ) {
                val = Number(messageString);
            }
            else {
                val = 0;
            }
        }
        if (topic === that.mqttSubscribeHumidityTopic && val !== device.humidity1) {
            logger.info('Status of %s (HUMIDITY) changed to %s.', device.deviceName, message);
            device.humidityChanged(1, val);
        }
        else if (topic === that.mqttSubscribeHumidityTopic && val === device.humidity1) {
            logger.info('Status of %s (HUMIDITY) has not changed.', device.deviceName);
        }
        if (topic === that.mqttSubscribeTemperatureTopic && val !== device.temperature1) {
            logger.info('Status of %s (TEMPERATURE) changed to %s.', device.deviceName, message);
            device.temperatureChanged(1, val);
        }
        else if (topic === that.mqttSubscribeTemperatureTopic && val === device.temperature1) {
            logger.info('Status of %s (TEMPERATURE) has not changed.', device.deviceName);
        }
    };
    return SimpleMQTTPluginClimate;
}());
exports.SimpleMQTTPluginClimate = SimpleMQTTPluginClimate;
