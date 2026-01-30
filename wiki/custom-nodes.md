# 🔧 Creating Custom Nodes

ForgeFlow includes a powerful Custom Node Builder that lets you create your own nodes without coding. This guide explains how to use it.

## What are Custom Nodes?

Custom nodes are user-defined automation blocks that you create visually. They can:

- Run **shell commands** (PowerShell, Bash, Python, etc.)
- Make **HTTP requests** to any API
- Execute **JavaScript** code

Custom nodes appear in your sidebar and work just like built-in nodes.

## Opening the Custom Node Builder

1. Look at the **sidebar** on the left
2. Scroll down to **"Custom Nodes"** section
3. Click the **+** button or **"Create your first custom node"**

## Creating a Custom Node

### Step 1: Basic Information

| Field | Description | Example |
|-------|-------------|---------|
| **Icon** | Click to choose an emoji | ⚡ 🔧 📦 🚀 |
| **Name** | Display name for your node | "Run Python Script" |
| **Category** | Where it appears | Action or Utility |
| **Description** | What it does | "Execute a Python script" |

### Step 2: Choose Action Type

Select one of three action types:

#### 🖥️ Shell Command
Run terminal/command line commands.

**Use for:**
- Running Python/Node/Ruby scripts
- System commands (copy, move, rename)
- PowerShell scripts
- Batch operations

#### 🌐 HTTP Request
Make API calls to any URL.

**Use for:**
- Calling REST APIs
- Sending webhooks
- Fetching data from services
- Posting to Slack/Discord/etc.

#### 📜 JavaScript
Execute custom JavaScript code.

**Use for:**
- Data transformations
- Complex logic
- String/number manipulation
- JSON processing

### Step 3: Define Input Fields

Create input fields that users can configure:

1. Click **"Add Field"**
2. Set the **Variable Name** (e.g., `script_path`)
3. Set the **Display Label** (e.g., "Script Path")
4. Choose the **Field Type**:
   - Text - Single line input
   - Textarea - Multi-line input
   - Number - Numeric input
   - Password - Hidden input
   - Toggle - Boolean switch
   - Dropdown - Select from options
   - File Picker - Choose a file
   - Folder Picker - Choose a folder

### Step 4: Configure the Action

Use `{{field_name}}` to reference your input fields.

---

## Shell Command Examples

### Run a Python Script

**Command:** `python`
**Arguments:** `{{script_path}} --input {{input_file}}`
**Working Directory:** `{{folder}}`

**Input Fields:**
| Variable | Label | Type |
|----------|-------|------|
| script_path | Python Script | File Picker |
| input_file | Input File | File Picker |
| folder | Working Directory | Folder Picker |

### Convert Image with FFmpeg

**Command:** `ffmpeg`
**Arguments:** `-i {{input}} -vf scale={{width}}:{{height}} {{output}}`

**Input Fields:**
| Variable | Label | Type |
|----------|-------|------|
| input | Input Image | File Picker |
| output | Output Path | Text |
| width | Width | Number |
| height | Height | Number |

### Git Commit

**Command:** `git`
**Arguments:** `commit -m "{{message}}"`
**Working Directory:** `{{repo_path}}`

---

## HTTP Request Examples

### Post to Slack

**Method:** `POST`
**URL:** `https://hooks.slack.com/services/{{webhook_id}}`
**Headers:**
```json
{"Content-Type": "application/json"}
```
**Body:**
```json
{"text": "{{message}}"}
```

**Input Fields:**
| Variable | Label | Type |
|----------|-------|------|
| webhook_id | Slack Webhook ID | Password |
| message | Message | Textarea |

### Fetch Weather

**Method:** `GET`
**URL:** `https://api.weatherapi.com/v1/current.json?key={{api_key}}&q={{city}}`

**Input Fields:**
| Variable | Label | Type |
|----------|-------|------|
| api_key | API Key | Password |
| city | City Name | Text |

---

## JavaScript Examples

### Transform Data

```javascript
// Access inputs via: input.fieldName
// Access previous node output via: input._previousOutput

const data = input._previousOutput;

// Transform the data
const result = data.map(item => ({
  name: item.name.toUpperCase(),
  value: item.value * 2
}));

return result;
```

### Filter and Sort

```javascript
const items = input._previousOutput;
const minValue = parseInt(input.min_value) || 0;

// Filter items above minimum
const filtered = items.filter(item => item.value > minValue);

// Sort by value descending
filtered.sort((a, b) => b.value - a.value);

return filtered;
```

### Generate Report

```javascript
const data = input._previousOutput;

const report = {
  generated: new Date().toISOString(),
  totalItems: data.length,
  summary: data.slice(0, 5),
  stats: {
    min: Math.min(...data.map(d => d.value)),
    max: Math.max(...data.map(d => d.value)),
    avg: data.reduce((a, b) => a + b.value, 0) / data.length
  }
};

return report;
```

### Available Globals in JavaScript

For security, only these are available:
- `JSON` - Parse/stringify JSON
- `Math` - Math operations
- `Date` - Date handling
- `String`, `Number`, `Boolean` - Type constructors
- `Array`, `Object` - Array/Object methods
- `parseInt`, `parseFloat` - Number parsing
- `isNaN`, `isFinite` - Number checks
- `encodeURIComponent`, `decodeURIComponent` - URL encoding

---

## Managing Custom Nodes

### Edit a Node
Hover over the custom node in the sidebar and click the ⚙️ icon.

### Delete a Node
Hover over the custom node in the sidebar and click the 🗑️ icon.

### Using Custom Nodes
- **Drag** from sidebar to canvas, or
- **Click** to add at center

---

## Tips & Best Practices

✅ **Do:**
- Use descriptive names and descriptions
- Add helpful placeholders to input fields
- Test your node thoroughly before using in workflows
- Use variables for all user-configurable values

❌ **Don't:**
- Hardcode sensitive data (use input fields instead)
- Create nodes that require specific file paths
- Forget to handle errors in JavaScript

---

## Troubleshooting

### Node not appearing?
- Check the Custom Nodes section at the bottom of the sidebar
- Try refreshing the app

### Command not found?
- Use full path to executable
- Check that the command is in your system PATH

### HTTP request failing?
- Verify the URL is correct
- Check headers are valid JSON
- Test the API in a browser/Postman first

### JavaScript error?
- Check the console for error messages
- Ensure you're using available globals only
- Verify input variable names match field keys

---

## Example: Complete Custom Node

Here's a complete example of a "Send Discord Message" custom node:

**Basic Info:**
- Icon: 💬
- Name: Send Discord Message
- Category: Action
- Description: Send a message to a Discord webhook

**Action Type:** HTTP Request

**Input Fields:**
| Variable | Label | Type |
|----------|-------|------|
| webhook_url | Webhook URL | Password |
| message | Message | Textarea |
| username | Bot Name | Text |

**HTTP Config:**
- Method: `POST`
- URL: `{{webhook_url}}`
- Headers: `{"Content-Type": "application/json"}`
- Body: `{"content": "{{message}}", "username": "{{username}}"}`

---

**Need help?** Open an issue on [GitHub](https://github.com/OffLine911/ForgeFlow)!
