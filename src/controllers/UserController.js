
const {
  User,
  Customer,
  CustomerOccupation,
  CustomerStartup,
  CustomerPitch,
  PasswordResetToken,
} = require("../../database/models")

var _ = require('lodash')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const db = require("../../database/models")
const moment = require("moment")
var _ = require('lodash')
const axios = require('axios').default

async function userController (fastify, options) {

  fastify.get('/users/:id', {
    schema: {
      params: {
        properties: {
          id: {
            type: 'integer',
          },
        },
        required: [
          'id',
        ]
      },
    },
  }, async(request, reply) => {
    const {id} = request.params

    const user = await User.findOne({
      where: {
        id
      },
    })

    if(user){
      return reply.send({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          user_type_id: user.user_type_id,
        },
      })
    }

    return reply.code(400).send({
      success: false,
      message: "User not found.",
    })
  })

  fastify.post('/user/login', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
        },
        required: [
          'username',
          'password',
        ]
      },
    },
  }, async(request, reply) => {
    const {username, password} = request.body

    if(_.isEmpty(username) || _.isEmpty(password)){
      return reply.send({
        success: false,
        message: "Username and password is required."
      })
    }

    const user = await User.findOne({
      where: {
        username,
        password,
      },
    })

    if(user && user.user_type_id === 1){
      return reply.send({
        success: true,
        message: "User successfully logged in.",
        user: {
          id: user.id,
          user_type_id: user.user_type_id,
          username,
        },
      })
    }

    if(user && user.user_type_id === 2){
      let customer = await Customer.findOne({
        where: {
          user_id: user.id
        },
        include: [
          {
            model: CustomerOccupation,
            as: 'customer_occupations',
          },
          {
            model: CustomerStartup,
            as: 'customer_startups',
          },
          {
            model: CustomerPitch,
            as: 'customer_pitches',
          }
        ],
      })

      let customerCurrentMonthPosts = _.filter(customer.customer_pitches, (item) => {
        let itemMonth = moment(item.createdAt).month()
        let itemYear = moment(item.createdAt).year()
        if(itemMonth === moment().month() && itemYear === moment().year()){
          return item
        }
      })

      _.set(customer, "current_month_total_post", customerCurrentMonthPosts.length)

      return reply.send({
        success: true,
        message: "User successfully logged in.",
        user: {
          id: user.id,
          user_type_id: user.user_type_id,
          username,
        },
        customer,
      })
    }

    return reply.send({
      success: false,
      message: "Email or password is incorrect."
    })

  })

  fastify.post('/user/reset-password', {
    schema: {
      body: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
          },
        },
        required: [
          'email',
        ]
      },
    },
  }, async(request, reply) => {
    const {email} = request.body

    try {
      const customer = await Customer.findOne({
        where: {
          email,
        },
      })
  
      if(_.isEmpty(customer)){
        return reply.send({
          success: false,
          message: "Email doesn't exist",
        })
      }

      await PasswordResetToken.destroy({
        where: {
          customer_id: customer.customer_id,
        }
      })

      let resetToken = crypto.randomBytes(32).toString("hex")

      const hash = await bcrypt.hash(resetToken, Number(10))

      await PasswordResetToken.create({
        customer_id: customer.customer_id,
        token: hash,
      })

      // sendForgotPasswordMail
      await axios.post(`${process.env.POSTMARK_BASE_URL}/withTemplate`,{
        From: process.env.POSTMARK_FROM_EMAIL,
        To: email,
        MessageStream: "outbound",
        TemplateId: "28278139",
        TemplateModel: {
          subject: "Twoguys - Reset Password",
          reset_password_link: `https://twoguys.app/change-password?token=${resetToken}&id=${customer.customer_id}`,
          unsubscribe_link: process.env.WEB_APP_BASE_URL
      }}, {
        headers: {"X-Postmark-Server-Token" : process.env.POSTMARK_TOKEN},
      })
      
      return reply.send({
        success: true,
        message: "Reset password link successfully sent.",
        token: resetToken,
      })
      
    } catch (error) {
      console.error(error)

      return reply.send({
        success: true,
        message: "Something went wrong.",
        error
      })
    }

  })

  fastify.post('/user/change-password', {
    schema: {
      body: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          token: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
        },
        required: [
          'customer_id',
          'token',
          'password',
        ]
      },
    },
  }, async(request, reply) => {
    const {customer_id, token, password} = request.body

    try {
      const passwordResetToken = await PasswordResetToken.findOne({
        where: {
          customer_id
        }
      })

      if(!passwordResetToken){
        return reply.send({
          success: false,
          error_code: "TOKEN_NOT_FOUND",
          message: "Password reset link is invalid or expired.",
        })
      }

      let isTokenValid = await bcrypt.compare(token, passwordResetToken.token)

      if(!isTokenValid){
        return reply.send({
          success: false,
          error_code: "INVALID_TOKEN",
          message: "Password reset link is invalid or expired.",
        })
      }

      let customer = await Customer.findOne({
        where: {
          customer_id
        }
      })

      await User.update({
        password,
      }, {
        where: {
          id: customer.user_id
        }
      })

      await passwordResetToken.destroy()

      return reply.send({
        success: true,
        message: "New password succesfully updated.",
      })
    } catch (error) {
      console.error(error)
      return reply.send({
        success: true,
        message: "Something went wrong.",
        error
      })
    }

  })

//end
}

module.exports = userController