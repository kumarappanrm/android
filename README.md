# 🎬 VideoToMP3 - React Native App

A full-featured app to convert videos to MP3, play them, and stream via Bluetooth.

---

## 📱 Features
- **Video Converter** — MP4, MOV, AVI, MKV → MP3/AAC/WAV/FLAC
- **MP3 Player** — Full playback controls, playlist, seek bar, volume
- **Bluetooth** — Scan, connect & stream audio to external devices

---

## 🚀 Setup & Run Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Start the app
```bash
npx expo start
```
Scan the QR code with **Expo Go** app on your phone.

---

## 📦 Build APK via GitHub Actions

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/video-to-mp3.git
git push -u origin main
```

### Step 2: Create `.github/workflows/build.yml`
```yaml
name: Build APK

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install deps
        run: npm install

      - name: Build APK
        run: npx eas build --platform android --non-interactive --profile preview

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: "*.apk"
```

### Step 3: Add GitHub Secret
- Go to **Settings > Secrets > Actions**
- Add `EXPO_TOKEN` (get from expo.dev account)

### Step 4: Download APK
- GitHub → **Actions** tab → latest run → **Artifacts** → download!

---

## 📦 Key Libraries Used

| Library | Purpose |
|---|---|
| `ffmpeg-kit-react-native` | Video → MP3 conversion |
| `expo-av` | Audio playback |
| `react-native-ble-plx` | Bluetooth device scanning |
| `react-native-track-player` | Background audio player |
| `expo-document-picker` | File selection |

---

## 🔐 Android Permissions (add to AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
```
