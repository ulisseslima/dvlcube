// import routes from './routes'

const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

// routes
const curse = require('./routes/curse')
const products = require('./routes/products')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('pages/index'))

app.get('/cool', (req, res) => res.send(cool()))
app.use('/curse', curse)

app.use('/products', products)

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
