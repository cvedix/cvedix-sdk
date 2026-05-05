/**
 * @file 02_face_detection_blur/main.cpp
 * @brief Face detection with privacy blur
 *
 * Pipeline:
 *   File Source → YOLOv11-Face Detector → OSD (with face blur) → Web Output
 *
 * Demonstrates:
 *   - Using a face-specific YOLOv11 model
 *   - Applying Gaussian blur on detected faces for privacy protection
 *   - Configuring OSD blur_labels
 *
 * Usage:
 *   ./02_face_detection_blur
 *   Open http://localhost:9091
 */

#include <cvedix/nodes/src/cvedix_file_src_node.h>
#include <cvedix/nodes/infers/cvedix_yolo_detector_node.h>
#include <cvedix/nodes/osd/cvedix_osd_node.h>
#include <cvedix/nodes/des/cvedix_web_debug_des_node.h>

#include <fstream>

int main() {
    CVEDIX_SET_LOG_LEVEL(cvedix_utils::cvedix_log_level::INFO);
    CVEDIX_LOGGER_INIT();

    // Create a temporary labels file for face model (1 class)
    const std::string face_labels_path = "/tmp/cvedix_face_labels.txt";
    std::ofstream("/tmp/cvedix_face_labels.txt") << "face\n";

    // ── Source ──
    auto source = std::make_shared<cvedix_nodes::cvedix_file_src_node>(
        "source", 0,
        "./cvedix_data/videos/sample.mp4",
        0.5, true, "avdec_h264"
    );

    // ── Face Detector (YOLOv11-face) ──
    auto detector = std::make_shared<cvedix_nodes::cvedix_yolo_detector_node>(
        "face_detector",
        "./cvedix_data/models/tensorrt/face/yolov11-model-face-fp16.engine",
        cvedix_nodes::YoloVersion::YOLO11,
        face_labels_path,
        0.35f,   // lower threshold for faces
        0.45f,
        0,
        cvedix_nodes::BackendType::AUTO
    );
    detector->set_allowed_classes({0});  // only class 0 = face

    // ── OSD with Face Blur ──
    auto osd = std::make_shared<cvedix_nodes::cvedix_osd_node>("osd");
    auto cfg = osd->get_config();
    cfg.show_bbox = true;
    cfg.show_label = true;

    // ★ Key feature: blur faces for privacy
    cfg.blur_labels = {"face"};          // blur any target labeled "face"
    cfg.face_blur_kernel_size = 71;      // blur strength (larger = stronger)

    osd->update_config(cfg);

    // ── Web Output ──
    auto web = std::make_shared<cvedix_nodes::cvedix_web_debug_des_node>(
        "web_output", 0, 9091);

    // ── Pipeline ──
    detector->attach_to({source});
    osd->attach_to({detector});
    web->attach_to({osd});

    source->start();

    std::cout << "\n╔════════════════════════════════════════╗\n"
              << "║  Face Detection + Blur                 ║\n"
              << "║  Open: http://localhost:9091            ║\n"
              << "║  Faces will be blurred for privacy     ║\n"
              << "║  Press Enter to stop...                ║\n"
              << "╚════════════════════════════════════════╝\n";

    std::string wait;
    std::getline(std::cin, wait);
    source->detach_recursively();
}
