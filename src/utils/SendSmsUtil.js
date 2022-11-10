const axios = require('axios').default;

const sendSms = async(phone, content) => {
  const smsEndpoint = "http://api2.nxcloud.com/api/sms/mtsend"
  const appkey = "ES7UgbF6"
  const secretkey = "rQI8PM1D"
  const sourceAddress = "yomo"

  const { data, status, headers } = await axios.post(smsEndpoint, new URLSearchParams({
    appkey,
    secretkey,
    phone,
    content,
    source_address: sourceAddress,
  }))

  let response = {}

  switch(data.code){
    case "0" :
      response = {
        success: true,
        message: "Request succeeded",
      }
      break
    case "1" :
      response = {
        success: false,
        message: "The application is unavailable or the key is wrong",
      }
      break
    case "2" :
      response = {
        success: false,
        message: "The parameter is wrong or empty",
      }
      break
    case "3" :
      response = {
        success: false,
        message: "Insufficient balance",
      }
      break
    case "4" :
      response = {
        success: false,
        message: "The content is empty or contains illegal keywords",
      }
      break
    case "5" :
      response = {
        success: false,
        message: "The content is too long",
      }
      break
    case "6" :
      response = {
        success: false,
        message: "Wrong number",
      }
      break  
    case "7" :
      response = {
        success: false,
        message: "The number of group numbers shall not exceed 50,000",
      }
      break
    case "8" :
      response = {
        success: false,
        message: "sourceaddress must be 3-10 digits or English letters",
      }
      break
    case "9" :
      response = {
        success: false,
        message: "Illegal IP",
      }
      break

    case "88" :
      response = {
        success: false,
        message: "Request failed",
      }
      break

    case "99" :
      response = {
        success: false,
        message: "system error",
      }
      break
  }

  return response
}


module.exports = {
  sendSms
}