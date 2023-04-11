const sqlite3 = require('sqlite3').verbose()

console.log(`---[Database module start]---`)

const db = new sqlite3.Database('./src/utils/database.db', (err) => {
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

db.run(
  'CREATE TABLE IF NOT EXISTS playlists(id INTEGER PRIMARY KEY AUTOINCREMENT,user VARCHAR(40) ,playlist TEXT,name VARCHAR(40))',
  (err) => {
    if (err) return console.log(err)
  },
)

module.exports = db
