# CVEDIX Node Catalog

All pipelines are built by connecting **Nodes**. Each node is a self-contained processing unit.

---

## Source Nodes

Input nodes that feed frames into the pipeline.

| Node | Header | Description |
|------|--------|-------------|
| `cvedix_file_src_node` | `nodes/src/cvedix_file_src_node.h` | Read from video file (MP4, AVI, MKV) |
| `cvedix_rtsp_src_node` | `nodes/src/cvedix_rtsp_src_node.h` | RTSP camera stream input |
| `cvedix_rtmp_src_node` | `nodes/src/cvedix_rtmp_src_node.h` | RTMP stream input |
| `cvedix_udp_src_node` | `nodes/src/cvedix_udp_src_node.h` | UDP H.264/H.265 stream |
| `cvedix_image_src_node` | `nodes/src/cvedix_image_src_node.h` | Image file or directory |
| `cvedix_app_src_node` | `nodes/src/cvedix_app_src_node.h` | Application-provided frames (cv::Mat) |

### Example: File Source
```cpp
auto src = std::make_shared<cvedix_nodes::cvedix_file_src_node>(
    "src",          // node name
    0,              // channel index
    "video.mp4",    // file path
    0.5,            // resize ratio (0.5 = half resolution)
    true,           // cycle (loop video)
    "avdec_h264",   // decoder
    0               // skip_interval (0 = every frame)
);
```

---

## Inference Nodes

AI detection, recognition, and analysis.

### Object Detection

| Node | Backend | Description |
|------|---------|-------------|
| `cvedix_yolo_detector_node` | TensorRT/ONNX | YOLOv8/v11 object detection (recommended) |
| `cvedix_face_detector_node` | OpenCV DNN | YuNet face detection |
| `cvedix_face_recognizer_node` | OpenCV DNN | SFace/FaceNet face recognition |

### Example: YOLO Detector
```cpp
auto det = std::make_shared<cvedix_nodes::cvedix_yolo_detector_node>(
    "detector",
    "yolo11n.engine",                    // model path
    cvedix_nodes::YoloVersion::YOLO11,   // version
    "labels.txt",                         // class labels
    0.45f,                                // confidence threshold
    0.5f,                                 // NMS threshold
    0,                                    // class_id_offset
    cvedix_nodes::BackendType::AUTO       // auto-detect backend
);
det->set_allowed_classes({0, 2, 3, 5, 7}); // filter specific classes
```

---

## Tracking Nodes

Multi-object tracking to maintain identity across frames.

| Node | Algorithm | Description |
|------|-----------|-------------|
| `cvedix_track_node` | ByteTrack | Default tracker (fast, accurate) |
| `cvedix_hybrid_track_node` | Hybrid | Combines IoU + ReID features |

### Example: Tracker
```cpp
auto tracker = std::make_shared<cvedix_nodes::cvedix_track_node>("tracker");
tracker->attach_to({detector});
```

---

## Behavior Analysis (BA) Nodes

Event-driven analytics rules applied on tracked objects.

| Node | Event Type | Description |
|------|-----------|-------------|
| `cvedix_ba_line_crossline_node` | CROSSLINE | Count objects crossing a line |
| `cvedix_ba_area_crowding_node` | CROWDING | Detect crowding in ROI |
| `cvedix_ba_area_enter_exit_node` | ENTER/EXIT | Object entering/exiting area |
| `cvedix_ba_area_jam_node` | JAM/UNJAM | Traffic jam detection |
| `cvedix_ba_line_speed_estimation_node` | SPEED | Estimate object speed |
| `cvedix_ba_line_wrong_way_node` | WRONG_WAY | Wrong direction detection |
| `cvedix_ba_area_loitering_node` | LOITERING | Loitering detection |
| `cvedix_ba_movement_node` | STOP_LINE | Stop line violation |

---

## OSD Node (On-Screen Display)

Unified rendering node with 18 configurable layers.

```cpp
auto osd = std::make_shared<cvedix_nodes::cvedix_osd_node>("osd");

cvedix_nodes::unified_osd_config cfg;
cfg.show_bbox = true;           // bounding boxes
cfg.show_label = true;          // class labels
cfg.show_track_id = true;       // tracking IDs
cfg.show_track_trail = true;    // movement trails
cfg.blur_labels = {"face"};     // blur specific labels (privacy)
cfg.face_blur_kernel_size = 71; // blur strength

osd->update_config(cfg);
```

---

## Middleware Nodes

Pipeline flow control.

| Node | Description |
|------|-------------|
| `cvedix_split_node` | Fan-out: 1 input → N outputs (with deep copy) |
| `cvedix_sync_node` | Merge/sync multiple branches by frame_index |
| `cvedix_multi_sync_node` | Multi-branch synchronization |

---

## Destination Nodes

Output nodes.

| Node | Description |
|------|-------------|
| `cvedix_screen_des_node` | Display on screen (X11/Wayland) |
| `cvedix_web_debug_des_node` | Web browser output (HTTP MJPEG) |
| `cvedix_file_des_node` | Write to video file |
| `cvedix_rtmp_des_node` | Push to RTMP server |
| `cvedix_rtsp_des_node` | Push to RTSP server |
| `cvedix_app_des_node` | Application callback (get cv::Mat) |

---

## Broker Nodes

Event/data output to external systems.

| Node | Protocol |
|------|----------|
| `cvedix_mqtt_broker_node` | MQTT |
| `cvedix_kafka_broker_node` | Kafka |
| `cvedix_sse_broker_node` | Server-Sent Events |
| `cvedix_webhook_broker_node` | HTTP Webhook |
| `cvedix_console_broker_node` | Console (JSON) |
