# cvedix-config.cmake
# Usage: find_package(cvedix REQUIRED)
# Sets: CVEDIX_INCLUDE_DIRS, CVEDIX_LIBRARIES, CVEDIX_LIB_DIR

# Find SDK root (this file lives in <SDK>/cmake/)
get_filename_component(CVEDIX_SDK_DIR "${CMAKE_CURRENT_LIST_DIR}/.." ABSOLUTE)

# Allow override via -DCVEDIX_SDK_DIR=...
if(DEFINED CVEDIX_SDK_DIR_OVERRIDE)
    set(CVEDIX_SDK_DIR "${CVEDIX_SDK_DIR_OVERRIDE}")
endif()

# Detect architecture
if(CMAKE_SYSTEM_PROCESSOR MATCHES "aarch64|arm64")
    set(_CVEDIX_ARCH "aarch64")
else()
    set(_CVEDIX_ARCH "x86_64")
endif()

# Set paths
set(CVEDIX_INCLUDE_DIRS "${CVEDIX_SDK_DIR}/include")
set(CVEDIX_LIB_DIR "${CVEDIX_SDK_DIR}/lib/${_CVEDIX_ARCH}")

# Find core library
find_library(CVEDIX_CORE_LIBRARY
    NAMES cvedix_core
    PATHS "${CVEDIX_LIB_DIR}"
    NO_DEFAULT_PATH
)

if(NOT CVEDIX_CORE_LIBRARY)
    message(FATAL_ERROR
        "CVEDIX SDK: libcvedix_core.so not found in ${CVEDIX_LIB_DIR}\n"
        "Run scripts/package_sdk.sh to populate SDK libraries."
    )
endif()

# Collect all plugin libraries
file(GLOB CVEDIX_PLUGIN_LIBRARIES "${CVEDIX_LIB_DIR}/*.so")
list(REMOVE_ITEM CVEDIX_PLUGIN_LIBRARIES "${CVEDIX_CORE_LIBRARY}")

set(CVEDIX_LIBRARIES "${CVEDIX_CORE_LIBRARY}")

# Create imported target
if(NOT TARGET cvedix::core)
    add_library(cvedix::core SHARED IMPORTED)
    set_target_properties(cvedix::core PROPERTIES
        IMPORTED_LOCATION "${CVEDIX_CORE_LIBRARY}"
        INTERFACE_INCLUDE_DIRECTORIES "${CVEDIX_INCLUDE_DIRS}"
    )
endif()

# Status
message(STATUS "CVEDIX SDK found:")
message(STATUS "  Include: ${CVEDIX_INCLUDE_DIRS}")
message(STATUS "  Lib dir: ${CVEDIX_LIB_DIR}")
message(STATUS "  Core:    ${CVEDIX_CORE_LIBRARY}")
message(STATUS "  Plugins: ${CVEDIX_PLUGIN_LIBRARIES}")

set(cvedix_FOUND TRUE)
