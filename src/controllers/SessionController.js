
const {
  User,
  LoginSessionToken,
  Customer
} = require('../../database/models')

const moment = require("moment");

async function sessionController (fastify, options) {

  fastify.post('/login-session-tokens', {
    schema: {
      body: {
        type: 'object',
        properties: {
          stripe_id: {
            type: 'string',
          },
          token: {
            type: 'string',
          },
        },
        required: [
          'token',
        ]
      },
    },
  }, async(request, reply) => {
    const {stripe_id, token} = request.body

    const loginSessionToken = await LoginSessionToken.create({
      stripe_id,
      token,
      expire_at: moment().add(1, 'day').format("X")
    })

    if(loginSessionToken){
      return reply.send({
        success: true,
        login_session_token:loginSessionToken,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Something went wrong.",
    })
  })

  fastify.put('/login-session-tokens', {
    schema: {
      body: {
        type: 'object',
        properties: {
          user_id: {
            type: 'integer',
          },
          stripe_id: {
            type: 'string',
          },
        },
        required: [
          'stripe_id',
          'user_id'
        ]
      },
    },
  }, async(request, reply) => {
    const {user_id, stripe_id} = request.body

    const loginSessionToken = await LoginSessionToken.update(
      {
        user_id
      },
      {
        where: {
          stripe_id
        },
      }
    )

    if(loginSessionToken){
      return reply.send({
        success: true,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Something went wrong.",
    })
  })

  fastify.get('/login-session-tokens', {
    schema: {
      query: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
        required: [
          'token',
        ]
      },
    },
  }, async(request, reply) => {
    const {token} = request.query

    let loginSessionToken = await LoginSessionToken.findOne({
      where: {
        token
      },
    })

    if(loginSessionToken){
      const user = await User.findOne({
        where: {
          id: loginSessionToken.user_id
        }
      })

      const customer = await Customer.findOne({
        where: {
          user_id: loginSessionToken.user_id
        }
      })

      return reply.send({
        success: true,
        user,
        customer
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Item Customer not found.",
    })
  })

//end
}

module.exports = sessionController