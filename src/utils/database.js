const sqlite3 = require('sqlite3').verbose()
const {updateVar} = require('../modules/message_listener')

console.log(`---[Database module start]---`)

const db = new sqlite3.Database(__dirname + '/../database/sqlite.db', (err) => {
  if (err) {
    console.log('Could not connect to sqlite database', err)
  } else {
    console.log('Connected to sqlite database')
  }
})

db.run(
  'CREATE TABLE IF NOT EXISTS data(id INTEGER PRIMARY KEY AUTOINCREMENT,guild VARCHAR(40) UNIQUE,channel VARCHAR(40),message VARCHAR(40))',
  (err) => {
    if (err) return console.log(err)
  },
)

db.all('SELECT * FROM data', async (err, rows) => {
  if (err) return console.log(err.message)
  if (rows.length > 0) {
    for (let i = 0; i < rows.length; i++) {
      updateVar(rows[i].guild, rows[i].message, rows[i].channel)
    }
  }
})

module.exports = db
