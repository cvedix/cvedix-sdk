# CVEDIX SDK — Quick Start Guide

## 1. Prerequisites

| Requirement | Version |
|-------------|---------|
| Ubuntu | 20.04 / 22.04 |
| GCC | ≥ 7.5 |
| OpenCV | ≥ 4.6 (with GStreamer) |
| CMake | ≥ 3.16 |

Optional: CUDA + TensorRT (for GPU acceleration)

## 2. Install Dependencies

```bash
sudo apt update
sudo apt install -y build-essential cmake libopencv-dev \
    libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
```

## 3. Set SDK Path

```bash
export CVEDIX_SDK_DIR=/path/to/cvedix-sdk
export LD_LIBRARY_PATH=$CVEDIX_SDK_DIR/lib/x86_64:$LD_LIBRARY_PATH
```

## 4. Build a Sample

```bash
cd $CVEDIX_SDK_DIR/samples
mkdir -p build && cd build
cmake -DCVEDIX_SDK_DIR=$CVEDIX_SDK_DIR ..
make -j$(nproc)
```

## 5. Run

```bash
./01_basic_pipeline
```

## 6. Create Your Own Project

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.16)
project(my_app)

set(CMAKE_CXX_STANDARD 17)

# Point to SDK
list(APPEND CMAKE_PREFIX_PATH "/path/to/cvedix-sdk/cmake")
find_package(cvedix REQUIRED)

add_executable(my_app main.cpp)
target_include_directories(my_app PRIVATE ${CVEDIX_INCLUDE_DIRS})
target_link_libraries(my_app ${CVEDIX_LIBRARIES})
```

## Next Steps

- [Node Catalog](NODE_CATALOG.md) — Browse 80+ available nodes
- [Pipeline Patterns](PIPELINE_PATTERNS.md) — Common pipeline topologies
- [API Reference](API_REFERENCE.md) — Config structs and methods
