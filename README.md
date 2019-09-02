# homeeup-MQTT-extension
Hiermit habt Ihr zusätzlich den Bewegungsmelder sowie den Tür-/Fenstersensor und den Temperatur-/Luftfeuchtesensor für homee. Die Ansteuerung erfolgt über MQTT.

<pre>
{
        "deviceName": "Climate",
        "type": "SimpleMQTTPluginClimate",
        "pluginParams": {
                "mqttServer": "localhost",
                "mqttUserName": "user",
                "mqttPassword": "password",
                "mqttHumidityTopic": "topic/humidity",
                "mqttTemperatureTopic": "topic/temperature_C"
        }
}
</pre>
