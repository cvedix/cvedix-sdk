# CVEDIX Pipeline Patterns

Common pipeline topologies for real-world applications.

---

## Pattern 1: Simple Detection (1-1-1)

```
Source → Detector → OSD → Output
```

**Use case**: Basic object detection from a single camera.

```cpp
auto src = make_src("video.mp4");
auto det = make_yolo_detector("yolo11n.engine");
auto osd = make_osd();
auto out = make_web_output(9091);

det->attach_to({src});
osd->attach_to({det});
out->attach_to({osd});
src->start();
```

---

## Pattern 2: Detection + Tracking (1-1-1-1)

```
Source → Detector → Tracker → OSD → Output
```

**Use case**: Track objects across frames, maintain identity.

---

## Pattern 3: Multi-Output Fan-out (1-1-N)

```
                              ┌→ OSD → Screen
Source → Detector → Split ───┤
                              └→ Broker → MQTT
```

**Use case**: Display locally AND send events to cloud.

---

## Pattern 4: Multi-Branch Parallel Detection (1-N-1-N)

```
                    ┌→ Face Detector  ──┐
Source → Split ────┤                     ├→ Sync → OSD → Output
                    └→ Vehicle Detector ┘
```

**Use case**: Run multiple AI models in parallel on the same stream.

---

## Pattern 5: Behavior Analysis Pipeline

```
Source → Detector → Tracker → BA Node → OSD → Output
                                  │
                                  └→ Broker → MQTT/Kafka
```

**Use case**: Crossline counting, crowding detection, traffic violations.

---

## Pattern 6: Multi-Camera (N-1-N)

```
Camera 1 → Detector ──┐
Camera 2 → Detector ──┤→ Shared Tracker → OSD → Output
Camera 3 → Detector ──┘
```

**Use case**: Multiple RTSP cameras processed by shared resources.

---

## Building Blocks

### Connecting Nodes

```cpp
// downstream->attach_to({upstream1, upstream2, ...});
detector->attach_to({source});
tracker->attach_to({detector});
osd->attach_to({tracker});
output->attach_to({osd});
```

### Starting Pipeline

```cpp
source->start();               // start processing
std::cin.get();                // wait for user
source->detach_recursively();  // clean shutdown
```

### Runtime Config Update

```cpp
auto cfg = osd->get_config();
cfg.show_bbox = true;
osd->update_config(cfg);  // takes effect immediately
```
