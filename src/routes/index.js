
async function routes (fastify, options) {

  fastify.get('/', async (request, reply) => {
    return "Nothing to see here....."
  })

  const { 
    paymentWebhook, 
    createCheckoutSession,
    retrieveCustomer
  } = require('../controllers/StripeController')


  fastify.register(require('../controllers/UserController'), { prefix: '/v1' })
  fastify.register(require('../controllers/CustomerController'), { prefix: '/v1' })
  fastify.register(require('../controllers/SessionController'), { prefix: '/v1' })
  
  fastify.register(require('../controllers/CustomerOccupationController'), { prefix: '/v1' })
  fastify.register(require('../controllers/CustomerStartupController'), { prefix: '/v1' })
  fastify.register(require('../controllers/CustomerPitchController'), { prefix: '/v1' })
  fastify.register(require('../controllers/CustomerPitchAssessmentController'), { prefix: '/v1' })

  //admin
  fastify.register(require('../controllers/admin/CustomerController'), { prefix: '/v1/admin' })

  fastify.register((fastify, opts, done) => {
    fastify.addContentTypeParser(
      'application/json',
      { parseAs: 'buffer' },
    function (req, body, done){
      try {
        var newBody = {
          raw: body
        }
        done(null, newBody)
      } catch (error) {
        error.statusCode = 400
        done(error, undefined)
      }
    })

    fastify.post('/webhook', paymentWebhook)

    done()
  }, { prefix: '/v1' })

  fastify.get('/v1/stripe/customers', retrieveCustomer)
  fastify.post('/v1/stripe/checkout-session', createCheckoutSession)


}

module.exports = routes