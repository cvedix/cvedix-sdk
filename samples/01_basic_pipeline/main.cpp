/**
 * @file 01_basic_pipeline/main.cpp
 * @brief Simplest CVEDIX pipeline: File → YOLO Detector → OSD → Web Output
 *
 * This sample demonstrates the fundamental building block of every CVEDIX
 * application: Source → Processing → Display.
 *
 * Usage:
 *   ./01_basic_pipeline
 *   Open http://localhost:9091 in your browser
 */

#include <cvedix/nodes/src/cvedix_file_src_node.h>
#include <cvedix/nodes/infers/cvedix_yolo_detector_node.h>
#include <cvedix/nodes/osd/cvedix_osd_node.h>
#include <cvedix/nodes/des/cvedix_web_debug_des_node.h>

int main() {
    // Initialize logging
    CVEDIX_SET_LOG_LEVEL(cvedix_utils::cvedix_log_level::INFO);
    CVEDIX_LOGGER_INIT();

    // ────────────────────────────────────
    // Step 1: Create source node (video file)
    // ────────────────────────────────────
    auto source = std::make_shared<cvedix_nodes::cvedix_file_src_node>(
        "source",       // node name (must be unique)
        0,              // channel index
        "./cvedix_data/videos/sample.mp4",  // input video
        0.5,            // resize to 50% (faster processing)
        true,           // loop video
        "avdec_h264"    // H.264 decoder
    );

    // ────────────────────────────────────
    // Step 2: Create detector node (YOLOv11)
    // ────────────────────────────────────
    auto detector = std::make_shared<cvedix_nodes::cvedix_yolo_detector_node>(
        "detector",
        "./cvedix_data/models/yolo11n.engine",   // TensorRT engine
        cvedix_nodes::YoloVersion::YOLO11,
        "./cvedix_data/models/labels.txt",       // class labels
        0.45f,                                    // confidence threshold
        0.5f                                      // NMS threshold
    );

    // ────────────────────────────────────
    // Step 3: Create OSD node (draw results)
    // ────────────────────────────────────
    auto osd = std::make_shared<cvedix_nodes::cvedix_osd_node>("osd");
    auto cfg = osd->get_config();
    cfg.show_bbox = true;       // draw bounding boxes
    cfg.show_label = true;      // show class labels
    cfg.show_center_dot = true; // show center dot
    osd->update_config(cfg);

    // ────────────────────────────────────
    // Step 4: Create web output (view in browser)
    // ────────────────────────────────────
    auto web_output = std::make_shared<cvedix_nodes::cvedix_web_debug_des_node>(
        "web_output", 0, 9091);

    // ────────────────────────────────────
    // Step 5: Connect the pipeline
    // ────────────────────────────────────
    //   source → detector → osd → web_output
    detector->attach_to({source});
    osd->attach_to({detector});
    web_output->attach_to({osd});

    // ────────────────────────────────────
    // Step 6: Start and wait
    // ────────────────────────────────────
    source->start();

    std::cout << "\n";
    std::cout << "╔════════════════════════════════════════╗\n";
    std::cout << "║  Basic Pipeline Running                ║\n";
    std::cout << "║  Open: http://localhost:9091            ║\n";
    std::cout << "║  Press Enter to stop...                ║\n";
    std::cout << "╚════════════════════════════════════════╝\n";

    std::string wait;
    std::getline(std::cin, wait);

    // Clean shutdown
    source->detach_recursively();
    return 0;
}
