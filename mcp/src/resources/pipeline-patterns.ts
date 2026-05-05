export const PIPELINE_PATTERNS = `# CVEDIX Pipeline Patterns

## Pattern 1: Simple Detection (1-1-1)
\`\`\`
Source → Detector → OSD → Output
\`\`\`
Simplest pipeline. One input, one model, one output.

## Pattern 2: Detection + Tracking (1-1-1-1)
\`\`\`
Source → Detector → Tracker → OSD → Output
\`\`\`
Add tracking to maintain object identity across frames.

## Pattern 3: Multi-Output (1-1-N)
\`\`\`
Source → Detector → Split → OSD → Screen
                         → Broker → MQTT
\`\`\`
Fan-out to multiple destinations.

## Pattern 4: Multi-Branch Parallel (1-N-1-N)
\`\`\`
                    ┌→ Face Detector  ──┐
Source → Split ────┤                     ├→ Sync → OSD → Output
                    └→ Vehicle Detector ┘
\`\`\`
Run multiple AI models in parallel, merge results.

## Pattern 5: Behavior Analysis
\`\`\`
Source → Detector → Tracker → BA Node → OSD → Output
                                  └→ Broker → MQTT
\`\`\`
Add analytics rules (crossline, crowding, violations).

## Pattern 6: Multi-Camera (N-1-N)
\`\`\`
Camera 1 → Det ──┐
Camera 2 → Det ──┤→ Tracker → OSD → Output
Camera 3 → Det ──┘
\`\`\`

## Key API
\`\`\`cpp
downstream->attach_to({upstream});  // connect nodes
source->start();                    // start pipeline
source->detach_recursively();       // clean shutdown
\`\`\`
`;
