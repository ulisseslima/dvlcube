// import routes from './routes'

const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

// routes
const curse = require('./routes/curse')
const products = require('./routes/products')
const validate = require('./routes/validate')
const generate = require('./routes/generate')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use((req, res, next) => {
    let client = req.headers['x-forwarded-for'] || req.socket.remoteAddress 

    console.log(`${new Date().toISOString()} - ${req.ip} - ${req.url}`)
    next()
})

app.get('/', (req, res) => res.render('pages/index'))

app.get('/cool', (req, res) => res.send(cool()))
app.use('/curse', curse)

app.use('/products', products)

// routes require auth header starting from here:
app.use((req, res, next) => {
    let auth = req.headers.authorization || req.headers['x-rapidapi-proxy-secret']
    // console.log(`auth: ${auth}`, req.headers)
    if (!auth) return res.status(403).json({ error: 'unauthorized.' })

    if (auth === `Bearer ${process.env.BEARER_TOKEN}` || process.env.RAPIDAPI_SECRET.split(" ").includes(auth)) {
        next()
    } else {
        return res.status(403).json({ error: 'unauthorized.' })
    }
})

app.use('/validate', validate)
app.use('/generate', generate)

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
