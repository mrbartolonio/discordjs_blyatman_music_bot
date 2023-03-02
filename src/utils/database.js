const mysql = require('mysql')
require('dotenv').config()

console.log(`---[Database module start]---`)

const connection = mysql.createPool({
  waitForConnections: true,
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
})

function handleDisconnect(conne) {
  conne.on('error', (err) => {
    if (!err.fatal) {
      return
    }
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err
    }

    conne.destroy()
    console.log(`\nPonowne łączenie: ${err.stack}^0`)

    setTimeout(() => {
      handleDisconnect(conne)

      conne.getConnection((error) => {
        if (error) {
          console.error(`error connecting: ${error}`)
          return
        }

        console.log(`Połączono z bazą ID:${conne.threadId}`)
      })
    }, 1000)
  })
}

handleDisconnect(connection)
createDbIfNotExists()

async function createDbIfNotExists() {
  try {
    await connection.query(
      'CREATE TABLE IF NOT EXISTS `data` (`id` int(10) NOT NULL auto_increment,`guild` varchar(255),`channel` varchar(255),`message` varchar(255), PRIMARY KEY( `id` ))',
      (err, result) => {
        if (err) throw err
        if (result.warningCount >= 1) {
          console.log('Table exists!')
        } else {
          console.log('Table created!')
        }
      },
    )
  } catch (error) {
    console.log(`Error: ${error}`)
  }
}

connection.on('connection', (conn) => {
  conn.query('SET SESSION auto_increment_increment=1')
})

connection.on('enqueue', () => {
  console.log('Waiting for available connection slot')
})

connection.on('release', (conn) => {
  console.log('Connection %d released', conn.threadId)
})

connection.getConnection((err) => {
  if (err) {
    console.log(err)
    console.error('error connecting')
    return
  }

  console.log(`Connected to DB`)
})
module.exports = connection
