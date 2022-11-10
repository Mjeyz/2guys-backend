const path = require('path');
const crypto = require('crypto');
const multer = require('fastify-multer')
const fs = require('fs')
const util = require('util')

const uploadFile = (uploadPath) => {

  return multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../../uploads' + uploadPath))
        },
        filename: (req, file, cb) => {
            let customFileName = crypto.randomBytes(18).toString('hex')
            let fileExtension = path.extname(file.originalname).split('.')[1];
            cb(null, customFileName + '.' + fileExtension)
        }
      })
    })
}

const saveBase64ToFile = async (base64Image, fileExtension) => {
  try {
    let customFileName = crypto.randomBytes(18).toString('hex')
    const writeBase64File = util.promisify(fs.writeFile)

    const uploadPath = "img/" + customFileName + "." + fileExtension

    const response = await writeBase64File("uploads/" + uploadPath, base64Image, {encoding: 'base64'})
    
    if(!response){
      return uploadPath
    }

    return response

  } catch (error) {
    console.log(error.message)
    return {
      success: false,
      message: error.message
    }
  }
}

module.exports = {
  uploadFile,
  saveBase64ToFile
}