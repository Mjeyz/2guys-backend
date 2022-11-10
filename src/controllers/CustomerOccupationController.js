
const {
  User,
  Customer,
  CustomerOccupation
} = require("../../database/models")

var uuid = require('uuid');

const db = require("../../database/models"),
sequelize = db.sequelize,
Sequelize = db.Sequelize

var _ = require('lodash');

const crypto = require('crypto');
// const moment = require("moment");

async function customerOccupationController (fastify, options) {

  fastify.get('/customer/occupations/:id', {
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

    let customerOccupation = await CustomerOccupation.findOne({
      where: {
        id
      },
    })

    if(customerOccupation){
      return reply.send({
        success: true,
        message: "Item found.",
        customer_occupation: customerOccupation
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Item Customer not found.",
    })
  })

  fastify.post('/customer/occupations', {
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
        },
        required: [
          'customer_id',
          'name',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_id,
      name,
    } = request.body

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let customerOccupation = await CustomerOccupation.create({
        customer_id,
        name
      }, {transaction})

      transaction.afterCommit(async() => {
        return reply.code(201).send({
          success: true,
          message: "Successfully created.",
          customer_occupation: customerOccupation,
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

  fastify.delete('/customer/occupations/:id', {
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

    const customerOccupation = await CustomerOccupation.destroy({
      where: {
        id
      }
    })

    if(customerOccupation){
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


//end
}

module.exports = customerOccupationController