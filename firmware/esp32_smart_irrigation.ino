/*
  Smart Irrigation System - ESP32 Firmware
  ========================================
  Supports:
  - Capacitive Soil Moisture Sensor (GPIO 34)
  - DHT22 / DHT11 Temperature & Humidity Sensor (GPIO 4)
  - Rain Sensor Plate (GPIO 35)
  - Water Pump Relay (GPIO 23)
  - REST API Web Server on Port 80
*/

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Wi-Fi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Pin Assignments
#define SOIL_PIN 34
#define RAIN_PIN 35
#define DHT_PIN 4
#define RELAY_PIN 23
#define LED_PIN 2

#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

WebServer server(80);

// Sensor Calibration values
const int AIR_VALUE = 3200;    // Dry sensor in air
const int WATER_VALUE = 1400;  // Submerged in water

// State Variables
bool isWatering = false;
String wateringMode = "manual";

// Function prototypes
void setupWiFi();
void handleStatus();
void handleSensors();
void handleWatering();
void handleWateringMode();
void handleNotFound();
void setCORS();

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Pump OFF initially
  digitalWrite(LED_PIN, LOW);

  dht.begin();
  setupWiFi();

  // Route Handlers
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/sensors", HTTP_GET, handleSensors);
  server.on("/api/watering", HTTP_POST, handleWatering);
  server.on("/api/watering/mode", HTTP_POST, handleWateringMode);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP Server started on port 80");
}

void loop() {
  server.handleClient();
}

void setupWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }

  digitalWrite(LED_PIN, HIGH);
  Serial.println("\nWiFi connected successfully!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());
}

void setCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

float readSoilMoisture() {
  int raw = analogRead(SOIL_PIN);
  float percentage = map(raw, AIR_VALUE, WATER_VALUE, 0, 100);
  return constrain(percentage, 0.0, 100.0);
}

bool readRain() {
  int raw = analogRead(RAIN_PIN);
  return raw < 2500; // Lower voltage means water conductive
}

void handleStatus() {
  setCORS();
  float soil = readSoilMoisture();
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  bool rain = readRain();

  if (isnan(temp)) temp = 25.0;
  if (isnan(hum)) hum = 60.0;

  StaticJsonDocument<256> doc;
  doc["device"] = "ESP32-Smart-Irrigation";
  doc["soilMoisture"] = round(soil * 10.0) / 10.0;
  doc["temperature"] = round(temp * 10.0) / 10.0;
  doc["humidity"] = round(hum * 10.0) / 10.0;
  doc["rain"] = rain;
  doc["watering"] = isWatering;
  doc["wateringMode"] = wateringMode;

  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

void handleSensors() {
  setCORS();
  float soil = readSoilMoisture();
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  StaticJsonDocument<384> doc;
  JsonObject sensors = doc.createNestedObject("sensors");
  
  sensors["soilMoisture"]["percentage"] = soil;
  sensors["soilMoisture"]["raw"] = analogRead(SOIL_PIN);
  sensors["temperature"]["value"] = temp;
  sensors["humidity"]["value"] = hum;
  sensors["rain"]["detected"] = readRain();

  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

void handleWatering() {
  setCORS();
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"Missing body\"}");
    return;
  }

  StaticJsonDocument<128> doc;
  deserializeJson(doc, server.arg("plain"));

  if (doc.containsKey("enabled")) {
    isWatering = doc["enabled"].as<bool>();
    digitalWrite(RELAY_PIN, isWatering ? HIGH : LOW);

    StaticJsonDocument<128> response;
    response["success"] = true;
    response["watering"] = isWatering;
    response["message"] = isWatering ? "Watering started" : "Watering stopped";

    String output;
    serializeJson(response, output);
    server.send(200, "application/json", output);
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid format\"}");
  }
}

void handleWateringMode() {
  setCORS();
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"Missing body\"}");
    return;
  }

  StaticJsonDocument<128> doc;
  deserializeJson(doc, server.arg("plain"));

  if (doc.containsKey("mode")) {
    wateringMode = doc["mode"].as<String>();
    server.send(200, "application/json", "{\"success\":true,\"mode\":\"" + wateringMode + "\"}");
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid mode format\"}");
  }
}

void handleNotFound() {
  setCORS();
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }
  server.send(404, "application/json", "{\"error\":\"Not found\"}");
}
