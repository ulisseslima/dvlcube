const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('pages/index'))

app.get('/cool', (req, res) => res.send(cool()))

app.get('/curse/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM part1')
      const results = { 'results': (result) ? result.rows : null}
      res.render('pages/curse/db', results )
      client.release()
    } catch (err) {
      console.error(err)
      res.send("Error " + err)
    }
})

app.get('/curse', async (req, res) => {
  try {
    const client = await pool.connect()
    
    const part0 = await client.query("SELECT value, gender FROM part0 OFFSET floor(random()*(select count(*) from part0)) LIMIT 1")
    const p0 = part0.rows[0].value
    let gender = part0.rows[0].gender

    let condition = `gender = ${gender} or gender = 0`
    if (gender == 0) condition = '1=1'

    const part1 = await client.query(`
      SELECT value, gender FROM part1 where ${condition} OFFSET floor(random()*(select count(*) from part1 where ${condition})) LIMIT 1
    `)
    const p1 = part1.rows[0].value
    gender = part1.rows[0].gender

    condition = `gender = ${gender} or gender = 0`
    if (gender == 0) condition = '1=1'

    const part2 = await client.query(`
      SELECT value, gender FROM part2 where ${condition} 
      OFFSET floor(random()*(select count(*) from part2 where ${condition})) LIMIT 1
    `)
    const p2 = part2.rows[0].value
    gender = part2.rows[0].gender
    if (gender != 0) condition = `gender = ${gender} or gender = 0`

    const part3 = await client.query(`
      SELECT value FROM part3 where ${condition} 
      OFFSET floor(random()*(select count(*) from part3 where ${condition})) LIMIT 1
    `)
    const p3 = part3.rows[0].value
    
    const result = { 
      'face': cool(),
      'p0': p0,
      'p1': p1,
      'p2': p2,
      'p3': p3
    }

    console.log("result: ", result);
    res.render('pages/curse/index', result )
    client.release()
  } catch (err) {
    console.error(err)
    res.send("Error " + err)
  }
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

showTimes = () => {
  let result = ''
  const times = process.env.TIMES || 5
  for (i = 0; i < times; i++) {
    result += i + ' '
  }
  return result
}
