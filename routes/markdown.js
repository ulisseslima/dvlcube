const express = require('express')
const { marked } = require('marked')
const multer = require('multer')
const router = express.Router()

const upload = multer()

// Configure marked for safe rendering
marked.setOptions({
    gfm: true,
    breaks: true
})

/**
 * POST /render - Convert markdown text to HTML
 */
router.post('/render', upload.none(), async (req, res) => {
    try {
        const { text } = req.body
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'No markdown text provided.'
            })
        }

        const html = marked(text)

        res.json({
            success: true,
            html
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

module.exports = router
