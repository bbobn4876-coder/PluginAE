@echo off
REM PluginAE Build Script for Windows
REM This script simplifies the build process

setlocal enabledelayedexpansion

echo ================================
echo PluginAE Build Script
echo ================================
echo.

REM Check if AE_SDK_PATH is set
if "%AE_SDK_PATH%"=="" (
    echo WARNING: AE_SDK_PATH environment variable is not set
    echo Please set it to your After Effects SDK path:
    echo   set AE_SDK_PATH=C:\Path\To\AfterEffectsSDK
    echo.
    set /p sdk_path="Enter AE SDK path now (or press Enter to skip): "
    if not "!sdk_path!"=="" (
        set AE_SDK_PATH=!sdk_path!
    )
)

REM Build configuration (default: Release)
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=Release

echo.
echo Build Configuration:
echo   Type: %BUILD_TYPE%
echo   AE SDK: %AE_SDK_PATH%
echo.

REM Create build directory
if not exist "build" (
    echo Creating build directory...
    mkdir build
)

cd build

REM Configure with CMake
echo Configuring with CMake...
if "%AE_SDK_PATH%"=="" (
    cmake -G "Visual Studio 16 2019" -A x64 ^
          -DCMAKE_BUILD_TYPE=%BUILD_TYPE% ^
          ..
) else (
    cmake -G "Visual Studio 16 2019" -A x64 ^
          -DCMAKE_BUILD_TYPE=%BUILD_TYPE% ^
          -DAE_SDK_PATH="%AE_SDK_PATH%" ^
          ..
)

if errorlevel 1 (
    echo CMake configuration failed!
    pause
    exit /b 1
)

REM Build
echo Building project...
cmake --build . --config %BUILD_TYPE%

if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo ================================
echo Build complete!
echo ================================
echo.
echo Output location:
echo   build\%BUILD_TYPE%\PluginAE.aex
echo.
echo Next steps:
echo 1. Copy PluginAE.aex to your After Effects plugins folder
echo 2. Copy the presets\ folder to the same location
echo 3. Restart After Effects
echo.

pause
