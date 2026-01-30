# 📝 Creating Custom Templates

This guide explains how to create and share your own workflow templates for ForgeFlow.

## What is a Template?

A template is a pre-built workflow that users can import with one click. Templates save time by providing ready-to-use automation patterns.

## Template Structure

Every template is a JSON object with this structure:

```json
{
  "id": "my-template-id",
  "name": "My Template Name",
  "description": "What this template does",
  "icon": "🚀",
  "category": "Automation",
  "author": "YourGitHubUsername",
  "nodes": [...],
  "connections": [...]
}
```

## Fields Explained

### Required Fields

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"file-backup"` | Unique kebab-case identifier |
| `name` | string | `"File Backup"` | Display name shown to users |
| `description` | string | `"Backup files daily"` | Short description (1-2 sentences) |
| `icon` | string | `"💾"` | Single emoji icon |
| `category` | string | `"Automation"` | Template category |
| `author` | string | `"OffLine911"` | Your GitHub username |
| `nodes` | array | `[...]` | Array of node definitions |
| `connections` | array | `[...]` | Array of edge connections |

### Categories

Use one of these categories:
- **Automation** - File operations, scheduled tasks, scripts
- **Productivity** - Reminders, timers, organization tools
- **DevOps** - Monitoring, deployment, CI/CD
- **AI** - LLM integrations, chatbots, summarization
- **Data** - Parsing, transformations, conversions
- **Integration** - Webhooks, APIs, third-party services

## Defining Nodes

Each node in the `nodes` array has this structure:

```json
{
  "type": "node_type_id",
  "position": { "x": 100, "y": 100 },
  "data": {
    "configKey": "configValue"
  }
}
```

### Node Fields

| Field | Description |
|-------|-------------|
| `type` | The node type ID (see Node Types below) |
| `position` | X/Y coordinates on the canvas |
| `data` | Configuration object for the node |

### Common Node Types

**Triggers:**
- `trigger_manual` - Manual button trigger
- `trigger_schedule` - Cron-based schedule
- `trigger_file_watch` - File system watcher
- `trigger_webhook` - HTTP webhook receiver

**Actions:**
- `action_notification` - Desktop notification
- `action_file` - Read/write/append files
- `action_http` - HTTP requests
- `action_script` - Run shell commands

**Conditions:**
- `condition_if` - If/else branching
- `condition_filter` - Filter arrays

**Loops:**
- `loop_foreach` - Iterate over arrays
- `loop_repeat` - Repeat N times

**AI:**
- `action_ai` - AI prompt (Ollama/OpenAI)

## Defining Connections

Connections link nodes together:

```json
{
  "sourceIndex": 0,
  "sourcePort": "out",
  "targetIndex": 1,
  "targetPort": "in"
}
```

### Connection Fields

| Field | Description |
|-------|-------------|
| `sourceIndex` | Index of source node in `nodes` array |
| `sourcePort` | Output handle ID (usually `"out"`) |
| `targetIndex` | Index of target node in `nodes` array |
| `targetPort` | Input handle ID (usually `"in"`) |

### Special Ports

Some nodes have multiple output ports:

**Condition nodes:**
- `"true"` - Condition is true
- `"false"` - Condition is false

**Loop nodes:**
- `"loop"` - Each iteration
- `"done"` - After loop completes

**Filter nodes:**
- `"match"` - Matched items
- `"nomatch"` - Non-matched items

## Complete Example

Here's a full template example:

```json
{
  "id": "morning-greeting",
  "name": "Morning Greeting",
  "description": "Show a greeting notification every morning at 8 AM",
  "icon": "🌅",
  "category": "Productivity",
  "author": "OffLine911",
  "nodes": [
    {
      "type": "trigger_schedule",
      "position": { "x": 100, "y": 150 },
      "data": {
        "cron": "0 8 * * *"
      }
    },
    {
      "type": "action_date",
      "position": { "x": 350, "y": 150 },
      "data": {
        "operation": "now",
        "format": "dddd"
      }
    },
    {
      "type": "action_notification",
      "position": { "x": 600, "y": 150 },
      "data": {
        "title": "Good Morning! ☀️",
        "message": "Happy {{output}}! Have a great day!"
      }
    }
  ],
  "connections": [
    {
      "sourceIndex": 0,
      "sourcePort": "out",
      "targetIndex": 1,
      "targetPort": "in"
    },
    {
      "sourceIndex": 1,
      "sourcePort": "out",
      "targetIndex": 2,
      "targetPort": "in"
    }
  ]
}
```

## Using Variables

Use `{{variableName}}` syntax to reference:

- `{{output}}` - Previous node's output
- `{{result}}` - Same as output
- `{{env.VAR_NAME}}` - Environment variables
- `{{node_id}}` - Specific node's output

## Tips for Good Templates

✅ **Do:**
- Use descriptive names and descriptions
- Position nodes in a logical left-to-right flow
- Space nodes ~250px apart for readability
- Test your template before submitting
- Use placeholder paths users can easily change

❌ **Don't:**
- Include hardcoded API keys or passwords
- Use absolute paths specific to your machine
- Create overly complex single templates (split into multiple)
- Forget to test all branches and conditions

## Testing Your Template

1. Copy your template JSON
2. Open ForgeFlow → Import/Export
3. Paste the JSON and import
4. Run the workflow to verify it works
5. Check all paths execute correctly

## Submitting Your Template

1. Fork the [ForgeFlow-Community](https://github.com/OffLine911/ForgeFlow-Community) repo
2. Add your template to `templates.json`
3. Test it works in ForgeFlow
4. Submit a Pull Request

---

**Questions?** Open an issue on GitHub!
