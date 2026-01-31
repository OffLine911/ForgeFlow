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
  "nodes": [...],
  "connections": [...]
}
```

**Note:** The `author` field is stored in `index.json`, not in individual template files. This keeps templates focused on workflow data.

## Fields Explained

### Required Fields

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"file-backup"` | Unique kebab-case identifier |
| `name` | string | `"File Backup"` | Display name shown to users |
| `description` | string | `"Backup files daily"` | Short description (1-2 sentences) |
| `icon` | string | `"💾"` | Single emoji icon |
| `category` | string | `"Automation"` | Template category |
| `nodes` | array | `[...]` | Array of node definitions |
| `connections` | array | `[...]` | Array of edge connections |

**Note:** `author` is specified in `index.json`, not in the template file itself.

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

Here's a full template file (`templates/morning-greeting.json`):

```json
{
  "id": "morning-greeting",
  "name": "Morning Greeting",
  "description": "Show a greeting notification every morning at 8 AM",
  "icon": "🌅",
  "category": "Productivity",
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

## Repository Structure

The ForgeFlow-Community repository uses a modular structure:

```
ForgeFlow-community/
├── index.json              # Template registry
└── templates/              # Individual template files
    ├── morning-greeting.json
    ├── file-backup.json
    └── ...
```

### index.json Format

The `index.json` file lists all available templates:

```json
{
  "templates": [
    {
      "id": "morning-greeting",
      "file": "morning-greeting.json",
      "name": "Morning Greeting",
      "description": "Show a greeting notification every morning at 8 AM",
      "icon": "🌅",
      "category": "Productivity",
      "author": "OffLine911",
      "downloads": 42
    }
  ]
}
```

#### Index Entry Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Unique identifier (must match template file) |
| `file` | ✅ | Filename in `templates/` folder |
| `name` | ✅ | Display name |
| `description` | ✅ | Short description (1-2 sentences) |
| `icon` | ✅ | Single emoji |
| `category` | ✅ | Template category |
| `author` | ✅ | GitHub username |
| `downloads` | ❌ | Download count (auto-updated) |

### Why Modular?

✅ **Benefits:**
- Each template is its own file - easier to review and maintain
- Parallel loading for faster performance
- Simpler git history - one file per change
- Easy to add/remove templates without merge conflicts
- Better organization as the library grows

## Submitting Your Template

### Step 1: Create Your Template File

1. Create a new JSON file in the `templates/` folder
2. Name it using kebab-case: `my-template-name.json`
3. Follow the template structure shown above

### Step 2: Update the Index

Add an entry to `index.json`:

```json
{
  "id": "my-template-name",
  "file": "my-template-name.json",
  "name": "My Template Name",
  "description": "Brief description",
  "icon": "🚀",
  "category": "Automation",
  "author": "YourGitHubUsername"
}
```

### Step 3: Submit

1. Fork the [ForgeFlow-community](https://github.com/OffLine911/ForgeFlow-community) repo
2. Add your template file to `templates/` folder
3. Update `index.json` with your template entry
4. Test it works in ForgeFlow
5. Submit a Pull Request with:
   - Template file: `templates/your-template.json`
   - Updated: `index.json`

### Pull Request Checklist

- [ ] Template file is valid JSON
- [ ] Template has been tested in ForgeFlow
- [ ] `index.json` entry matches template metadata
- [ ] No hardcoded secrets or personal paths
- [ ] Description is clear and concise
- [ ] Icon is a single emoji

---

**Questions?** Open an issue on GitHub!
