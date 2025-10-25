// import routes from './routes'
const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const ngrok = require("@ngrok/ngrok")

// const
const PORT = process.env.PORT || 5000

// routes
const curse = require('./routes/curse')
const products = require('./routes/products')
const validate = require('./routes/validate')
const generate = require('./routes/generate')

// bots
const { dlgramBot } = require('./bots/dlgram_bot')

async function startNgrok() {
    console.log("starting ngrok...")
    const listener = await ngrok.forward({ addr: PORT, authtoken: process.env.NGROK_AUTHTOKEN })
    console.log(`Ingress established at: ${listener.url()}`)
    return listener.url()
}

(async () => {
    let ngrokUrl
    if (process.env.NGROK_AUTHTOKEN) {
        ngrokUrl = await startNgrok()
    }
    
    const app = express()
    app.use(express.static(path.join(__dirname, 'public')))
    // required to receive request bodies:
    app.use(express.json()) // or app.use(bodyParser.json())
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')
    
    app.use((req, res, next) => {
        let client = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
        console.log(`${new Date().toISOString()} - ${client}: ${req.ip} - ${req.method} ${req.url}`)
        next()
    })
    
    app.get('/', (req, res) => res.render('pages/index'))
    
    app.get('/cool', (req, res) => res.send(cool()))
    app.use('/curse', curse)
    
    app.use('/products', products)

    app.use('/validate', validate)
    app.use('/generate', generate)

    /////////////////////// START /////////////////
    app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
            
    /////////////////////// BOTS /////////////////
    app.use(await dlgramBot.createWebhook({ domain: ngrokUrl || process.env.DOMAIN }))
    
    /////////////////////// SECURITY /////////////////
    // routes require auth header starting from here:
    app.use((req, res, next) => {
        const secured = [
            '/validate',
            '/generate'
        ]

        if (!secured.includes(req.url)) {
            console.log(`${req.url} is not secured`);
            next()
        }

        let auth = req.headers.authorization || req.headers['x-rapidapi-proxy-secret']
        // console.log(`auth: ${auth}`, req.headers)
        if (!auth) return res.status(403).json({ error: '1: unauthorized.' })
    
        if (auth === `Bearer ${process.env.BEARER_TOKEN}` || process.env.RAPIDAPI_SECRET.split(" ").includes(auth)) {
            next()
        } else {
            return res.status(403).json({ error: '2: unauthorized.' })
        }
    })
})()
