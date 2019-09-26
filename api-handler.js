'use strict';
const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const ReviewHelper = require('./helpers/reviews')
const CompanyHelper = require('./helpers/company')

const TEST_KEY = process.env.TEST_KEY

//--------------- FUNCTIONS ---------------

//Returns a success response
const sendOKResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  }
}

//Returns an error response
const sendErrorResponse = (statusCode, errorMessage) => {
  console.error('sendErrorRepsonse: console logging error msg:\n', errorMessage)
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: errorMessage })
  }
}

//--------------- LAMBDA FUNCTIONS ---------------

module.exports.createReview = async (event) => {
  let data = event.body
  // let author = //grab User obj from event/context

  //grab properties from event param
  let newReview = Review({
    salary: data.salary,
    content: data.content,
    position: data.position
    // user: //User
  })
  try {
    //send newReview obj to db
    return sendOKResponse(201, 'Review successfully created!')
  } catch (err) {
    console.error('caught error:', err.message)
    return sendErrorResponse(400, err.message)
  }
};

module.exports.getFlaggedReviews = async event => {
  return ReviewHelper.getFlaggedReviews()
}

module.exports.updateCompanyLogo = async event => {

  console.log('BUCKET', process.env.BUCKET_NAME)

  if (!event.body)
    return Status.sendErrorResponse(400, 'No image supplied')

  let pathParameters = typeof (event.pathParameters) === 'string' ?
    JSON.parse(event.pathParameters) :
    event.pathParameters

  if (!pathParameters)
    return Status.sendErrorResponse(400, 'Company ID not specified')

  let company = await CompanyHelper.getCompanyById(pathParameters.company_id)

  return CompanyHelper.updateCompanyPicture(company, event.body)

}