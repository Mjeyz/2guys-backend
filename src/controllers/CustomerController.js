
const {
  User,
  Customer,
  CustomerOccupation,
  CustomerStartup,
  CustomerPitch
} = require("../../database/models")

var uuid = require('uuid');

const db = require("../../database/models"),
sequelize = db.sequelize,
Sequelize = db.Sequelize

var _ = require('lodash');

const crypto = require('crypto');
const moment = require("moment")
const {saveBase64ToFile} = require('../utils/UploadImageUtil')

async function customerController (fastify, options) {

  fastify.get('/customers', async(request, reply) => {

    const customers = await Customer.findAll()

    if(customers){
      return reply.send({
        success: true,
        customers: customers,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Item customers not found.",
    })
  })

  fastify.get('/customers/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: [
          'id',
        ]
      },
    },
  }, async(request, reply) => {
    const {id} = request.params

    let customer = await Customer.findOne({
      where: {
        customer_id: id
      },
      include: [
        {
          model: CustomerOccupation,
          as: 'customer_occupations',
          // attributes: { exclude: ['UserId'] }
        },
        {
          model: CustomerStartup,
          as: 'customer_startups',
          // attributes: { exclude: ['UserId'] }
        },
        {
          model: CustomerPitch,
          as: 'customer_pitches',
          // include: {
          //   model: SubscriptionPlan,
          //   as: 'subscription_plan'
          // },
          attributes: { exclude: ['UserId'] }
        }
      ],
      // attributes: { exclude: ['UserId'] }
    })
// 
    if(customer){

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
        message: "Item Customer found.",
        customer,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Item Customer not found.",
    })
  })

  fastify.post('/customers', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          age: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          gender: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
        },
        required: [
          'name',
          'email',
          'password',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      name,
      age,
      email,
      gender,
      password,
    } = request.body

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let user = await User.create({
        user_type_id: 2,
        username: email,
        password,
      }, {transaction})

      let customerId = crypto.randomBytes(16).toString("hex");

      let customer = await Customer.create({
        user_id: user.id,
        customer_id: customerId,
        name,
        age,
        email,
        gender
      },  {transaction})

      transaction.afterCommit(async() => {
        return reply.code(201).send({
          success: true,
          message: "Customer successfully created.",
          user,
          customer,
        })
      })

      await transaction.commit()

    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }

      return reply.send({
        success: false,
        message: 'Something went wrong.',
        error: error.message
      })
    }

  })

  fastify.put('/customers', {
    schema: {
      body: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          age: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          gender: {
            type: 'string',
          },
        },
        required: [
          'customer_id',
          'email',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_id,
      name,
      age,
      email,
      gender,
    } = request.body

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let customer = await Customer.findOne({
        where: {
          customer_id
        }
      })

      customer.update({
        name,
        age,
        email,
        gender
      }, {transaction})
      
      let user = await User.update({
        username: email,
      }, {
        where: {
          id: customer.user_id
        }
      }, {transaction})

      transaction.afterCommit(async() => {
        return reply.code(201).send({
          success: true,
          message: "Customer successfully updated.",
          customer,
        })
      })

      await transaction.commit()

      return reply.send({
        success: false,
        message: 'Customer not found.',
      })

    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }

      return reply.send({
        success: false,
        message: 'Something went wrong.',
        error: error.message
      })
    }

  })

  fastify.put('/customers/profile-image', {
    schema: {
      body: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          profile_image: {
            type: 'object',
          },
        },
        required: [
          'profile_image',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_id,
      profile_image,
    } = request.body

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let customer = await Customer.findOne({
        where: {
          customer_id
        }
      })

      let profileImage = await saveBase64ToFile(profile_image.base64, profile_image.extension)

      await customer.update({
        profile_image_url: profileImage,
      }, {transaction})
      
      transaction.afterCommit(async() => {
        return reply.code(200).send({
          success: true,
          message: "Customer image successfully updated.",
          customer,
        })
      })

      await transaction.commit()

      return reply.send({
        success: false,
        message: 'Customer not found.',
      })

    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }

      return reply.send({
        success: false,
        message: 'Something went wrong.',
        error: error.message
      })
    }

  })

  fastify.delete('/customers/:id', {
    schema: {
      params: {
        type: 'object',
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

    const Customer = await Customer.destroy({
      where: {
        id
      }
    })

    if(Customer){
      return reply.code(200).send({
        success: true,
        message: "Item successfully remove.",
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Someting went wrong.",
    })
  })

  fastify.get('/customers/:customer_id/check-pitch-limit', {
    schema: {
      params: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
        },
        required: [
          'customer_id',
        ]
      },
    },
  }, async(request, reply) => {
    const {customer_id} = request.params

    const customer = await Customer.findOne({
      where: {
        customer_id
      },
      include: [
        {
          model: CustomerPitch,
          as: 'customer_pitches',
        }
      ]
    })

    if(customer){

      let customerCurrentMonthPosts = _.filter(customer.customer_pitches, (item) => {
        let itemMonth = moment(item.createdAt).month()
        let itemYear = moment(item.createdAt).year()
        if(itemMonth === moment().month() && itemYear === moment().year()){
          return item
        }
      })
    
      let canPostPitch = customer.post_limit > customerCurrentMonthPosts.length

      return reply.code(200).send({
        success: true,
        current_month_posts: customerCurrentMonthPosts.length,
        can_post_pitch: canPostPitch,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Someting went wrong.",
    })
  })

//end
}

module.exports = customerController