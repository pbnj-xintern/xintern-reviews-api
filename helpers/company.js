const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const AwsUtil = require('@pbnj-xintern/xintern-commons/util/aws')
const db = require('@pbnj-xintern/xintern-commons/util/db')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const dbUrl = process.env.MONGO_URL

const getExtension = base64 => {
    if (base64.includes('image/jpg') || base64.includes('image/jpeg'))
        return '.jpg'
    if (base64.includes('image/png'))
        return '.png'
    if (base64.includes('image/bmp'))
        return '.bmp'
    return null
}

module.exports.updateCompanyPicture = async (companyObj, base64) => {

    let extension = getExtension(base64)

    if (!extension)
        return Status.createErrorResponse(400, 'Incorrect image format supplied')

    let fileName = companyObj.name + '_logo' + extension
    fileName = fileName.split(' ').join('-')

    let url = await AwsUtil.uploadMultipartToS3(fileName, base64, 'company/')

    if (!url)
        return Status.createErrorResponse(500, 'Could not upload image')

    return db.exec(
        dbUrl,
        () => Company.findOneAndUpdate({ _id: companyObj._id }, { logo: url }).then(company => {
            return Status.createSuccessResponse(200, company)
        }).catch(err => {
            console.log(err)
            return Status.createErrorResponse(500, 'Error while finding company')
        })
    )
}

module.exports.getCompanyById = async id => {
    return db.exec(
        dbUrl,
        () => Company.findById(id).catch(err => {
            console.log(err)
            return Status.createErrorResponse(500, 'Error while finding company')
        })
    )
}