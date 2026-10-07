# Android Studio APK Build & Deployment Guide

This guide walks you through building, testing, and generating the standalone Android APK using Android Studio.

---

## 1. Project Location for Android Studio

The complete, native Android Studio project is located at:
```
d:\darshan anna\frontend\android
```

---

## 2. Opening in Android Studio

1. Launch **Android Studio**.
2. On the welcome screen (or from **File** > **Open**), select the directory:
   ```
   d:\darshan anna\frontend\android
   ```
3. Click **OK / Open**.
4. Android Studio will automatically load the project and perform a Gradle sync.
   - Gradle wrapper and Android SDK dependencies will be resolved automatically.
   - The package ID is configured as: `com.formora.irrigation`
   - Application Name: `Formora - Soil Irrigation System`
   - Launcher Icon: The brand new Formora leaf & droplet emblem.

---

## 3. Building the Android APK

### Method A: Using Android Studio GUI (Recommended)
1. In the top navigation bar of Android Studio, click **Build**.
2. Select **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Gradle will compile the native Android wrapper and bundle the optimized frontend assets.
4. When the build finishes, a notification will appear in the bottom-right corner:
   - Click **locate** to reveal your freshly generated `app-debug.apk`!
   - File location:
     ```
     frontend/android/app/build/outputs/apk/debug/app-debug.apk
     ```

### Method B: Running Directly on a Phone / Emulator
1. Connect your Android phone via USB cable and enable **USB Debugging** (in Developer Options).
   *(Or launch an Android Virtual Device / Emulator in Android Studio).*
2. In Android Studio, ensure `app` is selected in the run configuration dropdown.
3. Click the green **Run (Play)** button (or press `Shift + F10`).
4. The Smart Irrigation application will install and launch immediately on your device.

---

## 4. Useful NPM Scripts

From the root of the workspace (`d:\darshan anna`):

| Command | Action |
|---|---|
| `npm run android:build` | Compiles the latest web application assets and syncs them to the Android project. |
| `npm run android:open` | Automatically launches Android Studio with this project. |
| `npm run android:sync` | Synchronizes web assets and plugins to the Android project. |

---

## 5. Local Network & ESP32 Configuration in APK

- The Android application has been pre-configured with:
  - `android.permission.INTERNET`
  - `android.permission.ACCESS_NETWORK_STATE`
  - `android.permission.ACCESS_WIFI_STATE`
  - `android:usesCleartextTraffic="true"` (Allows HTTP communication with local ESP32 IPs like `http://192.168.1.100`)
- When testing on a real Android phone, make sure your phone is connected to the **same Wi-Fi network** as your ESP32 hardware and Node.js backend.
