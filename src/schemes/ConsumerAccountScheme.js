const ajv = require("ajv").default


const schema = {
  body: {
    type: 'object',
    properties: {
      email: {
        type: 'email',
      }
    },
    required: ['email', 'password'],
    errorMessage: {
      required: {
        email: 'Email address is required', // specify error message for when the
      }
    }
  }
}


const validate = ajv.compile(schema)

module.exports = {
  validate,
}