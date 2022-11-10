const db = require("../../database/models")
const chalk = require('chalk');
const axios = require('axios').default;
var _ = require('lodash');
let generator = require('generate-password');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentWebhook = async(request, reply) => {
  // const endpointSecret = "whsec_PKBBSsUpPGnaAan57cGSYto5HZXRgHJT"; //test
  const endpointSecret = "whsec_2bc1b03680c8d1c99d7be542f3012d435087c57e9994ac5c00970a2fb6fdfacf";
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body.raw, sig, endpointSecret);
  } catch (err) {
    reply.code(400).send({
      success: false,
      message: `Webhook Error: ${err.message}`
    })
    return;
  }

  const fulfillOrder = async (paymentIntent) => {
    console.info("Fulfilling order - paymentIntent", paymentIntent);
    
    const customer = await stripe.customers.retrieve(
      paymentIntent.customer
    );

    const invoice = await stripe.invoices.retrieve(
      paymentIntent.invoice
    );

    console.info("customerx", customer)
    console.info("invoice", invoice)
    console.info("lines-data", invoice.lines.data)

    let customerAccount = await createCustomer({
      customer_id: invoice.customer,
      stripe_price_id: invoice.lines.data[0].price.id,
      name: invoice.customer_name,
      email: invoice.customer_email,
      payment_gateway: 'stripe',
      start_payment_date: invoice.lines.data[0].period.start,
      next_payment_date: invoice.lines.data[0].period.end,
      stripe_subscription_id: invoice.subscription
    })

    await updateLoginSessionToken({
      user_id: customerAccount.user.id,
      stripe_id: paymentIntent.customer,
    })

  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.info("paymentIntent-succeed", paymentIntent)
      fulfillOrder(paymentIntent);
      break;

    case 'checkout.session.completed':
      const session = event.data.object;
      console.info(session)

      await createLoginSessionToken({
        stripe_id: session.customer,
        token: session.client_reference_id
      })

      break
      
    default:
      console.info(`Unhandled event type ${event.type}`);
  }

  return reply.send({
    success: true,
  })
}

const createCheckoutSession = async (request, reply) => {
  const {
    cancel_url,
    price_id,
    customer
  } = request.body

  let token = generator.generate({
    length: 16,
    numbers: true
  });

  let successUrl = `${process.env.WEB_APP_BASE_URL}dashboard/customer?token=${token}`
  
  const session = await stripe.checkout.sessions.create({
    success_url: successUrl,
    cancel_url: cancel_url,
    payment_method_types: ['card'],
    mode: 'subscription',
    client_reference_id: token,
    customer,
    line_items: [
      {
        price: price_id,
        quantity: 1
      },
    ],
    // payment_intent_data: {
    //   setup_future_usage: 'off_session',
    // },
  })

  console.info('checkout-session', session)

  if(session){
    return reply.send({
      success: true,
      session
    })
  }

  return reply.send({
    success: false,
    message: "Something went wrong."
  })

}

const retrieveCustomer = async(request, reply) => {
  const { customer_id } = request.query

  const customer = await stripe.customers.retrieve(
    customer_id
  );

  return reply.send({
    success: true,
    customer
  })

}

const cancelCustomerSubscription = async(subscriptionId) => {
  const delSubscription = await stripe.subscriptions.del(
    subscriptionId
  );

  return delSubscription

}

const createCustomer = async(params) => {
  const endpoint = `${process.env.BASE_URL}v1/customers`
  const { data, status, headers } = await axios.post(endpoint, params)
  return data
}

const createLoginSessionToken = async(params) => {
  const endpoint = `${process.env.BASE_URL}v1/login-session-tokens`
  const { data, status, headers } = await axios.post(endpoint, params)
  return data
}

const updateLoginSessionToken = async(params) => {
  const endpoint = `${process.env.BASE_URL}v1/login-session-tokens`
  const { data, status, headers } = await axios.put(endpoint, params)
  return data
}

module.exports = {
  paymentWebhook,
  createCheckoutSession,
  retrieveCustomer,
  cancelCustomerSubscription,
}