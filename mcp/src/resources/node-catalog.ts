export interface NodeInfo {
  name: string;
  category: string;
  header: string;
  description: string;
  constructor: string;
  example: string;
  config?: string;
}

export const NODE_CATALOG: NodeInfo[] = [
  // ── Source ──
  { name: "cvedix_file_src_node", category: "source", header: "nodes/src/cvedix_file_src_node.h",
    description: "Read from video file (MP4, AVI, MKV)",
    constructor: `cvedix_file_src_node(name, channel, path, resize_ratio, cycle, decoder, skip_interval)`,
    example: `auto src = std::make_shared<cvedix_nodes::cvedix_file_src_node>("src", 0, "video.mp4", 0.5, true, "avdec_h264");` },
  { name: "cvedix_rtsp_src_node", category: "source", header: "nodes/src/cvedix_rtsp_src_node.h",
    description: "RTSP camera stream input",
    constructor: `cvedix_rtsp_src_node(name, channel, url, resize_ratio, decoder)`,
    example: `auto src = std::make_shared<cvedix_nodes::cvedix_rtsp_src_node>("src", 0, "rtsp://admin:pass@ip:554/ch1", 0.5);` },
  { name: "cvedix_app_src_node", category: "source", header: "nodes/src/cvedix_app_src_node.h",
    description: "Application-provided frames (cv::Mat)",
    constructor: `cvedix_app_src_node(name, channel)`,
    example: `auto src = std::make_shared<cvedix_nodes::cvedix_app_src_node>("src", 0);` },
  // ── Inference ──
  { name: "cvedix_yolo_detector_node", category: "inference", header: "nodes/infers/cvedix_yolo_detector_node.h",
    description: "YOLOv8/v11 object detection (TensorRT/ONNX)",
    constructor: `cvedix_yolo_detector_node(name, model, version, labels, conf, nms, offset, backend)`,
    example: `auto det = std::make_shared<cvedix_nodes::cvedix_yolo_detector_node>("det", "yolo11n.engine", cvedix_nodes::YoloVersion::YOLO11, "labels.txt", 0.45f, 0.5f);` },
  { name: "cvedix_face_detector_node", category: "inference", header: "nodes/infers/cvedix_face_detector_node.h",
    description: "YuNet face detection with 5-point landmarks",
    constructor: `cvedix_face_detector_node(name, model_path)`,
    example: `auto det = std::make_shared<cvedix_nodes::cvedix_face_detector_node>("det", "face_detection_yunet.onnx");` },
  { name: "cvedix_face_recognizer_node", category: "inference", header: "nodes/infers/cvedix_face_recognizer_node.h",
    description: "Face recognition (SFace/FaceNet) with embedding matching",
    constructor: `cvedix_face_recognizer_node(name, model, db_path)`,
    example: `auto rec = std::make_shared<cvedix_nodes::cvedix_face_recognizer_node>("rec", "sface.onnx", "./face_db/");` },
  { name: "cvedix_milvus_face_search_node", category: "inference", header: "nodes/infers/cvedix_milvus_face_search_node.h",
    description: "Large-scale face search via Milvus vector database (100M+ faces, HNSW index). Requires -DCVEDIX_WITH_MILVUS=ON and running Milvus server.",
    constructor: `cvedix_milvus_face_search_node(name, milvus_uri, collection, dimension, threshold, top_k, metric)`,
    example: `auto search = std::make_shared<cvedix_nodes::cvedix_milvus_face_search_node>("search", "localhost:19530", "cvedix_faces", 1024, 0.70f);` },
  // ── Tracking ──
  { name: "cvedix_track_node", category: "tracking", header: "nodes/track/cvedix_track_node.h",
    description: "ByteTrack multi-object tracker",
    constructor: `cvedix_track_node(name)`,
    example: `auto tracker = std::make_shared<cvedix_nodes::cvedix_track_node>("tracker");` },
  // ── BA ──
  { name: "cvedix_ba_line_crossline_node", category: "ba", header: "nodes/ba/cvedix_ba_line_crossline_node.h",
    description: "Count objects crossing a defined line",
    constructor: `cvedix_ba_line_crossline_node(name, lines_map)`,
    example: `auto ba = std::make_shared<cvedix_nodes::cvedix_ba_line_crossline_node>("ba", lines);` },
  { name: "cvedix_ba_area_crowding_node", category: "ba", header: "nodes/ba/cvedix_ba_area_crowding_node.h",
    description: "Detect crowding when count exceeds threshold",
    constructor: `cvedix_ba_area_crowding_node(name, rois, configs, fps)`,
    example: `auto ba = std::make_shared<cvedix_nodes::cvedix_ba_area_crowding_node>("ba", rois, configs, 30);` },
  { name: "cvedix_ba_area_enter_exit_node", category: "ba", header: "nodes/ba/cvedix_ba_area_enter_exit_node.h",
    description: "Detect objects entering/exiting polygon area",
    constructor: `cvedix_ba_area_enter_exit_node(name, rois)`,
    example: `auto ba = std::make_shared<cvedix_nodes::cvedix_ba_area_enter_exit_node>("ba", rois);` },
  // ── OSD ──
  { name: "cvedix_osd_node", category: "osd", header: "nodes/osd/cvedix_osd_node.h",
    description: "Unified OSD with 18 rendering layers (bbox, label, blur, pose, plate, seg...)",
    constructor: `cvedix_osd_node(name, font_path)`,
    example: `auto osd = std::make_shared<cvedix_nodes::cvedix_osd_node>("osd");\nauto cfg = osd->get_config();\ncfg.show_bbox = true;\ncfg.blur_labels = {"face"};\nosd->update_config(cfg);` },
  // ── Middleware ──
  { name: "cvedix_split_node", category: "middleware", header: "nodes/mid/cvedix_split_node.h",
    description: "Fan-out: 1 input → N outputs (with optional deep copy)",
    constructor: `cvedix_split_node(name, by_channel, deep_copy)`,
    example: `auto split = std::make_shared<cvedix_nodes::cvedix_split_node>("split", false, true);` },
  { name: "cvedix_sync_node", category: "middleware", header: "nodes/mid/cvedix_sync_node.h",
    description: "Merge/sync multiple branches by frame_index",
    constructor: `cvedix_sync_node(name, mode, timeout_ms)`,
    example: `auto sync = std::make_shared<cvedix_nodes::cvedix_sync_node>("sync", cvedix_nodes::cvedix_sync_mode::MERGE, 500);` },
  // ── Destination ──
  { name: "cvedix_web_debug_des_node", category: "destination", header: "nodes/des/cvedix_web_debug_des_node.h",
    description: "Web browser output (HTTP MJPEG dashboard)",
    constructor: `cvedix_web_debug_des_node(name, channel, port)`,
    example: `auto web = std::make_shared<cvedix_nodes::cvedix_web_debug_des_node>("web", 0, 9091);` },
  { name: "cvedix_screen_des_node", category: "destination", header: "nodes/des/cvedix_screen_des_node.h",
    description: "Display on screen (X11)",
    constructor: `cvedix_screen_des_node(name, channel)`,
    example: `auto screen = std::make_shared<cvedix_nodes::cvedix_screen_des_node>("screen", 0);` },
  { name: "cvedix_file_des_node", category: "destination", header: "nodes/des/cvedix_file_des_node.h",
    description: "Write to video file",
    constructor: `cvedix_file_des_node(name, channel, path)`,
    example: `auto file = std::make_shared<cvedix_nodes::cvedix_file_des_node>("file", 0, "output.mp4");` },
  // ── Broker ──
  { name: "cvedix_mqtt_broker_node", category: "broker", header: "nodes/broker/cvedix_mqtt_broker_node.h",
    description: "Publish detection events via MQTT",
    constructor: `cvedix_mqtt_broker_node(name, host, port, topic)`,
    example: `auto mqtt = std::make_shared<cvedix_nodes::cvedix_mqtt_broker_node>("mqtt", "localhost", 1883, "cvedix/events");` },
];

export function getNodesByCategory(category: string): NodeInfo[] {
  return NODE_CATALOG.filter(n => n.category === category.toLowerCase());
}

export function getNodeByName(name: string): NodeInfo | undefined {
  return NODE_CATALOG.find(n => n.name === name || n.name.includes(name));
}

export function searchNodes(keyword: string, nodes?: NodeInfo[]): NodeInfo[] {
  const list = nodes || NODE_CATALOG;
  const kw = keyword.toLowerCase();
  return list.filter(n => n.name.toLowerCase().includes(kw) || n.description.toLowerCase().includes(kw));
}
