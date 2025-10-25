// https://stackoverflow.com/questions/64848920/reusing-postgresql-connection-pool-in-nodejs
// https://node-postgres.com/features/pooling
// basically: use pool.query for queries and pool.connect for transactions
const { Pool } = require('pg')

let pgp = null

function create() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  return pool
}

exports.pgPool = () => {
  if (!pgp) {
    pgp = create()
  }
  return pgp
}

// TODO bulk insert
exports.insertInto = (table, object) => {
  let pool = this.pgPool()
  let cols = object.fields.map()
  // for (let field of object.fields) {
  // }
  let insert = `insert into ${table} (${cols}) values (${vals})`
  return pool.query(insert)
}

// if it was a class:
// module.exports = pgPool