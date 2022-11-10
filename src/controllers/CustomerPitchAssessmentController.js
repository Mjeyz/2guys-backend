
const {
  User,
  Customer,
  CustomerPitchApplicant,
  CustomerPitchAssessmentAnswer,
  CustomerPitchApplyValidity,
  CustomerPitch,
} = require("../../database/models")

var uuid = require('uuid');

const db = require("../../database/models"),
sequelize = db.sequelize,
Sequelize = db.Sequelize

var _ = require('lodash');
const axios = require('axios').default

const crypto = require('crypto');
// const moment = require("moment");

async function customerPitchAssessmentController (fastify, options) {

  fastify.get('/customer/pitch/assessment/applicants', {
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

  fastify.post('/customer/pitch/assessment/applicants', {
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
          customer_applicant_email: {
            type: 'string',
          },
          question_answers: {
            type: 'array',
          },
        },
        required: [
          'customer_id',
          'customer_pitch_id',
          'customer_applicant_email',
          'question_answers',
        ]
      },
    },
  }, async(request, reply) => {
    const { 
      customer_id,
      customer_pitch_id,
      customer_applicant_email,
      question_answers
    } = request.body

    let transaction
    let questionAnswerHtml = []

    try {
      transaction = await db.sequelize.transaction()

      let customerPitchApplicant = await CustomerPitchApplicant.create({
        customer_id,
        customer_pitch_id,
        customer_applicant_email
      }, {transaction})

      let customerPitchApplyValidity = await CustomerPitchApplyValidity.findOne({
        where: {
          customer_pitch_id
        }
      })

      if(customerPitchApplyValidity){
        let increment = 1
        await customerPitchApplyValidity.update({
          total_applicant: parseInt(customerPitchApplyValidity.total_applicant) + parseInt(increment)
        }, {transaction})
      }

      question_answers.forEach( async(item, index) => {

        // questionAnswerHtml.push(`
        //   <tr style="border-collapse:collapse">
        //     <td align="left"
        //       style="Margin:0;;padding-bottom:15px;padding-left:20px;padding-right:20px">

        //       <p
        //         style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#333333;font-size:16px">
        //         Question ${index + 1}: ${item.question}</p>
        //       <p
        //         style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#333333;font-size:16px">
        //         Answer: ${item.customer_answer} </p>
        //     </td>
        //   </tr>`)
          

          questionAnswerHtml.push(`
            <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding: 20px">
                <p
                  style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:40px;color:#000;font-weight:500;font-size:18px">
                  Question ${index + 1}: ${item.question}
                  <br>
                  Answer: ${item.customer_answer}
                </p>
              </td>
            </tr>`
          )


        await CustomerPitchAssessmentAnswer.create({
          customer_pitch_applicant_id: customerPitchApplicant.id,
          customer_pitch_assessment_question_id: item.customer_pitch_assessment_question_id,
          customer_answer: item.customer_answer,
        })
        
      });
      
      transaction.afterCommit(async() => {
        let customer = await Customer.findOne({
          where: {
            customer_id
          }
        })

        let customerPitch = await CustomerPitch.findOne({
          where: {
            id: customer_pitch_id
          }
        })

        let customerPitchCreator = await Customer.findOne({
          where: {
            customer_id: customerPitch.customer_id
          }
        })

        await axios.post(`${process.env.POSTMARK_BASE_URL}/withTemplate`,{
          From: process.env.POSTMARK_FROM_EMAIL,
          To: customerPitchCreator.email,
          MessageStream: "outbound",
          TemplateId: "28275973",
          TemplateModel: {
            subject: `Twoguys - Application for ${customerPitch.pitch_title}`,
            pitch_title: customerPitch.pitch_title,
            applicant_name: customer.name,
            applicant_email: customer.email,
            question_answer_html:  questionAnswerHtml.join(''),
            deal_link: `${process.env.WEB_APP_BASE_URL}dashboard?accepted=true&pitchid=${customer_pitch_id}&applicantid=${customer_id}`,
            dashboard_link: `${process.env.WEB_APP_BASE_URL}dashboard`,
            unsubscribe_link: process.env.WEB_APP_BASE_URL
        }}, {
          headers: {"X-Postmark-Server-Token" : process.env.POSTMARK_TOKEN},
        })


        return reply.code(201).send({
          success: true,
          message: "Successfully created.",
          customer_pitch_applicant: customerPitchApplicant,
          customer_pitch_assessment_answers: question_answers,
          customer_pitch_apply_validity: customerPitchApplyValidity,
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


//end
}

module.exports = customerPitchAssessmentController