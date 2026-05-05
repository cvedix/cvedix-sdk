# CVEDIX MCP Server

MCP (Model Context Protocol) server that provides AI coding tools with CVEDIX SDK context.

## What it does

When connected to your AI coding tool, the MCP server enables:
- **Ask**: "List all detection nodes" → get filtered node catalog
- **Ask**: "Create a face detection pipeline with blur" → get generated C++ code
- **Ask**: "Explain cvedix_osd_node" → get detailed usage docs
- **Ask**: "What config options does OSD have?" → get all configurable fields

## Setup

```bash
cd mcp
npm install
npm run build
```

## Connect to AI Tools

### Cursor
Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "cvedix-sdk": {
      "command": "node",
      "args": ["/absolute/path/to/cvedix-sdk/mcp/build/index.js"]
    }
  }
}
```

### VSCode (Copilot)
Add to VS Code settings (MCP servers):
```json
{
  "mcpServers": {
    "cvedix-sdk": {
      "command": "node",
      "args": ["/absolute/path/to/cvedix-sdk/mcp/build/index.js"]
    }
  }
}
```

### Antigravity
Configure in Antigravity MCP settings with the same command/args.

## Available Capabilities

### Resources
| URI | Content |
|-----|---------|
| `cvedix://docs/node-catalog` | Full node catalog |
| `cvedix://docs/pipeline-patterns` | Pipeline topology patterns |
| `cvedix://docs/quickstart` | Getting started guide |

### Tools
| Tool | Description |
|------|-------------|
| `list_nodes` | List nodes by category/keyword |
| `explain_node` | Detailed node documentation |
| `generate_pipeline` | Generate pipeline C++ code |
| `get_config_options` | Get config struct fields |

### Prompts
| Prompt | Description |
|--------|-------------|
| `create-pipeline` | Guided pipeline builder |
| `debug-pipeline` | Debug assistance |

## Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node build/index.js
```
