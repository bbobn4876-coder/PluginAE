#!/bin/bash

# PluginAE Build Script
# This script simplifies the build process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}PluginAE Build Script${NC}"
echo "================================"

# Check if AE_SDK_PATH is set
if [ -z "$AE_SDK_PATH" ]; then
    echo -e "${YELLOW}Warning: AE_SDK_PATH environment variable is not set${NC}"
    echo "Please set it to your After Effects SDK path:"
    echo "  export AE_SDK_PATH=/path/to/AfterEffectsSDK"
    echo ""
    read -p "Enter AE SDK path now (or press Enter to skip): " sdk_path
    if [ ! -z "$sdk_path" ]; then
        export AE_SDK_PATH="$sdk_path"
    fi
fi

# Build configuration (default: Release)
BUILD_TYPE="${1:-Release}"

echo ""
echo "Build Configuration:"
echo "  Type: $BUILD_TYPE"
echo "  AE SDK: ${AE_SDK_PATH:-Not set}"
echo ""

# Create build directory
if [ ! -d "build" ]; then
    echo -e "${GREEN}Creating build directory...${NC}"
    mkdir build
fi

cd build

# Configure with CMake
echo -e "${GREEN}Configuring with CMake...${NC}"
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    cmake -G Xcode \
          -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
          ${AE_SDK_PATH:+-DAE_SDK_PATH="$AE_SDK_PATH"} \
          ..
else
    # Linux or other
    cmake -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
          ${AE_SDK_PATH:+-DAE_SDK_PATH="$AE_SDK_PATH"} \
          ..
fi

# Build
echo -e "${GREEN}Building project...${NC}"
cmake --build . --config $BUILD_TYPE

echo ""
echo -e "${GREEN}Build complete!${NC}"
echo ""
echo "Output location:"
if [ "$(uname)" == "Darwin" ]; then
    echo "  build/$BUILD_TYPE/PluginAE.plugin"
else
    echo "  build/PluginAE.aex"
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy the plugin to your After Effects plugins folder"
echo "2. Copy the presets/ folder to the same location"
echo "3. Restart After Effects"
echo ""
