cmake_minimum_required(VERSION 3.15)
project(PluginAE VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Adobe After Effects SDK Path
# User needs to set this to their AE SDK location
set(AE_SDK_PATH "" CACHE PATH "Path to Adobe After Effects SDK")

if(NOT AE_SDK_PATH)
    message(WARNING "AE_SDK_PATH is not set. Please set it to your After Effects SDK path.")
    message(WARNING "Example: cmake -DAE_SDK_PATH=/path/to/AfterEffectsSDK ..")
endif()

# Platform specific settings
if(WIN32)
    add_definitions(-DAE_OS_WIN)
    if(CMAKE_SIZEOF_VOID_P EQUAL 8)
        add_definitions(-DAE_PROC_INTELx64)
    endif()
elseif(APPLE)
    add_definitions(-DAE_OS_MAC)
    if(CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
        add_definitions(-DAE_PROC_ARM64)
    else()
        add_definitions(-DAE_PROC_INTELx64)
    endif()
endif()

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${AE_SDK_PATH}/Headers
    ${AE_SDK_PATH}/Headers/SP
    ${AE_SDK_PATH}/Util
)

# Source files
set(PLUGIN_SOURCES
    src/PluginAE.cpp
    src/PresetManager.cpp
)

set(PLUGIN_HEADERS
    include/PluginAE.h
    include/PresetManager.h
    include/entry.h
)

# Resource files
set(PLUGIN_RESOURCES
    src/PluginAE_PiPL.r
)

# Create the plugin library
if(WIN32)
    add_library(PluginAE SHARED
        ${PLUGIN_SOURCES}
        ${PLUGIN_HEADERS}
    )
    set_target_properties(PluginAE PROPERTIES
        SUFFIX ".aex"
        PREFIX ""
    )
elseif(APPLE)
    add_library(PluginAE MODULE
        ${PLUGIN_SOURCES}
        ${PLUGIN_HEADERS}
    )
    set_target_properties(PluginAE PROPERTIES
        BUNDLE TRUE
        BUNDLE_EXTENSION "plugin"
        MACOSX_BUNDLE_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/Info.plist
    )
endif()

# Link libraries
if(WIN32)
    target_link_libraries(PluginAE
        # Add Windows specific libraries if needed
    )
elseif(APPLE)
    find_library(COCOA_LIBRARY Cocoa)
    find_library(FOUNDATION_LIBRARY Foundation)
    target_link_libraries(PluginAE
        ${COCOA_LIBRARY}
        ${FOUNDATION_LIBRARY}
    )
endif()

# Installation
install(TARGETS PluginAE
    LIBRARY DESTINATION plugins
    RUNTIME DESTINATION plugins
    BUNDLE DESTINATION plugins
)

# Copy presets
install(DIRECTORY presets/
    DESTINATION presets
    FILES_MATCHING PATTERN "*.json"
)

# Print build information
message(STATUS "PluginAE Configuration:")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  AE SDK Path: ${AE_SDK_PATH}")
message(STATUS "  Platform: ${CMAKE_SYSTEM_NAME}")
message(STATUS "  Architecture: ${CMAKE_SYSTEM_PROCESSOR}")
