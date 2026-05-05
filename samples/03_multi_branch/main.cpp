/**
 * @file 03_multi_branch/main.cpp
 * @brief Multi-branch parallel detection (1-N-1-N pattern)
 *
 * Pipeline:
 *                          ┌→ Face Detector  ──┐
 *   Source → Split Input ─┤                     ├→ Sync → OSD → Web Output
 *                          └→ Vehicle Detector ┘
 *
 * Demonstrates:
 *   - Running 2 AI models in parallel on the same stream
 *   - Splitting input with deep copy for thread safety
 *   - Merging results from multiple branches via sync node
 *   - Blurring faces while showing vehicle detections
 */

#include <cvedix/nodes/src/cvedix_file_src_node.h>
#include <cvedix/nodes/infers/cvedix_yolo_detector_node.h>
#include <cvedix/nodes/mid/cvedix_split_node.h>
#include <cvedix/nodes/mid/cvedix_sync_node.h>
#include <cvedix/nodes/osd/cvedix_osd_node.h>
#include <cvedix/nodes/des/cvedix_web_debug_des_node.h>

#include <fstream>

int main() {
    CVEDIX_SET_LOG_LEVEL(cvedix_utils::cvedix_log_level::INFO);
    CVEDIX_LOGGER_INIT();

    // Face model labels
    std::ofstream("/tmp/cvedix_face_labels.txt") << "face\n";

    // ── Source ──
    auto source = std::make_shared<cvedix_nodes::cvedix_file_src_node>(
        "source", 0,
        "./cvedix_data/videos/sample.mp4",
        0.5, true, "avdec_h264", 0
    );

    // ── Split (deep copy for parallel branches) ──
    auto split = std::make_shared<cvedix_nodes::cvedix_split_node>(
        "split_in", false, true);

    // ── Branch A: Face Detection ──
    auto face_det = std::make_shared<cvedix_nodes::cvedix_yolo_detector_node>(
        "face_det",
        "./cvedix_data/models/tensorrt/face/yolov11-model-face-fp16.engine",
        cvedix_nodes::YoloVersion::YOLO11,
        "/tmp/cvedix_face_labels.txt",
        0.35f, 0.45f, 0,
        cvedix_nodes::BackendType::AUTO
    );
    face_det->set_allowed_classes({0});

    // ── Branch B: Vehicle Detection (COCO classes) ──
    auto vehicle_det = std::make_shared<cvedix_nodes::cvedix_yolo_detector_node>(
        "vehicle_det",
        "./cvedix_data/models/yolo11n.engine",
        cvedix_nodes::YoloVersion::YOLO11,
        "./cvedix_data/models/labels.txt",
        0.45f, 0.5f,
        100,   // offset to avoid class ID collision with face model
        cvedix_nodes::BackendType::AUTO
    );
    vehicle_det->set_allowed_classes({100, 102, 103, 105, 107}); // person,car,motorcycle,bus,truck

    // ── Sync (merge both branches) ──
    auto sync = std::make_shared<cvedix_nodes::cvedix_sync_node>(
        "sync", cvedix_nodes::cvedix_sync_mode::MERGE, 500);

    // ── OSD (blur faces, show vehicle boxes) ──
    auto osd = std::make_shared<cvedix_nodes::cvedix_osd_node>("osd");
    auto cfg = osd->get_config();
    cfg.show_bbox = true;
    cfg.show_label = true;
    cfg.blur_labels = {"face"};
    cfg.face_blur_kernel_size = 71;
    osd->update_config(cfg);

    // ── Web Output ──
    auto web = std::make_shared<cvedix_nodes::cvedix_web_debug_des_node>(
        "web", 0, 9091);

    // ── Build Pipeline ──
    split->attach_to({source});
    face_det->attach_to({split});
    vehicle_det->attach_to({split});
    sync->attach_to({face_det, vehicle_det});
    osd->attach_to({sync});
    web->attach_to({osd});

    source->start();

    std::cout << "\n╔════════════════════════════════════════════╗\n"
              << "║  Multi-Branch: Face + Vehicle Detection     ║\n"
              << "║  Open: http://localhost:9091                ║\n"
              << "║  Press Enter to stop...                     ║\n"
              << "╚════════════════════════════════════════════╝\n";

    std::string wait;
    std::getline(std::cin, wait);
    source->detach_recursively();
}
