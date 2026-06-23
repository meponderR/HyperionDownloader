# Hyperion Downloader
![Latest Release](https://img.shields.io/github/v/release/meponderR/HyperionDownloader) ![GitHub](https://img.shields.io/github/license/meponderR/HyperionDownloader) ![GitHub Nightly Status](https://img.shields.io/github/actions/workflow/status/meponderR/HyperionDownloader/nightly.yml?label=nightly) ![GitHub Nightly (Android) Status](https://img.shields.io/github/actions/workflow/status/meponderR/HyperionDownloader/nightly-Android-unsigned.yml?label=nightly%20(Android)) ![GitHub Nightly (iOS) Status](https://img.shields.io/github/actions/workflow/status/meponderR/HyperionDownloader/nightly-iOS.yml?label=nightly%20(iOS)) ![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/meponderR/HyperionDownloader/release.yml?label=release) ![GitHub All Releases](https://img.shields.io/github/downloads/meponderR/HyperionDownloader/total) ![GitHub Issues](https://img.shields.io/github/issues/meponderR/HyperionDownloader) ![GitHub Pull Requests](https://img.shields.io/github/issues-pr/meponderR/HyperionDownloader) 

Hyperion Downloader is a lightweight multithreaded downloader built with Wails. It currently supports Windows, macOS, Linux, iOS, and Android.

![Hyperion Downloader Logo](https://raw.githubusercontent.com/meponderR/HyperionDownloader/master/assets/icon.png)

## Download
You can download the latest release from the [Releases](https://github.com/meponderR/HyperionDownloader/releases/latest) page. iOS builds are available on [TestFlight](https://testflight.apple.com/join/TabaaenF).

## Features
- Multithreaded downloading
- Pause and resume downloads
- Cookies, user agent, referrer, authorization header support

## Known Issues
- Some servers may not support range requests, which is not fully handled yet. Regardless, the downloader would not be able to download any faster from these servers as it would download the same as a browser would.

## Resuming Downloads
If you want to resume a download, add the same URL again and it will resume the download.

## Building from Source

### Desktop

Prerequisites:
- [Git](https://git-scm.com/install/)
- [Go 1.25 or later](https://go.dev/doc/install)
- [Node.js 24 or later](https://nodejs.org/en/download)
- [PNPM](https://pnpm.io/installation)
- [Wails v3](https://v3.wails.io/quick-start/installation/)
- (Linux only) [GTK 4](https://www.gtk.org/download/linux.php)
- (Linux only) [WebKitGTK 6](https://webkitgtk.org/)
- (Mac only) [Xcode](https://developer.apple.com/xcode/)

1. Clone wails v3:
```bash
git clone --depth 1 https://github.com/wailsapp/wails.git
```
1. Clone the repository:
```bash
git clone https://github.com/meponderR/HyperionDownloader.git
cd HyperionDownloader
```
1. Run wails3 build:
```bash
wails3 build
```

### iOS

Prerequisites:
- macOS 26 or later
- [Git](https://git-scm.com/install/)
- [Go 1.25 or later](https://go.dev/doc/install)
- [Node.js 24 or later](https://nodejs.org/en/download)
- [PNPM](https://pnpm.io/installation)
- [Xcode](https://developer.apple.com/xcode/)

1. Clone my fork of Wails, merge with upstream, and install:
```bash
git clone https://github.com/meponderR/wails.git
cd wails
git remote add upstream https://github.com/wailsapp/wails.git
git fetch upstream
git merge upstream/main
cd v3/cmd/wails3
go install
cd ../../../..
```
2. Clone the repository:
```bash
git clone https://github.com/meponderR/HyperionDownloader.git
cd HyperionDownloader
```
3. Open the iOS project in Xcode:
```bash
open build/ios/xcode/main.xcodeproj
```

4. In Xcode, select your development team and allow it to configure signing.
5. Build and run the project on your device or simulator.

### Android

#### Building on Windows

Prerequisites:
- [Git](https://git-scm.com/install/)
- [Go 1.25 or later](https://go.dev/doc/install)
- [Node.js 24 or later](https://nodejs.org/en/download)
- [OpenJDK 21](https://adoptium.net/temurin/releases?version=21&os=windows&arch=any)
- [Android Studio](https://developer.android.com/studio)

1. Install the required Android SDK components:
```powershell
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;26.3.11579264"
```
2. Clone wails v3:
```powershell
git clone --depth 1 https://github.com/wailsapp/wails.git
```
3. Clone the repository:
```powershell
git clone https://github.com/meponderR/HyperionDownloader.git
cd HyperionDownloader
```
4. Ensure that the `JAVA_HOME`, `ANDROID_HOME`, and `ANDROID_NDK_HOME` environment variables are set correctly. For example:
```powershell
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21"
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"
setx ANDROID_NDK_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk\ndk\26.3.11579264"
```
5. Run .\build\android\buildAndroid.ps1 to build the Android APK:
```powershell
.\build\android\buildAndroid.ps1 -BuildType "production" #can be "production" or "debug"
```
6. Output APKs will be located in the `build\android\app\build\outputs\apk\release\` or `build\android\app\build\outputs\apk\debug\` directories.

#### Building on Linux or macOS
Prerequisites:
- [Git](https://git-scm.com/install/)
- [Go 1.25 or later](https://go.dev/doc/install)
- [Node.js 24 or later](https://nodejs.org/en/download)
- [OpenJDK 21](https://adoptium.net/temurin/releases?version=21&os=any&arch=any)
- [Android Command Line Tools](https://developer.android.com/studio#command-tools)

1. Install the required Android SDK components:
```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;26.3.11579264"
```
2. Clone wails v3:
```bash
git clone --depth 1 https://github.com/wailsapp/wails.git
```
3. Clone the repository:
```bash
git clone https://github.com/meponderR/HyperionDownloader.git
cd HyperionDownloader
```
4. Ensure that the `JAVA_HOME`, `CC`, `CXX`, `CGO_ENABLED` environment variables are set correctly. For example:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools
export CC=$ANDROID_HOME/ndk/26.3.11579264/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android21-clang
export CXX=$ANDROID_HOME/ndk/26.3.11579264/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android21-clang++
export CGO_ENABLED=1
wails3 task android:package:fat
```
5. Output APKs will be located in the `build/android/app/build/outputs/apk/release/` directory.


## License
This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details

## Acknowledgements
- [Wails](https://wails.io/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Go](https://golang.org/)
- [fastHTTP](https://github.com/valyala/fasthttp)
- [React Router](https://reactrouter.com/) 
- [pretty-bytes](https://github.com/sindresorhus/pretty-bytes)
- [notistack](https://notistack.com/)
- [Vite](https://vite.dev/)

## Donations
If you find this project useful and would like to support its development, you can donate via the following methods:
- [!["Buy Me A Coffee"](https://cdn.buymeacoffee.com/buttons/v2/default-blue.png)](https://buymeacoffee.com/meponder)
- Cryptocurrency:
  - Bitcoin (Mainnet): `bc1qyneg42agd8qv3qnm22w7cnclj8s4s8mtj9crsy`
  - Ethereum-Based: `0x9E21F92BDC48f791B8a4f259c09c9573f22D04cD`
  - Monero: `45PeDfaWjLcDdYQ8SE1jvVJHDU6gwhzQQB6zoMvwsSDTMWaVWZbjKHxdE9rGDNVYd9Wpw4E7MQaqs32DyXMwXc3XL4dywJB`