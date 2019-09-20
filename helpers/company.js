const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const AwsUtil = require('@pbnj-xintern/xintern-commons/util/aws')
const db = require('@pbnj-xintern/xintern-commons/util/db')

module.exports.updateCompanyPicture = async (companyObj, base64, extension) => {
    let fileName = companyObj.name + '_logo' + extension
    fileName.replace(' ', '-')
    let url = await AwsUtil.uploadMultipartToS3(fileName, base64, 'company/')
    return db(
        process.env.MONGO_URL,
        () => Company.findOneAndUpdate({ _id: companyObj._id }, { logo: url }).then(company => {
            return status.createSuccessResponse(200, company)
        }).catch(err => {
            console.log(err)
            return status.createErrorResponse(500, 'Could not find flagged reviews')
        })
    )
}