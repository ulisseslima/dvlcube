const express = require('express')
const router = express.Router()

// Route metadata for the tools page
const routeMetadata = {
    generate: {
        name: 'Generate',
        description: 'Generate valid documents and data',
        icon: 'create',
        routes: [
            { path: '/generate/cnpj', method: 'GET', name: 'Generate CNPJ', description: 'Generate a valid Brazilian CNPJ (numeric or alphanumeric)', params: [
                { name: 'alphanumeric', type: 'checkbox', required: false, label: 'Alphanumeric (A-Z, 0-9)' },
                { name: 'mask', type: 'checkbox', required: false, label: 'Remove mask formatting' }
            ]},
            { path: '/generate/cpf', method: 'GET', name: 'Generate CPF', description: 'Generate a valid Brazilian CPF', params: [
                { name: 'mask', type: 'checkbox', required: false, label: 'Remove mask formatting' }
            ]},
            { path: '/generate/title', method: 'GET', name: 'Capitalize Title', description: 'Capitalize a title using style guide rules', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter your title here' },
                { name: 'style', type: 'select', required: false, options: ['APA', 'AP', 'CHICAGO', 'MLA', 'BB', 'AMA'], default: 'APA' }
            ]}
        ]
    },
    validate: {
        name: 'Validate',
        description: 'Validate documents and data',
        icon: 'check_circle',
        routes: [
            { path: '/validate/cnpj', method: 'GET', name: 'Validate CNPJ', description: 'Validate a Brazilian CNPJ', params: [
                { name: 'n', type: 'text', required: true, placeholder: 'Enter CNPJ (with or without formatting)' }
            ]},
            { path: '/validate/cpf', method: 'GET', name: 'Validate CPF', description: 'Validate a Brazilian CPF', params: [
                { name: 'n', type: 'text', required: true, placeholder: 'Enter CPF (with or without formatting)' }
            ]}
        ]
    },
    encode: {
        name: 'Encode/Decode',
        description: 'Encoding and decoding utilities',
        icon: 'code',
        routes: [
            { path: '/encode/url', method: 'GET', name: 'URL Encode', description: 'Encode text for URLs', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/url/decode', method: 'GET', name: 'URL Decode', description: 'Decode URL-encoded text', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter URL-encoded text' }
            ]},
            { path: '/encode/base64', method: 'GET', name: 'Base64 Encode', description: 'Encode text to Base64', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/base64/decode', method: 'GET', name: 'Base64 Decode', description: 'Decode Base64 text', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter Base64 text' }
            ]},
            { path: '/encode/html', method: 'GET', name: 'HTML Encode', description: 'Encode HTML entities', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter HTML to encode' }
            ]},
            { path: '/encode/html/decode', method: 'GET', name: 'HTML Decode', description: 'Decode HTML entities', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter encoded HTML' }
            ]},
            { path: '/encode/hex', method: 'GET', name: 'Hex Encode', description: 'Encode text to hexadecimal', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/hex/decode', method: 'GET', name: 'Hex Decode', description: 'Decode hexadecimal to text', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter hex string' }
            ]},
            { path: '/encode/unicode', method: 'GET', name: 'Unicode Encode', description: 'Convert text to Unicode code points', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/unicode/decode', method: 'GET', name: 'Unicode Decode', description: 'Convert Unicode code points to text', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'U+0048 U+0065 U+006C U+006C U+006F' }
            ]},
            { path: '/encode/jwt/decode', method: 'GET', name: 'JWT Decode', description: 'Decode JWT token (without verification)', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter JWT token' }
            ]}
        ]
    },
    sandbox: {
        name: 'Sandbox',
        description: 'Test and run code snippets in various languages',
        icon: 'terminal',
        routes: [
            { path: '/sandbox/python', method: 'GET', name: 'Run Python', description: 'Execute Python 3 code and see the output', params: [
                { name: 'code', type: 'textarea', required: true, placeholder: 'print(“Hello, World!”)' }
            ]},
            { path: '/sandbox/javascript', method: 'GET', name: 'Run JavaScript', description: 'Execute JavaScript (Node.js) code and see the output', params: [
                { name: 'code', type: 'textarea', required: true, placeholder: 'console.log(“Hello, World!”);' }
            ]},
            { path: '/sandbox/typescript', method: 'GET', name: 'Run TypeScript', description: 'Execute TypeScript code and see the output', params: [
                { name: 'code', type: 'textarea', required: true, placeholder: 'const greeting: string = “Hello, World!”; console.log(greeting);' }
            ]},
            { path: '/sandbox/java', method: 'GET', name: 'Run Java', description: 'Compile and execute Java code (class name auto-detected)', params: [
                { name: 'code', type: 'textarea', required: true, placeholder: 'public class Main { public static void main(String[] args) { System.out.println(“Hello, World!”); } }' }
            ]}
        ]    },
    charts: {
        name: 'Charts',
        description: 'Visualize performance metrics and data',
        icon: 'bar_chart',
        routes: [
            { path: '/charts/parse', method: 'POST', name: 'Generate Chart', description: 'Parse JSON performance data and generate interactive charts. Paste JSON or upload a file.', params: [
                { name: 'data', type: 'textarea', required: false, placeholder: 'Paste your JSON data here...' },
                { name: 'file', type: 'file', required: false, accept: '.json,application/json' },
                { name: 'chartType', type: 'select', required: false, options: ['timeSeries', 'executionCount', 'percentiles', 'avgExecutionTime', 'errorRate', 'executionTimeComparison'], default: 'timeSeries' }
            ]}
        ]
    }
    ,
    math: {
        name: 'Math',
        description: 'Common math helpers: rule of three and percentage calculations',
        icon: 'calculate',
        routes: [
            { path: '/math/rule-of-three', method: 'GET', name: 'Rule of Three', description: 'Solve x from a/b = c/x (cross-multiplication)', params: [
                { name: 'a', type: 'text', required: true, placeholder: 'Enter a (numeric)' },
                { name: 'b', type: 'text', required: true, placeholder: 'Enter b (numeric)' },
                { name: 'c', type: 'text', required: true, placeholder: 'Enter c (numeric)' }
            ]},
            { path: '/math/percentage/of', method: 'GET', name: 'Percentage Of', description: 'Calculate percent of a value (percent of total)', params: [
                { name: 'percent', type: 'text', required: true, placeholder: 'Percent (e.g. 15 for 15%)' },
                { name: 'total', type: 'text', required: true, placeholder: 'Total value' }
            ]},
            { path: '/math/percentage/what-percent', method: 'GET', name: 'What Percent', description: 'Calculate what percent a part is of a total', params: [
                { name: 'part', type: 'text', required: true, placeholder: 'Part value' },
                { name: 'total', type: 'text', required: true, placeholder: 'Total value' }
            ]},
            { path: '/math/percentage/change', method: 'GET', name: 'Apply Percentage Change', description: 'Increase or decrease a value by a percentage', params: [
                { name: 'original', type: 'text', required: true, placeholder: 'Original value' },
                { name: 'percent', type: 'text', required: true, placeholder: 'Percent to change (e.g. 10)' },
                { name: 'direction', type: 'select', required: false, options: ['increase','decrease'], default: 'increase' }
            ]}
        ]
    }
}

// Render the tools page
router.get('/', async (req, res) => {
    res.render('pages/tools/index', { routeMetadata })
})

// API endpoint to get route metadata
router.get('/api/routes', async (req, res) => {
    res.json(routeMetadata)
})

module.exports = router
