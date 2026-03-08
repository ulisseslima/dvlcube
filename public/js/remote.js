/**
 * DVLCube Remote Control - Client-side JavaScript
 * 
 * Allows sending prompts/commands to a Copilot session from any browser.
 * Uses SSE (Server-Sent Events) for real-time status updates.
 */

let currentSessionId = null
let eventSource = null

// ─── Session Management ──────────────────────────────────────────────────────

async function createSession() {
    try {
        const res = await fetch('/remote/api/session', { method: 'POST' })
        const data = await res.json()
        currentSessionId = data.sessionId
        activateSession(data)
        M.toast({ html: `Session <b>${data.sessionId}</b> created`, classes: 'green' })
    } catch (err) {
        M.toast({ html: 'Failed to create session', classes: 'red' })
        console.error(err)
    }
}

function joinSession() {
    const input = document.getElementById('join-session-id')
    const sessionId = input.value.trim()
    if (!sessionId) {
        M.toast({ html: 'Enter a session ID', classes: 'orange' })
        input.focus()
        return
    }

    currentSessionId = sessionId
    activateSession({ sessionId })
    loadCommands()
}

function activateSession(data) {
    document.getElementById('no-session').style.display = 'none'
    document.getElementById('active-session').style.display = 'block'
    document.getElementById('session-id-display').textContent = data.sessionId

    // Set up agent setup panel content
    const baseUrl = window.location.origin
    const agentBase = `${baseUrl}/remote/api/agent/${data.sessionId}`

    document.getElementById('agent-script').textContent =
`# Node.js polling agent (recommended)
node sh/remote-agent.js ${data.sessionId} --url ${baseUrl}

# With options:
node sh/remote-agent.js ${data.sessionId} --url ${baseUrl} --yolo --model gpt-4o

# Resume a Copilot CLI session:
node sh/remote-agent.js ${data.sessionId} --url ${baseUrl} --copilot-session <copilot-session-id>`

    document.getElementById('curl-command').textContent = `curl -s ${agentBase}/poll | python3 -m json.tool`
    document.getElementById('poll-url').textContent = `${agentBase}/poll`
    document.getElementById('ack-url').textContent = `${agentBase}/ack/{commandId}`
    document.getElementById('respond-url').textContent = `${agentBase}/respond/{commandId}`

    // Connect SSE
    connectSSE(data.sessionId)

    // Focus input
    document.getElementById('command-input').focus()

    // Save to localStorage
    localStorage.setItem('remote-session-id', data.sessionId)
}

function disconnectSession() {
    if (eventSource) {
        eventSource.close()
        eventSource = null
    }
    currentSessionId = null
    localStorage.removeItem('remote-session-id')

    document.getElementById('no-session').style.display = ''
    document.getElementById('active-session').style.display = 'none'
    document.getElementById('command-list').innerHTML = `
        <div class="empty-state">
            <i class="material-icons">inbox</i>
            <p>No commands yet. Type a prompt above to get started.</p>
        </div>`
    document.getElementById('agent-setup').style.display = 'none'
}

// ─── SSE Connection ──────────────────────────────────────────────────────────

function connectSSE(sessionId) {
    if (eventSource) eventSource.close()

    const statusEl = document.getElementById('connection-status')

    eventSource = new EventSource(`/remote/api/session/${sessionId}/events`)

    eventSource.addEventListener('connected', () => {
        statusEl.className = 'connection-status connected'
        statusEl.querySelector('span').textContent = 'Connected'
    })

    eventSource.addEventListener('command', (e) => {
        const cmd = JSON.parse(e.data)
        addCommandToList(cmd)
    })

    eventSource.addEventListener('status', (e) => {
        const data = JSON.parse(e.data)
        updateCommandStatus(data.commandId, data.status)
    })

    eventSource.addEventListener('response', (e) => {
        const data = JSON.parse(e.data)
        updateCommandResponse(data.commandId, data)
    })

    eventSource.addEventListener('meta', (e) => {
        const data = JSON.parse(e.data)
        if (data.copilotSessionId) {
            setCopilotSessionId(data.copilotSessionId)
        }
        if (data.agentConnected !== undefined) {
            const statusEl = document.getElementById('connection-status')
            if (data.agentConnected) {
                statusEl.className = 'connection-status connected'
                statusEl.querySelector('span').textContent = 'Agent Connected'
            }
        }
    })

    eventSource.onerror = () => {
        statusEl.className = 'connection-status disconnected'
        statusEl.querySelector('span').textContent = 'Reconnecting...'
    }
}

// ─── Commands ────────────────────────────────────────────────────────────────

async function sendCommand() {
    const input = document.getElementById('command-input')
    const prompt = input.value.trim()
    if (!prompt) {
        M.toast({ html: 'Enter a prompt first', classes: 'orange' })
        input.focus()
        return
    }

    const type = document.querySelector('input[name="cmd-type"]:checked').value
    const model = document.getElementById('model-select').value || undefined
    const yolo = document.getElementById('yolo-checkbox').checked || undefined
    const copilotSession = document.getElementById('copilot-session-input').value.trim() || undefined

    const btn = document.getElementById('send-btn')
    btn.disabled = true

    try {
        const res = await fetch(`/remote/api/session/${currentSessionId}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type, model, yolo, copilotSession })
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Failed to send')
        }

        input.value = ''
        input.style.height = '80px'
        // Command will appear via SSE event
    } catch (err) {
        M.toast({ html: err.message, classes: 'red' })
        console.error(err)
    } finally {
        btn.disabled = false
    }
}

async function loadCommands() {
    try {
        // Also fetch session metadata (copilot session ID, etc.)
        const sessionRes = await fetch(`/remote/api/session/${currentSessionId}`)
        if (sessionRes.ok) {
            const session = await sessionRes.json()
            if (session.copilotSessionId) {
                setCopilotSessionId(session.copilotSessionId)
            }
        }

        const res = await fetch(`/remote/api/session/${currentSessionId}/commands`)
        if (!res.ok) {
            if (res.status === 404) {
                M.toast({ html: 'Session not found', classes: 'red' })
                disconnectSession()
                return
            }
            throw new Error('Failed to load commands')
        }
        const cmds = await res.json()
        const list = document.getElementById('command-list')
        if (cmds.length === 0) return

        list.innerHTML = ''
        cmds.forEach(cmd => addCommandToList(cmd, false))
    } catch (err) {
        console.error(err)
    }
}

// ─── DOM Helpers ─────────────────────────────────────────────────────────────

function addCommandToList(cmd, prepend = true) {
    const list = document.getElementById('command-list')
    const empty = list.querySelector('.empty-state')
    if (empty) empty.remove()

    const el = document.createElement('div')
    el.className = `command-item ${cmd.status}`
    el.id = `cmd-${cmd.id}`
    el.innerHTML = `
        <div class="command-item-header">
            <div class="command-meta">
                <span class="command-type-badge">${escapeHtml(cmd.type)}</span>
                ${cmd.model ? `<span class="command-option-badge model">${escapeHtml(cmd.model)}</span>` : ''}
                ${cmd.yolo ? '<span class="command-option-badge yolo">⚡ YOLO</span>' : ''}
                ${cmd.copilotSession ? `<span class="command-option-badge session">▶ ${escapeHtml(cmd.copilotSession)}</span>` : ''}
                <span>${formatTime(cmd.createdAt)}</span>
                <code style="font-size: 0.75rem; color: #999;">${escapeHtml(cmd.id)}</code>
            </div>
            <span class="command-status ${cmd.status}">${formatStatus(cmd.status)}</span>
        </div>
        <div class="command-prompt">${escapeHtml(cmd.prompt)}</div>
        ${cmd.output ? renderOutput(cmd.output) : ''}
    `

    if (prepend) {
        list.prepend(el)
    } else {
        list.appendChild(el)
    }
}

function updateCommandStatus(commandId, status) {
    const el = document.getElementById(`cmd-${commandId}`)
    if (!el) return
    el.className = `command-item ${status}`
    const statusEl = el.querySelector('.command-status')
    if (statusEl) {
        statusEl.className = `command-status ${status}`
        statusEl.textContent = formatStatus(status)
    }
}

function updateCommandResponse(commandId, data) {
    updateCommandStatus(commandId, data.status)
    if (data.output) {
        const el = document.getElementById(`cmd-${commandId}`)
        if (!el) return
        // Remove existing output if any
        const existing = el.querySelector('.command-output')
        if (existing) existing.remove()

        el.insertAdjacentHTML('beforeend', renderOutput(data.output))
    }
}

function renderOutput(output) {
    return `
        <div class="command-output">
            <div class="command-output-label">Output</div>
            <div class="command-output-content">${escapeHtml(typeof output === 'string' ? output : JSON.stringify(output, null, 2))}</div>
        </div>`
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function formatTime(isoStr) {
    const d = new Date(isoStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatStatus(status) {
    const map = {
        pending: 'Pending',
        picked_up: 'Picked Up',
        completed: 'Completed',
        failed: 'Failed'
    }
    return map[status] || status
}

function escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
}

function copySessionId() {
    navigator.clipboard.writeText(currentSessionId).then(() => {
        M.toast({ html: 'Session ID copied', classes: 'green' })
    })
}

function copyAgentScript() {
    const text = document.getElementById('agent-script').textContent
    navigator.clipboard.writeText(text).then(() => {
        M.toast({ html: 'Script copied', classes: 'green' })
    })
}

function copyCurlCommand() {
    const text = document.getElementById('curl-command').textContent
    navigator.clipboard.writeText(text).then(() => {
        M.toast({ html: 'Curl command copied', classes: 'green' })
    })
}

function showAgentSetup() {
    const panel = document.getElementById('agent-setup')
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
}

function setCopilotSessionId(id) {
    const display = document.getElementById('copilot-session-display')
    const text = document.getElementById('copilot-session-id-text')
    if (id) {
        text.textContent = id
        display.style.display = 'inline-flex'
        // Auto-fill the copilot session input if empty
        const input = document.getElementById('copilot-session-input')
        if (!input.value.trim()) {
            input.value = id
        }
    } else {
        display.style.display = 'none'
    }
}

function copyCopilotSessionId() {
    const text = document.getElementById('copilot-session-id-text').textContent
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            M.toast({ html: 'Copilot session ID copied', classes: 'green' })
        })
    }
}

// ─── Keyboard Shortcuts ──────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const input = document.getElementById('command-input')
        if (document.activeElement === input && currentSessionId) {
            e.preventDefault()
            sendCommand()
        }
    }
})

// ─── Auto-restore session ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const savedSession = localStorage.getItem('remote-session-id')
    if (savedSession) {
        currentSessionId = savedSession
        activateSession({ sessionId: savedSession })
        loadCommands()
    }
})
