# Remote Control for Copilot Sessions

Send prompts to your AI coding agent (GitHub Copilot CLI, Claude Code, etc.) from any device — your phone, a tablet, or another computer. The remote control acts as a command queue between a web UI and your local agent session.

## Quick Start

### 1. Open the Remote Control page

Navigate to `/remote` on your DVLCube instance:

```
https://your-domain.com/remote
```

### 2. Create a session

Click **New Session**. You'll get a short session ID (e.g., `a3f1b2c4`).

### 3. Connect your local agent

On the machine running your Copilot session, start the Node.js polling agent:

```bash
node sh/remote-agent.js a3f1b2c4 --url https://your-domain.com
```

### 4. Send prompts

Type commands in the browser. They queue up and get picked up by the agent, which runs `copilot -p` for each prompt.

---

## How It Works

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Browser UI  │──POST──▶│  DVLCube Server   │◀──GET───│  Local Agent     │
│  (any device)│         │  /remote/api/...  │         │  (polling loop)  │
│              │◀──SSE───│                   │──JSON──▶│                  │
└──────────────┘         └──────────────────┘         └──────────────────┘
```

1. **Browser** sends a command via POST → server queues it as `pending`
2. **Agent** polls the server, picks up pending commands, marks them `picked_up`
3. **Agent** executes the command, then sends the output back as `completed`
4. **Browser** receives real-time updates via Server-Sent Events (SSE)

### Command Lifecycle

```
pending → picked_up → completed
                    → failed
```

---

## API Reference

All endpoints are relative to your DVLCube host (e.g., `https://your-domain.com`).

### Session Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/remote/api/session` | Create a new session |
| `GET` | `/remote/api/session/:sessionId` | Get session info |

### Command Queue (Browser → Server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/remote/api/session/:sessionId/command` | Send a command |
| `GET` | `/remote/api/session/:sessionId/commands` | List all commands |
| `GET` | `/remote/api/session/:sessionId/events` | SSE stream for real-time updates |

**POST body** for sending a command:

```json
{
  "prompt": "refactor the login function to use async/await",
  "type": "prompt",
  "model": "gpt-4o",
  "yolo": true,
  "copilotSession": "abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | **yes** | The prompt text or terminal command |
| `type` | string | no | `prompt` (default), `terminal`, or `file` |
| `model` | string | no | Model override (e.g., `gpt-4o`, `claude-sonnet-4`) |
| `yolo` | boolean | no | Pass `--yolo` to copilot (allow all tool permissions) |
| `copilotSession` | string | no | Resume a specific Copilot CLI session ID |

### Agent API (Server → Agent)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/remote/api/agent/:sessionId/poll` | Get pending commands |
| `POST` | `/remote/api/agent/:sessionId/ack/:commandId` | Acknowledge (mark as picked up) |
| `POST` | `/remote/api/agent/:sessionId/respond/:commandId` | Send output/result back |
| `POST` | `/remote/api/agent/:sessionId/meta` | Report agent metadata (session ID, status) |

**POST body** for responding:

```json
{
  "output": "Done. Refactored login() to use async/await in src/auth.js",
  "status": "completed"
}
```

`status` can be `completed` or `failed`.

---

## Node.js Polling Agent

The recommended way to connect is using the included Node.js agent at `sh/remote-agent.js`. It polls the server for pending commands and executes them via `copilot -p`.

### Basic Usage

```bash
node sh/remote-agent.js <session-id> [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--url <base-url>` | DVLCube server URL | `http://localhost:5000` or `$REMOTE_CONTROL_URL` |
| `--interval <seconds>` | Polling interval | `3` |
| `--model <model>` | Default Copilot model (overridden by per-command model) | — |
| `--yolo` | Pass `--yolo` to copilot for all commands | `false` |
| `--copilot-session <id>` | Resume a specific Copilot CLI session | — |
| `--continue` | Resume the most recently closed local session | `false` |
| `--cwd <path>` | Working directory for copilot commands | current dir |
| `--dry-run` | Print commands without executing | `false` |
| `--detect-session` | Auto-detect Copilot session ID on startup | `true` |
| `--detect-model <model>` | Cheap model for session detection prompt | `gpt-5-mini` |

### Examples

```bash
# Basic — poll and execute prompts
node sh/remote-agent.js a3f1b2c4 --url https://www.dvlcube.com

# With a specific model and YOLO mode
node sh/remote-agent.js a3f1b2c4 --url https://www.dvlcube.com --model gpt-4o --yolo

# Resume a Copilot CLI session
node sh/remote-agent.js a3f1b2c4 --url https://www.dvlcube.com --copilot-session xyz789

# Resume the most recent local session
node sh/remote-agent.js a3f1b2c4 --url https://www.dvlcube.com --continue

# Dry run (preview what would execute)
node sh/remote-agent.js a3f1b2c4 --url https://www.dvlcube.com --dry-run

# Set via environment variable
export REMOTE_CONTROL_URL=https://www.dvlcube.com
node sh/remote-agent.js a3f1b2c4
```

### How Commands Are Executed

| Command type | Execution |
|-------------|-----------|
| `prompt` / `file` | `copilot [--model X] [--yolo] [--resume Y] -p "prompt text"` |
| `terminal` | `bash -c "command"` |

Per-command options (model, yolo, copilotSession) selected in the web UI are passed through and override the agent's default flags.

### Copilot CLI Session Resumption

Copilot CLI supports resuming sessions with `--resume <session-id>` or `--continue` (most recent). This lets you maintain context across multiple prompts.

### Automatic Session Detection

The agent automatically detects the Copilot CLI session ID on startup using two strategies:

1. **Filesystem scan** (fast, no API call): Checks `~/.copilot/sessions/` for the most recently modified session directory
2. **Prompt-based detection** (fallback): Uses a cheap model (default: `gpt-5-mini`) to ask Copilot for its session ID

Once detected, the session ID is:
- Reported to the server and displayed in the web UI header as a green badge
- Auto-filled into the **Copilot Session** input field
- Used as the default `--resume` value for all subsequent commands

After each copilot command execution, the agent re-checks the filesystem in case a new session was created.

You can disable auto-detection with `--no-detect-session`, or provide an explicit session ID with `--copilot-session <id>`.

**Manual approach** (if auto-detection doesn't work): Use a cheap model (e.g., `gpt-5-mini`) for the first prompt asking it to include its session ID in the response. Then copy-paste it into the **Copilot Session** field.

---

## Alternative Integrations

### Bash Polling Script

If you prefer bash or don't have Node.js on the target machine:

```bash
#!/bin/bash
SESSION_ID="${1:?Usage: $0 <session-id> [base-url]}"
BASE_URL="${2:-https://your-domain.com}"
AGENT_URL="$BASE_URL/remote/api/agent/$SESSION_ID"

echo "🎮 Polling $AGENT_URL ..."

while true; do
  RESPONSE=$(curl -s "$AGENT_URL/poll")

  echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for cmd in data.get('pending', []):
    print(cmd['id'] + '|' + cmd['type'] + '|' + (cmd.get('model') or '') + '|' + str(cmd.get('yolo', False)) + '|' + cmd['prompt'])
" 2>/dev/null | while IFS='|' read -r CMD_ID CMD_TYPE CMD_MODEL CMD_YOLO CMD_PROMPT; do

    curl -s -X POST "$AGENT_URL/ack/$CMD_ID" > /dev/null

    # Build copilot args
    COPILOT_ARGS=()
    [ -n "$CMD_MODEL" ] && COPILOT_ARGS+=(--model "$CMD_MODEL")
    [ "$CMD_YOLO" = "True" ] && COPILOT_ARGS+=(--yolo)

    case "$CMD_TYPE" in
      terminal)
        OUTPUT=$(bash -c "$CMD_PROMPT" 2>&1)
        ;;
      *)
        OUTPUT=$(copilot "${COPILOT_ARGS[@]}" -p "$CMD_PROMPT" 2>&1)
        ;;
    esac

    STATUS=$([[ $? -eq 0 ]] && echo "completed" || echo "failed")

    python3 -c "
import json, sys
output = sys.stdin.read()
print(json.dumps({'output': output, 'status': '$STATUS'}))
" <<< "$OUTPUT" | curl -s -X POST \
      -H "Content-Type: application/json" \
      -d @- "$AGENT_URL/respond/$CMD_ID" > /dev/null

    echo "[$(date +%H:%M:%S)] $CMD_TYPE → $STATUS"
  done

  sleep 3
done
```

### Integration with Claude Code

Feed remote prompts to Claude Code's CLI:

```bash
#!/bin/bash
SESSION_ID="${1:?Usage: $0 <session-id> [base-url]}"
BASE_URL="${2:-https://your-domain.com}"
AGENT_URL="$BASE_URL/remote/api/agent/$SESSION_ID"

while true; do
  RESPONSE=$(curl -s "$AGENT_URL/poll")

  echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for cmd in data.get('pending', []):
    print(cmd['id'] + '|' + cmd['prompt'])
" 2>/dev/null | while IFS='|' read -r CMD_ID CMD_PROMPT; do

    curl -s -X POST "$AGENT_URL/ack/$CMD_ID" > /dev/null

    OUTPUT=$(claude --print "$CMD_PROMPT" 2>&1)
    STATUS=$([[ $? -eq 0 ]] && echo "completed" || echo "failed")

    python3 -c "
import json, sys
output = sys.stdin.read()
print(json.dumps({'output': output, 'status': '$STATUS'}))
" <<< "$OUTPUT" | curl -s -X POST \
      -H "Content-Type: application/json" \
      -d @- "$AGENT_URL/respond/$CMD_ID" > /dev/null

    echo "[$(date +%H:%M:%S)] ✓ $STATUS"
  done

  sleep 3
done
```

---

## Browser UI Features

- **New Session** — creates a fresh session with a unique ID
- **Join Session** — enter an existing session ID to reconnect (e.g., from another device)
- **Command Types** — `Prompt` (AI prompt), `Terminal` (shell command), `File Edit` (file operation)
- **Model Selector** — choose a model per-command (gpt-4o, gpt-5-mini, claude-sonnet-4, etc.)
- **YOLO Mode** — checkbox to pass `--yolo` (allow all tool permissions without prompting)
- **Copilot Session** — enter a Copilot CLI session ID to resume context across prompts
- **Copilot Session Badge** — when the agent detects a session ID, it appears as a green badge in the header (click to copy, auto-fills the session input)
- **Real-time Status** — SSE updates show when commands are picked up and completed
- **Keyboard Shortcut** — `Ctrl+Enter` / `Cmd+Enter` to send
- **Session Persistence** — session ID is saved in `localStorage` and auto-restored on page reload
- **Agent Setup Panel** — click the terminal icon (⌨) to see ready-to-use commands and scripts

---

## Use Cases

| Scenario | How |
|----------|-----|
| Send prompts from your phone while coding on desktop | Open `/remote` on phone, run agent on desktop |
| Queue up tasks while away from keyboard | Type commands on any device, agent processes them when online |
| Pair programming remote control | Share the session ID with a colleague |
| Batch prompts for overnight processing | Queue multiple prompts, let the agent work through them |

---

## Notes

- Sessions auto-expire after **2 hours** of inactivity
- Commands are stored **in-memory only** (lost on server restart)
- No authentication on the API — for private use; add auth middleware if exposing publicly
- The polling interval is 3 seconds by default; adjust with `--interval`
- The agent requires `copilot` CLI to be installed and authenticated (`copilot` is the standalone CLI, not `gh copilot`)
- The `--yolo` flag is powerful — it auto-approves all tool permissions. Use with caution in untrusted directories
- Per-command options (model, yolo, copilotSession) set in the browser override the agent's default flags
