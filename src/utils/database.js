const {PrismaClient} = require('@prisma/client')
const {updateVar} = require('../modules/message_listener')
let prisma

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient()
  }
  prisma = global.__db__
  prisma.$connect()
}

prisma.data
  .findMany()
  .then((data) => data.map((g) => updateVar(g.guild, g.message, g.channel)))

module.exports = prisma
