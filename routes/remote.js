const express = require('express')
const crypto = require('crypto')
const router = express.Router()

// In-memory store for commands and sessions
// In production, you'd use Redis or a database
const sessions = new Map()
const commands = new Map()
const sseClients = new Map() // sessionId -> [res, ...]

/**
 * Generate a short, readable session ID
 */
function generateSessionId() {
    return crypto.randomBytes(4).toString('hex')
}

function generateCommandId() {
    return crypto.randomBytes(6).toString('hex')
}

/**
 * Broadcast an SSE event to all clients in a session
 */
function broadcastToSession(sessionId, event, data) {
    const clients = sseClients.get(sessionId) || []
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    clients.forEach(res => {
        try { res.write(message) } catch (e) { /* client disconnected */ }
    })
}

// ─── Pages ───────────────────────────────────────────────────────────────────

/**
 * Main remote control UI
 */
router.get('/', (req, res) => {
    res.render('pages/remote/index')
})

// ─── Session API ─────────────────────────────────────────────────────────────

/**
 * Create a new remote session
 * Returns { sessionId, agentUrl }
 */
router.post('/api/session', (req, res) => {
    const sessionId = generateSessionId()
    const session = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        copilotSessionId: null,
        agentConnected: false,
        commands: []
    }
    sessions.set(sessionId, session)
    commands.set(sessionId, [])

    const host = req.get('host')
    const protocol = req.protocol
    const agentUrl = `${protocol}://${host}/remote/api/agent/${sessionId}`

    res.json({
        sessionId,
        agentUrl,
        curlPoll: `curl -s ${agentUrl}/poll`,
        curlAck: `curl -s -X POST ${agentUrl}/ack/{commandId}`,
        curlRespond: `curl -s -X POST -H "Content-Type: application/json" -d '{"output":"result here"}' ${agentUrl}/respond/{commandId}`
    })
})

/**
 * Get session info
 */
router.get('/api/session/:sessionId', (req, res) => {
    const session = sessions.get(req.params.sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
})

// ─── Command API (from browser/remote) ──────────────────────────────────────

/**
 * Send a command to the session queue
 */
router.post('/api/session/:sessionId/command', (req, res) => {
    const { sessionId } = req.params
    const session = sessions.get(sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const { prompt, type = 'prompt', model, yolo, copilotSession } = req.body
    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'prompt is required' })
    }

    const command = {
        id: generateCommandId(),
        prompt: prompt.trim(),
        type, // 'prompt', 'file', 'terminal'
        model: model || null,
        yolo: !!yolo,
        copilotSession: copilotSession || null,
        status: 'pending',    // pending -> picked_up -> completed | failed
        createdAt: new Date().toISOString(),
        pickedUpAt: null,
        completedAt: null,
        output: null
    }

    const cmds = commands.get(sessionId) || []
    cmds.push(command)
    commands.set(sessionId, cmds)
    session.lastActivity = new Date().toISOString()

    broadcastToSession(sessionId, 'command', command)

    res.json(command)
})

/**
 * List all commands for a session
 */
router.get('/api/session/:sessionId/commands', (req, res) => {
    const { sessionId } = req.params
    if (!sessions.has(sessionId)) return res.status(404).json({ error: 'Session not found' })
    res.json(commands.get(sessionId) || [])
})

// ─── Agent API (for the local Copilot/agent to consume) ─────────────────────

/**
 * Poll for pending commands
 * The agent calls this to get the next command to execute
 */
router.get('/api/agent/:sessionId/poll', (req, res) => {
    const { sessionId } = req.params
    const session = sessions.get(sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const cmds = commands.get(sessionId) || []
    const pending = cmds.filter(c => c.status === 'pending')

    session.lastActivity = new Date().toISOString()
    res.json({ pending, total: cmds.length })
})

/**
 * Acknowledge a command (mark as picked up)
 */
router.post('/api/agent/:sessionId/ack/:commandId', (req, res) => {
    const { sessionId, commandId } = req.params
    const cmds = commands.get(sessionId) || []
    const cmd = cmds.find(c => c.id === commandId)
    if (!cmd) return res.status(404).json({ error: 'Command not found' })

    cmd.status = 'picked_up'
    cmd.pickedUpAt = new Date().toISOString()

    broadcastToSession(sessionId, 'status', { commandId, status: 'picked_up', pickedUpAt: cmd.pickedUpAt })
    res.json(cmd)
})

/**
 * Send a response/output for a command
 */
router.post('/api/agent/:sessionId/respond/:commandId', (req, res) => {
    const { sessionId, commandId } = req.params
    const cmds = commands.get(sessionId) || []
    const cmd = cmds.find(c => c.id === commandId)
    if (!cmd) return res.status(404).json({ error: 'Command not found' })

    const { output, status = 'completed' } = req.body
    cmd.status = status // 'completed' or 'failed'
    cmd.completedAt = new Date().toISOString()
    cmd.output = output || null

    broadcastToSession(sessionId, 'response', { commandId, status, completedAt: cmd.completedAt, output: cmd.output })
    res.json(cmd)
})

/**
 * Update session metadata (copilot session ID, agent status, etc.)
 */
router.post('/api/agent/:sessionId/meta', (req, res) => {
    const { sessionId } = req.params
    const session = sessions.get(sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const { copilotSessionId, agentConnected } = req.body
    if (copilotSessionId !== undefined) session.copilotSessionId = copilotSessionId
    if (agentConnected !== undefined) session.agentConnected = !!agentConnected
    session.lastActivity = new Date().toISOString()

    broadcastToSession(sessionId, 'meta', {
        copilotSessionId: session.copilotSessionId,
        agentConnected: session.agentConnected
    })
    res.json(session)
})

// ─── SSE (Server-Sent Events) for real-time updates ─────────────────────────

router.get('/api/session/:sessionId/events', (req, res) => {
    const { sessionId } = req.params
    if (!sessions.has(sessionId)) return res.status(404).json({ error: 'Session not found' })

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // for nginx
    })
    res.write(`event: connected\ndata: ${JSON.stringify({ sessionId })}\n\n`)

    if (!sseClients.has(sessionId)) sseClients.set(sessionId, [])
    sseClients.get(sessionId).push(res)

    req.on('close', () => {
        const clients = sseClients.get(sessionId) || []
        sseClients.set(sessionId, clients.filter(c => c !== res))
    })
})

// ─── Cleanup old sessions (runs every 30 minutes) ───────────────────────────

setInterval(() => {
    const now = Date.now()
    const maxAge = 2 * 60 * 60 * 1000 // 2 hours
    for (const [id, session] of sessions) {
        if (now - new Date(session.lastActivity).getTime() > maxAge) {
            sessions.delete(id)
            commands.delete(id)
            sseClients.delete(id)
        }
    }
}, 30 * 60 * 1000)

module.exports = router
