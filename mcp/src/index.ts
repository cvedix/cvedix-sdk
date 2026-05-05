#!/usr/bin/env node
/**
 * CVEDIX MCP Server — AI-assisted video analytics pipeline development
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { NODE_CATALOG, getNodesByCategory, getNodeByName, searchNodes } from "./resources/node-catalog.js";
import { PIPELINE_PATTERNS } from "./resources/pipeline-patterns.js";

const server = new McpServer({ name: "cvedix-sdk", version: "1.0.0" });

// ── Resources ──
server.resource("node-catalog", "cvedix://docs/node-catalog", async (uri) => {
  const cats = [...new Set(NODE_CATALOG.map(n => n.category))];
  let text = "# CVEDIX Node Catalog\n\n";
  for (const c of cats) {
    text += `## ${c}\n| Node | Description |\n|------|-------------|\n`;
    for (const n of getNodesByCategory(c)) text += `| \`${n.name}\` | ${n.description} |\n`;
    text += "\n";
  }
  return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
});

server.resource("pipeline-patterns", "cvedix://docs/pipeline-patterns", async (uri) => ({
  contents: [{ uri: uri.href, mimeType: "text/markdown", text: PIPELINE_PATTERNS }],
}));

// ── Tools ──
server.tool("list_nodes", "List CVEDIX nodes by category or keyword", {
  category: z.string().optional().describe("source|inference|tracking|ba|osd|middleware|destination|broker"),
  keyword: z.string().optional().describe("Search keyword"),
}, async ({ category, keyword }) => {
  let nodes = category ? getNodesByCategory(category) : NODE_CATALOG;
  if (keyword) nodes = searchNodes(keyword, nodes);
  const text = nodes.map(n => `- **${n.name}** (${n.category}): ${n.description}`).join("\n");
  return { content: [{ type: "text", text: text || "No nodes found." }] };
});

server.tool("explain_node", "Get detailed usage for a CVEDIX node", {
  node_name: z.string().describe("e.g. cvedix_yolo_detector_node"),
}, async ({ node_name }) => {
  const n = getNodeByName(node_name);
  if (!n) return { content: [{ type: "text", text: `Node '${node_name}' not found.` }] };
  return { content: [{ type: "text", text: `# ${n.name}\n\n${n.description}\n\n## Header\n\`${n.header}\`\n\n## Constructor\n\`\`\`cpp\n${n.constructor}\n\`\`\`\n\n## Example\n\`\`\`cpp\n${n.example}\n\`\`\`` }] };
});

server.tool("generate_pipeline", "Generate C++ pipeline code from description", {
  description: z.string().describe("e.g. 'detect faces from RTSP, blur them, display on web'"),
  input_type: z.enum(["file","rtsp","rtmp"]).optional(),
  output_type: z.enum(["web","screen","file","rtmp"]).optional(),
}, async ({ description, input_type, output_type }) => {
  const dl = description.toLowerCase();
  const src = input_type || "file";
  const dst = output_type || "web";
  const face = dl.includes("face");
  const blur = dl.includes("blur");
  const track = dl.includes("track") || dl.includes("count");

  const srcMap: Record<string,string> = {
    file: `auto source = std::make_shared<cvedix_nodes::cvedix_file_src_node>("src", 0, "./video.mp4", 0.5, true, "avdec_h264");`,
    rtsp: `auto source = std::make_shared<cvedix_nodes::cvedix_rtsp_src_node>("src", 0, "rtsp://admin:pass@ip:554/ch1", 0.5, "avdec_h264");`,
    rtmp: `auto source = std::make_shared<cvedix_nodes::cvedix_rtmp_src_node>("src", 0, "rtmp://localhost/live/stream");`,
  };
  const dstMap: Record<string,string> = {
    web: `auto output = std::make_shared<cvedix_nodes::cvedix_web_debug_des_node>("out", 0, 9091);`,
    screen: `auto output = std::make_shared<cvedix_nodes::cvedix_screen_des_node>("out", 0);`,
    file: `auto output = std::make_shared<cvedix_nodes::cvedix_file_des_node>("out", 0, "output.mp4");`,
    rtmp: `auto output = std::make_shared<cvedix_nodes::cvedix_rtmp_des_node>("out", 0, "rtmp://localhost/live/out");`,
  };

  let code = `// Pipeline: ${description}\n#include <cvedix/nodes/src/cvedix_${src === "file" ? "file" : src}_src_node.h>\n`;
  code += `#include <cvedix/nodes/infers/cvedix_yolo_detector_node.h>\n`;
  if (track) code += `#include <cvedix/nodes/track/cvedix_track_node.h>\n`;
  code += `#include <cvedix/nodes/osd/cvedix_osd_node.h>\n`;
  code += `#include <cvedix/nodes/des/cvedix_${dst === "web" ? "web_debug" : dst}_des_node.h>\n\n`;
  code += `int main() {\n    CVEDIX_LOGGER_INIT();\n\n`;
  code += `    ${srcMap[src] || srcMap.file}\n\n`;
  code += `    auto det = std::make_shared<cvedix_nodes::cvedix_yolo_detector_node>(\n`;
  code += face ? `        "det", "./models/yolov11-face.engine", cvedix_nodes::YoloVersion::YOLO11,\n        "./models/face_labels.txt", 0.35f, 0.45f);\n\n`
               : `        "det", "./models/yolo11n.engine", cvedix_nodes::YoloVersion::YOLO11,\n        "./models/labels.txt", 0.45f, 0.5f);\n\n`;
  if (track) code += `    auto tracker = std::make_shared<cvedix_nodes::cvedix_track_node>("tracker");\n\n`;
  code += `    auto osd = std::make_shared<cvedix_nodes::cvedix_osd_node>("osd");\n`;
  code += `    auto cfg = osd->get_config();\n    cfg.show_bbox = true; cfg.show_label = true;\n`;
  if (blur && face) code += `    cfg.blur_labels = {"face"}; cfg.face_blur_kernel_size = 71;\n`;
  code += `    osd->update_config(cfg);\n\n`;
  code += `    ${dstMap[dst] || dstMap.web}\n\n`;
  code += `    det->attach_to({source});\n`;
  if (track) { code += `    tracker->attach_to({det});\n    osd->attach_to({tracker});\n`; }
  else code += `    osd->attach_to({det});\n`;
  code += `    output->attach_to({osd});\n\n    source->start();\n    std::cin.get();\n    source->detach_recursively();\n}\n`;

  return { content: [{ type: "text", text: "```cpp\n" + code + "```" }] };
});

// ── Prompts ──
server.prompt("create-pipeline", "Guided pipeline creation", {
  use_case: z.string().optional().describe("Describe your use case"),
}, ({ use_case }) => ({
  messages: [{ role: "user", content: { type: "text",
    text: `Create a CVEDIX pipeline.${use_case ? " Use case: " + use_case : ""}\nUse list_nodes, explain_node, generate_pipeline tools. Read cvedix://docs/node-catalog for available nodes.` } }],
}));

server.prompt("debug-pipeline", "Debug pipeline issues", {
  error: z.string().optional().describe("Error log or description"),
}, ({ error }) => ({
  messages: [{ role: "user", content: { type: "text",
    text: `Debug my CVEDIX pipeline.${error ? "\nError: " + error : ""}\nCommon issues: model not found, wrong GPU arch, LD_LIBRARY_PATH, topology errors.` } }],
}));

// ── Start ──
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CVEDIX MCP Server running on stdio");
}
main().catch(e => { console.error("Fatal:", e); process.exit(1); });
