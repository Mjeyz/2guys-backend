const fs = require('fs')
const path = require('path')

require('dotenv').config()

const fastify = require('fastify')({
  logger: true,
  bodyLimit: 15242880,
})

fastify.register(require('fastify-cors'), { 
  // put your options here
})

const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const chalk = require('chalk')
fastify.register(multer.contentParser)

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'uploads'),
  prefix: '/public/', // optional: default '/'
})

//axios
fastify.register(require('fastify-axios'))

//routes
fastify.register(require('./src/routes/index'))

fastify.register(require('fastify-jwt'), {
  secret: 'secret'
})

//fastify mailer
fastify.register(require('fastify-mailer'), {
  defaults: {
    from: process.env.EMAIL_FROM
  },
  transport: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: "info.twoguys.app@gmail.com",
      pass: '#f3f7faa'
      // user: "herbert.reichel1234@gmail.com",
      // pass: 'herb1234'
      // user: "juanmarkopaid@gmail.com",
      // pass: '!Qwerty00123'
    }
  }
})


// Run the server!
fastify.listen(process.env.PORT, '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})