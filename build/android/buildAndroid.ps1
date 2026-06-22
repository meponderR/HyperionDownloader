
param (
    # Build type ("debug" or "production")
    [string]$BuildType = "debug",

    # Gen Bindings (true/false)
    [bool]$GenBindings = $true,

    # Build frontend (true/false)
    [bool]$BuildFrontend = $true,

    # Build Go code (true/false)
    [bool]$BuildGo = $true,

    # Build APK (true/false)
    [bool]$BuildAPK = $true
)

# Set environment variable for Go build
$env:PRODUCTION = if ($BuildType -eq "production") { "true" } else { "false" }
$env:GOOS = "android"
$env:CGO_ENABLED = "1"
$env:MIN_SDK = "31" # Minimum Android SDK version
# Determine the appropriate toolchain path based on architecture
$NDK_ROOT = $env:ANDROID_NDK_HOME
if (-not $NDK_ROOT) {
    Write-Error "ANDROID_NDK_HOME environment variable is not set. Please set it to your Android NDK path."
    exit 1
}

# Build Flags
$BuildFlags = if ($BuildType -eq "production") {
    "-tags production,android -trimpath -buildvcs=false -ldflags=`"-w -s`""
}
else {
    "-tags android,debug -buildvcs=false -gcflags=all=`"-l`""
}

# GOARCH mapping
$env:GOARCH = "amd64"

# Compiler paths for both architectures
$CCA64 = "$NDK_ROOT/toolchains/llvm/prebuilt/windows-x86_64/bin/aarch64-linux-android$($env:MIN_SDK)-clang.cmd"
$CXXA64 = "$NDK_ROOT/toolchains/llvm/prebuilt/windows-x86_64/bin/aarch64-linux-android$($env:MIN_SDK)-clang++.cmd"
$CCX64 = "$NDK_ROOT/toolchains/llvm/prebuilt/windows-x86_64/bin/x86_64-linux-android$($env:MIN_SDK)-clang.cmd"
$CXXX64 = "$NDK_ROOT/toolchains/llvm/prebuilt/windows-x86_64/bin/x86_64-linux-android$($env:MIN_SDK)-clang++.cmd"

$env:CC = $CCX64
$env:CXX = $CXXX64

# (common:go:mod:tidy)
go mod tidy

# Generate bindings (generate:android:bindings)
if ($GenBindings) {
    wails3 generate bindings -f '-tags android' -clean=true
}

# Build frontend
if ($BuildFrontend) {
    cd frontend
    npm install
    switch ($BuildType) {
        "production" { npm run build }
        "debug" { npm run build:dev }
        default {
            Write-Error "Unsupported build type: $BuildType. Use 'debug' or 'production'."
            exit 1
        }
    }
    cd ..
}

# Build Go code (compile:go) compile:go:shared for both architectures
if ($BuildGo) {
    $BuildFlags = if ($BuildType -eq "production") {
        @(
            "-tags", "production,android",
            "-trimpath",
            #"-v",
            "-buildvcs=false",
            "-ldflags=-w -s -extldflags=-Wl,-z,max-page-size=16384"
        )
    }
    else {
        @(
            "-tags", "android,debug",
            #"-v",
            "-buildvcs=false",
            "-gcflags=all=-l",
            "-ldflags=-extldflags=-Wl,-z,max-page-size=16384"
        )
    }
    New-Item -ItemType Directory -Force -Path build/android/app/src/main/jniLibs/arm64-v8a | Out-Null
    New-Item -ItemType Directory -Force -Path build/android/app/src/main/jniLibs/x86_64    | Out-Null

    # Build for arm64-v8a
    $env:GOARCH = "arm64"
    $env:CC = $CCA64
    $env:CXX = $CXXA64
    go build -buildmode=c-shared @BuildFlags -overlay build/android/overlay.json -o build/android/app/src/main/jniLibs/arm64-v8a/libwails.so

    # Build for x86_64
    $env:GOARCH = "amd64"
    $env:CC = $CCX64
    $env:CXX = $CXXX64
    go build -buildmode=c-shared @BuildFlags -overlay build/android/overlay.json -o build/android/app/src/main/jniLibs/x86_64/libwails.so
}

# Build APK (assemble:apk and assemble:apk:release)
if ($BuildAPK) {
    cd build\android
    switch ($BuildType) {
        "production" { .\gradlew assembleRelease }
        "debug" { .\gradlew assembleDebug }
        default {
            Write-Error "Unsupported build type: $BuildType. Use 'debug' or 'production'."
            exit 1
        }
    }

    cd ..\.. # Return to project root
}

# To run ./build/android/buildAndroid.ps1 -BuildType "production" -GenBindings $true -BuildFrontend $true -BuildGo $true -BuildAPK $true