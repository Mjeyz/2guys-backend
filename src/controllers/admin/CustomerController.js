
const {
  User,
  Customer,
  CustomerOccupation,
  CustomerStartup,
  CustomerPitch,
  CustomerPitchApplicant,
  CustomerPitchApplyValidity,
  CustomerPitchAssessmentQuestion,
  CustomerSavedPitch,
  CustomerSuccessfulPartner,
} = require("../../../database/models")

var uuid = require('uuid');

const db = require("../../../database/models"),
sequelize = db.sequelize,
Sequelize = db.Sequelize

var _ = require('lodash');

const crypto = require('crypto');
const moment = require("moment")

async function customerController (fastify, options) {

  fastify.delete('/customer/pitches/:pitch_id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          pitch_id: {
            type: 'integer',
          },
        },
        required: [
          'pitch_id',
        ]
      },
    },
  }, async(request, reply) => {
    const {pitch_id} = request.params
    
    let transaction

    try {
      transaction = await db.sequelize.transaction()

      const customerPitch = await CustomerPitch.findOne({
        where: {
          id: pitch_id
        }
      })

      if(customerPitch){
        await customerPitch.destroy({
        }, {transaction})

        await CustomerPitchApplicant.destroy({
          where: {
            customer_pitch_id: pitch_id
          }
        }, {transaction})

        await CustomerPitchApplyValidity.destroy({
          where: {
            customer_pitch_id: pitch_id
          }
        }, {transaction})

        await CustomerPitchAssessmentQuestion.destroy({
          where: {
            customer_pitch_id: pitch_id
          }
        }, {transaction})

        await CustomerSavedPitch.destroy({
          where: {
            customer_pitch_id: pitch_id
          }
        }, {transaction})

        await CustomerSuccessfulPartner.destroy({
          where: {
            customer_pitch_id: pitch_id
          }
        }, {transaction})

      }

      await transaction.commit()

      return reply.code(200).send({
        success: true,
        message: "Item successfully remove.",
      })

    } catch (error) {

      if (transaction) {
        await transaction.rollback();
      }
      
      return reply.code(400).send({
        success: false,
        message: "Someting went wrong.",
      })
    }


  })

  fastify.delete('/customer/:customer_id', {
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
    
    let transaction

    try {
      transaction = await db.sequelize.transaction()

      const customer = await Customer.findOne({
        where: {
          customer_id
        }
      })

      if(customer){
        await customer.destroy({
        }, {transaction})

        await User.destroy({
          where: {
            id: customer.user_id
          }
        }, {transaction})

        await CustomerOccupation.destroy({
          where: {
            customer_id
          }
        }, {transaction})

        await CustomerStartup.destroy({
          where: {
            customer_id
          }
        }, {transaction})

        const customerPitch = await CustomerPitch.findAll({
          where: {
            customer_id   
          }
        })
  
        if(customerPitch){
          _.each(customerPitch, async(item) => {
            await CustomerPitch.destroy({
              where: {
                id: item.id
              }
            })
    
            await CustomerPitchApplicant.destroy({
              where: {
                customer_pitch_id: item.id
              }
            })
    
            await CustomerPitchApplyValidity.destroy({
              where: {
                customer_pitch_id: item.id
              }
            })
    
            await CustomerPitchAssessmentQuestion.destroy({
              where: {
                customer_pitch_id: item.id
              }
            })
    
            await CustomerSavedPitch.destroy({
              where: {
                customer_pitch_id: item.id
              }
            })
    
            await CustomerSuccessfulPartner.destroy({
              where: {
                customer_pitch_id: item.id
              }
            })

          })
        }

        await transaction.commit()
  
      }

      return reply.code(200).send({
        success: true,
        message: "Item successfully remove.",
      })

    } catch (error) {

      if (transaction) {
        await transaction.rollback();
      }
      
      return reply.code(400).send({
        success: false,
        message: "Someting went wrong.",
      })
    }


  })

//end
}

module.exports = customerController