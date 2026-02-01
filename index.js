// import routes from './routes'
const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const ngrok = require("@ngrok/ngrok")
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

// const
const PORT = process.env.PORT || 5000

// routes
const curse = require('./routes/curse')
const products = require('./routes/products')
const validate = require('./routes/validate')
const generate = require('./routes/generate')
const encode = require('./routes/encode')
const tools = require('./routes/tools')
const auth = require('./routes/auth')

// middleware
const { ensureAuthenticated } = require('./middleware/auth')

// bots
const { dlgramBot } = require('./bots/dlgram_bot')

// Global unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('=== UNHANDLED PROMISE REJECTION ===')
    console.error('Timestamp:', new Date().toISOString())
    console.error('Reason:', reason)
    if (reason && reason.config) {
        console.error('Axios config:', {
            url: reason.config.url,
            method: reason.config.method,
            baseURL: reason.config.baseURL,
            data: reason.config.data
        })
    }
    if (reason && reason.response) {
        console.error('Response:', {
            status: reason.response.status,
            statusText: reason.response.statusText,
            data: reason.response.data
        })
    }
    console.error('Stack:', reason && reason.stack)
    console.error('===================================')
})

async function startNgrok() {
    console.log("starting ngrok...")
    const listener = await ngrok.forward({ addr: PORT, authtoken: process.env.NGROK_AUTHTOKEN })
    console.log(`Ingress established at: ${listener.url()}`)
    return listener.url()
}

(async () => {
    try {
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
    
    // Session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET || 'rotating-signing-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }))
    
    // Passport configuration
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, (accessToken, refreshToken, profile, done) => {
        // For now, just return the profile. 
        // In production, you might want to save the user to a database
        const user = {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            photo: profile.photos?.[0]?.value
        }
        return done(null, user)
    }))
    
    passport.serializeUser((user, done) => {
        done(null, user)
    })
    
    passport.deserializeUser((user, done) => {
        done(null, user)
    })
    
    app.use(passport.initialize())
    app.use(passport.session())
    
    // Make user available to all views
    app.use((req, res, next) => {
        res.locals.user = req.user || null
        next()
    })
    
    app.use((req, res, next) => {
        let client = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
        console.log(`${new Date().toISOString()} - ${client}: ${req.ip} - ${req.method} ${req.url}`)
        next()
    })
    
    app.get('/', (req, res) => res.render('pages/index'))
    
    app.get('/cool', (req, res) => res.send(cool()))
    app.use('/curse', curse)
    
    // Auth routes (public)
    app.use('/auth', auth)
    
    // Protected routes
    app.use('/products', ensureAuthenticated, products)

    app.use('/validate', validate)
    app.use('/generate', generate)
    app.use('/encode', encode)
    app.use('/tools', tools)

    /////////////////////// START /////////////////
    app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
            
    /////////////////////// BOTS /////////////////
    if (process.env.TOKEN_DLGRAM_BOT) {
        try {
            console.log('Setting up dlgram bot webhook...')
            // prefer a bare domain for webhook registration (strip protocol if present)
            const domain = (ngrokUrl || process.env.DOMAIN || '')
                .toString()
            console.log('Domain for webhook:', domain)
            const webhook = await dlgramBot.createWebhook({ domain })
            app.use(webhook)
            console.log('Dlgram bot webhook setup complete')
        } catch (err) {
            console.error('Failed to create dlgram webhook:', err)
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                response: err.response ? {
                    status: err.response.status,
                    data: err.response.data
                } : undefined
            })
        }
    } else {
        console.log('TOKEN_DLGRAM_BOT not set — skipping dlgram webhook setup')
    }
    
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
    } catch (err) {
        console.error('=== FATAL ERROR IN MAIN FUNCTION ===')
        console.error('Error:', err)
        console.error('Stack:', err.stack)
        console.error('=====================================')
        process.exit(1)
    }
})()
