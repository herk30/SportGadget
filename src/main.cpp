#include <Arduino.h>
#include <BLEDevice.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <ESPAsyncWebServer.h>
#include <string.h>
#include <ArduinoOTA.h> 

using namespace std;

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
WiFiMulti wifiMulti;           

const uint32_t connectTimeoutMs = 10000;

IPAddress local_IP(192, 168, 1, 50); 
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);     
IPAddress secondaryDNS(8, 8, 4, 4);  

int age = 18;   
float weight = 69.0;

float maxHR = 206.9 - (0.67*age);
float intensity = 0.0;
float battery = 0.0;
float CurrentHR = 0.0;

int currentHR = 0;
float totalCalories = 0.0;
unsigned long lastCalcTime = 0;
bool deviceFound = false;
unsigned long lastPacketTime = 0;
unsigned long deviceStartTime = 0;
unsigned long currentTotalSeconds = 0;
bool isDeviceOn = false;

class MyRadar: public BLEAdvertisedDeviceCallbacks{
  void onResult(BLEAdvertisedDevice dev){
    if (dev.getName() == "CL831-0865682"){
      lastPacketTime = millis();
      if (dev.haveManufacturerData()){
        string raw = dev.getManufacturerData();
        if (raw.length()>7){
          currentHR = (uint8_t)raw[7];
          deviceFound = true;
        }
      }
    }
  }
};

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.printf(">>> CÓ CLIENT KẾT NỐI (ID: %u)\n", client->id());
  } else if (type == WS_EVT_DISCONNECT) {
    Serial.printf(">>> CLIENT ĐÃ NGẮT KẾT NỐI (ID: %u)\n", client->id());
  }
}
void setup() {
  Serial.begin(115200);
  delay(2000);
  setCpuFrequencyMhz(80);

  Serial.print("Đang cấu hình IP tĩnh...");
  Change IP Number through 67->69 lines
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Lỗi cấu hình IP Tĩnh!");
  }

  wifiMulti.addAP("Ti Li", "tianhtiem2730");
  wifiMulti.addAP("TRIA CAFE", "Triacafe");
  wifiMulti.addAP("ACLAB", "ACLAB2023");
  wifiMulti.addAP("le","LNKhoi301007");

  Serial.print("Đang tìm và kết nối Wi-Fi");
  
  while (wifiMulti.run() != WL_CONNECTED) {
    delay(500); 
    Serial.print(".");
  }
  
  Serial.println("\n--- ĐÃ KẾT NỐI WIFI ---");
  Serial.print("Đang dùng mạng: ");
  Serial.println(WiFi.SSID());
  Serial.print("ESP IP là: ");
  Serial.println(WiFi.localIP());

  server.addHandler(&ws);
  ws.onEvent(onEvent);
  server.begin();

  BLEDevice::init("");
  BLEScan* pScan = BLEDevice::getScan();
  pScan->setAdvertisedDeviceCallbacks(new MyRadar());
  pScan->setActiveScan(true);

  lastCalcTime = millis();
}

void loop() {

    BLEDevice::getScan()->start(1, false);
    BLEDevice::getScan()->clearResults();
  
    unsigned long now = millis();
    float secondsPassed = (now - lastCalcTime) / 1000.0; 
    int isConnected = 0;
    if (millis() - lastPacketTime < 6000) { 
        isConnected = 1; 
    }

    if (isConnected == 1) {
        if (isDeviceOn == false) {
            deviceStartTime = millis(); 
            isDeviceOn = true;
        }
        currentTotalSeconds = (millis() - deviceStartTime) / 1000;
        if (currentHR >= 60) {
            float calPerMin = ((age * 0.2017) - (weight * 0.09036) + (currentHR * 0.6309) - 55.0969) / 4.184;
            if (calPerMin > 0) {
                totalCalories += (calPerMin / 60.0) * secondsPassed;
            }
            intensity = (currentHR / maxHR) * 100;
        }
    } else {
        isDeviceOn = false;
        currentTotalSeconds = 0; 
        currentHR = 0; 
        intensity = 0;
    }
  
    lastCalcTime = now;

    String json = "{\"hr\":" + String(currentHR) + 
                  ", \"cal\":" + String(totalCalories) +  
                  ", \"intensity\":" + String(intensity) + 
                  ", \"time\":" + String(currentTotalSeconds) + 
                  ", \"connected\":" + String(isConnected) + "}";
    
    ws.textAll(json); 
    Serial.println("Đã gửi: " + json);
    
    ws.cleanupClients();
    delay(100);
}