
const {
  User,
  Customer,
  CustomerPitch,
  CustomerSavedPitch,
  CustomerPitchAssessmentQuestion,
  CustomerPitchApplyValidity,
  CustomerSuccessfulPartner,
  CustomerPitchApplicant,
} = require("../../database/models")

var uuid = require('uuid');

const db = require("../../database/models"),
sequelize = db.sequelize,
Sequelize = db.Sequelize

var _ = require('lodash')
const moment = require("moment")
const crypto = require('crypto')
const axios = require('axios').default

async function customerPitchController (fastify, options) {

  fastify.get('/customer/pitches', {
    schema: {
      query: {
        type: 'object',
        properties: {
          locations_filter: {
            type: 'string',
            default: "USA,Germany,Worldwide"
          },
          customer_id: {
            type: 'string',
          },
        },
        required: [
          'locations_filter',
        ]
      },
    },
  }, async(request, reply) => {
    let {locations_filter, customer_id} = request.query

    let locationWhere = () => {
      if(locations_filter === "Worldwide"){
        return {
          location: {
            [Sequelize.Op.in]: ["USA","Germany","Worldwide"]
          },
        }
      }
      
      return {
        location: {
          [Sequelize.Op.in]: locations_filter.split(',')
        },
      }
    }

    let customerPitches = await CustomerPitch.findAll({
      where: {
        ...locationWhere(),
        status: 1,
      },
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: CustomerPitchAssessmentQuestion,
          as: "customer_pitch_assessment_questions"
        },
        {
          model: CustomerPitchApplyValidity,
          as: "customer_pitch_apply_validity"
        }
      ],
      order: [['created_at', 'desc']],
    })

    let todayTotalPitches = _.filter(customerPitches, (item) => {
      if(item.date_short === moment().format('MM/DD/YYYY')){
        return item
      }
    })

   
    if(customer_id){
      let customerPitchApplied = await CustomerPitchApplicant.findAll({
        where: {
          customer_id
        }
      })

      _.map(customerPitches, (item) => {
        //Dont allow user to apply to his/her post
        item.customer_id === customer_id ? _.set(item, 'can_apply', false) : _.set(item, 'can_apply', true)

        //Dont allow user to apply multiple times to any post
        _.find(customerPitchApplied, ["customer_pitch_id", item.id]) && _.set(item, 'can_apply', false)
        
        return item
      })
    }

    if(customerPitches){
      return reply.send({
        success: true,
        customer_id,
        today: moment().format('MM/DD/YYYY'),
        total_pitches: customerPitches.length,
        today_total_pitches: todayTotalPitches.length,
        customer_pitches: customerPitches,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Item customers not found.",
    })
  })

  fastify.get('/customer/pitches/:id', {
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

    let customerPitch = await CustomerPitch.findOne({
      where: {
        id
      },
    })

    if(customerPitch){
      return reply.send({
        success: true,
        message: "Item Customer found.",
        customer_pitch: customerPitch
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Item Customer not found.",
    })
  })

  fastify.post('/customer/pitches', {
    schema: {
      body: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          pitch_title: {
            type: 'string',
          },
          idea_description: {
            type: 'string',
          },
          location: {
            type: 'string',
          },
          potential_yearly_revenue_min: {
            type: 'string',
          },
          potential_yearly_revenue_max: {
            type: 'string',
          },
          assessment_questions: {
            type: 'array',
          },
        },
        required: [
          'customer_id',
          'pitch_title',
          'idea_description',
          'location',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_id,
      pitch_title,
      idea_description,
      location,
      assessment_questions,
      potential_yearly_revenue_min,
      potential_yearly_revenue_max,
    } = request.body

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let potentialRev 

      if(_.has(request.body, "potential_yearly_revenue_min") && _.has(request.body, "potential_yearly_revenue_max")){
        potentialRev = `${potential_yearly_revenue_min} - ${potential_yearly_revenue_max}`
      }

      let customerPitch = await CustomerPitch.create({
        customer_id,
        pitch_title,
        idea_description,
        location,
        potential_yearly_revenue: potentialRev,
      }, {transaction})

      let applyValidity = await CustomerPitchApplyValidity.create({
        customer_pitch_id: customerPitch.id,
        post_validity: 7,
        total_applicant: 0,
      }, {transaction})

      assessment_questions.forEach( async(item) => {
        await CustomerPitchAssessmentQuestion.create({
          customer_pitch_id: customerPitch.id,
          question_title: item.question_title,
          question_order_num: item.question_order_num,
          question_optional: item.question_optional,
        })
      });

      transaction.afterCommit(async() => {
        return reply.code(201).send({
          success: true,
          message: "Successfully created.",
          customer_pitch: customerPitch,
          customer_assessment_questions: assessment_questions,
          customer_pitch_apply_validity: applyValidity
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

  fastify.delete('/customer/pitches/:id', {
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

    const customerPitch = await CustomerPitch.destroy({
      where: {
        id
      }
    })

    if(customerPitch){
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

  fastify.post('/customer/pitch/save', {
    schema: {
      body: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          customer_pitch_id: {
            type: 'integer',
          },
        },
        required: [
          'customer_id',
          'customer_pitch_id',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_id,
      customer_pitch_id,
    } = request.body

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let customerPitch = await CustomerSavedPitch.create({
        customer_id,
        customer_pitch_id,
      }, {transaction})

      transaction.afterCommit(async() => {
        return reply.code(201).send({
          success: true,
          message: "Successfully created.",
          customer_pitch: customerPitch,
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

  fastify.get('/customer/:customer_id/pitches/save', {
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
    const { 
      customer_id,
    } = request.params

    try {
      let customerPitch = await CustomerSavedPitch.findAll({
        where: {
          customer_id
        },
        include: [
          {
            model: Customer,
            as: 'customer'
          },
          {
            model: CustomerPitch,
            as: 'customer_pitch'
          }
        ]
      })

      if(customerPitch){
        return reply.code(200).send({
          success: true,
          message: "Successfully found.",
          customer_pitch: customerPitch,
        })
      }

    } catch (error) {
      return reply.send({
        success: false,
        message: 'Something went wrong.',
        error: error.message
      })
    }

  })

  fastify.delete('/customer/pitch/save', {
    schema: {
      body: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          customer_pitch_id: {
            type: 'integer',
          },
        },
        required: [
          'customer_id',
          'customer_pitch_id',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_id,
      customer_pitch_id,
    } = request.body

    try {
      let customerPitch = await CustomerSavedPitch.destroy({
        where: {
          customer_id,
          customer_pitch_id,
        }
      })

      if(customerPitch){
        return reply.code(200).send({
          success: true,
          message: "Successfully deleted.",
        })
      }

      return reply.code(500).send({
        success: true,
        message: "Something went wrong",
      })


    } catch (error) {
      return reply.send({
        success: false,
        message: 'Something went wrong.',
        error: error.message
      })
    }

  })

  fastify.get('/customer/:customer_id/pitches', {
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

    let customerPitches = await CustomerPitch.findAll({
      where: {
        customer_id,
        status: 1,
      },
      include: [
        {
          model: CustomerPitchApplyValidity,
          as: 'customer_pitch_apply_validity',
        },
      ],
    })

    if(customerPitches){
      return reply.send({
        success: true,
        message: "Item Customer found.",
        customer_pitches: customerPitches,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Item Customer not found.",
    })
  })

  fastify.put('/customer/:customer_id/pitch/status', {
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
      body: {
        type: 'object',
        properties: {
          customer_pitch_id: {
            type: 'integer',
          },
          status: {
            type: 'integer',
          },
        },
        required: [
          'customer_pitch_id',
          'status'
        ]
      },
    },
  }, async(request, reply) => {
    const {customer_id} = request.params
    const {customer_pitch_id, status} = request.body

    let customerPitch = await CustomerPitch.findOne({
      where: {
        id: customer_pitch_id,
        customer_id
      },
      include: [
        {
          model: CustomerPitchApplyValidity,
          as: 'customer_pitch_apply_validity',
        },
      ],
    })
    
    if(customerPitch){
      await customerPitch.update({
        status
      })

      return reply.send({
        success: true,
        message: "Status successfully updated",
        customer_pitch: customerPitch,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Customer pitch not found.",
    })
  })

  fastify.post('/customer/pitch/accepted', {
    schema: {
      body: {
        type: 'object',
        properties: {
          customer_pitch_id: {
            type: 'integer',
          },
          customer_partner_id: {
            type: 'string',
          },
        },
        required: [
          'customer_pitch_id',
          'customer_partner_id'
        ]
      },
    },
  }, async(request, reply) => {
    const {
      customer_pitch_id, 
      customer_partner_id
    } = request.body

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let customerPitch = await CustomerPitch.findOne({
        where: {
          id: customer_pitch_id
        }
      })

      let customerSuccessPartnerFind = await CustomerSuccessfulPartner.findOne({
        where: {
          customer_pitch_id,
          customer_partner_id
        }
      })
      
      if(!customerSuccessPartnerFind){
        let customerSuccessfulPartner = await CustomerSuccessfulPartner.create({
          customer_id: customerPitch.customer_id, 
          customer_pitch_id,
          customer_partner_id
        }, {transaction})
    
        let customerApplicant = await Customer.findOne({
          where: {
            customer_id: customer_partner_id
          }
        }, {transaction})
    
        let customerCreator = await Customer.findOne({
          where: {
            customer_id: customerPitch.customer_id
          }
        }, {transaction})
    
        transaction.afterCommit(async() => {
          // sendApplicantSuccessDealEmail
          await axios.post(`${process.env.POSTMARK_BASE_URL}/withTemplate`,{
            From: process.env.POSTMARK_FROM_EMAIL,
            To: customerApplicant.email,
            MessageStream: "outbound",
            TemplateId: "28278685",
            TemplateModel: {
              subject: `Twoguys - Accepted Deal partnership for ${customerPitch.pitch_title}`,
              pitch_title: customerPitch.pitch_title,
              applicant_name: customerApplicant.name,
              creator_name: customerCreator.name,
              creator_email: customerCreator.email,
              dashboard_link: `${process.env.WEB_APP_BASE_URL}dashboard`,
              unsubscribe_link: process.env.WEB_APP_BASE_URL
          }}, {
            headers: {"X-Postmark-Server-Token" : process.env.POSTMARK_TOKEN},
          })

          // sendCreatorDealDetailEmail
          await axios.post(`${process.env.POSTMARK_BASE_URL}/withTemplate`,{
            From: process.env.POSTMARK_FROM_EMAIL,
            To: customerCreator.email,
            MessageStream: "outbound",
            TemplateId: "28278687",
            TemplateModel: {
              subject: `Twoguys - Accepted deal details partnership for ${customerPitch.pitch_title}`,
              pitch_title: customerPitch.pitch_title,
              applicant_name: customerApplicant.name,
              applicant_email: customerApplicant.email,
              dashboard_link: `${process.env.WEB_APP_BASE_URL}dashboard`,
              unsubscribe_link: process.env.WEB_APP_BASE_URL
          }}, {
            headers: {"X-Postmark-Server-Token" : process.env.POSTMARK_TOKEN},
          })

          return reply.code(201).send({
            success: false,
            message: "Success",
            customer_successful_partner: customerSuccessfulPartner,
          })
        
        })
  
        await transaction.commit()
  
      }

      return reply.send({
        success: false,
        message: 'Deal already accepted',
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

  fastify.get('/customer/:customer_id/pitch/accepts', {
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

    let customerSuccessfulPartners = await CustomerSuccessfulPartner.findAll({
      where: {
        customer_id
      },
      include: [
        {
          model: Customer,
          as: 'customer_partner',
        },
        {
          model: CustomerPitch,
          as: 'customer_pitch',
        },
      ],
    })

    if(customerSuccessfulPartners){
      return reply.send({
        success: true,
        message: "Item Customer found.",
        customer_successful_partners: customerSuccessfulPartners,
      })
    }

    return reply.code(400).send({
      success: false,
      message: "Not found.",
    })
  })

  fastify.post('/report/pitch/:customer_pitch_id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          customer_pitch_id: {
            type: 'integer',
          },
        },
        required: [
          'customer_pitch_id',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_pitch_id,
    } = request.params

    let transaction

    try {
      transaction = await db.sequelize.transaction()

      let customerPitch = await CustomerPitch.findOne({
        where: {
          id: customer_pitch_id
        }
      })

      if(customerPitch){
        await customerPitch.update({
          report_count: parseInt(customerPitch.report_count) + 1
        }, {transaction})
  
        transaction.afterCommit(async() => {
          return reply.code(201).send({
            success: true,
            message: "Report successfully submitted.",
            customerPitch,
          })
        })

        await transaction.commit()
      }

      return reply.send({
        success: false,
        message: 'Customer pitch not found.',
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

  fastify.get('/customer/:customer_id/pitch/:customer_pitch_id/check-apply-limit', {
    schema: {
      params: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          customer_pitch_id: {
            type: 'integer',
          },
        },
        required: [
          'customer_id',
          'customer_pitch_id',
        ]
      },
    },
  }, async(request, reply) => {
    const {customer_id, customer_pitch_id} = request.params

    const customerPitchApplicantTotal = await CustomerPitchApplicant.count({
      where: {
        customer_pitch_id
      }
    })

    if(customerPitchApplicantTotal > 1){
      const customer = await Customer.findOne({
        where: {
          customer_id
        },
        attributes: ['post_applicant_limit']
      })

      let canApply = customerPitchApplicantTotal < customer.post_applicant_limit ? true : false

      return reply.code(200).send({
        success: true,
        customer_pitch_applicant_total: customerPitchApplicantTotal,
        can_apply: canApply,
      })

    }

    return reply.code(200).send({
      success: false,
      message: "Pitch not found.",
    })
  })

  fastify.get('/customer/:customer_id/pitch/:customer_pitch_id/check-partner-limit', {
    schema: {
      params: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
          },
          customer_pitch_id: {
            type: 'integer',
          },
        },
        required: [
          'customer_id',
          'customer_pitch_id',
        ]
      },
    },
  }, async(request, reply) => {
    const {customer_id, customer_pitch_id} = request.params

    const customerSuccessfullPartnerTotal = await CustomerSuccessfulPartner.count({
      where: {
        customer_id,
        customer_pitch_id
      }
    })

    if(customerSuccessfullPartnerTotal > 1){
      const customer = await Customer.findOne({
        where: {
          customer_id
        },
        attributes: ['partner_applicant_limit']
      })

      let canAccept = customerSuccessfullPartnerTotal < customer.partner_applicant_limit ? true : false

      return reply.code(200).send({
        success: true,
        customer_pitch_partner_total: customerSuccessfullPartnerTotal,
        can_accept: canAccept,
      })

    }

    return reply.code(200).send({
      success: false,
      customerSuccessfullPartnerTotal,
      message: "Pitch not found.",
    })
  })

  




//end
}

module.exports = customerPitchController