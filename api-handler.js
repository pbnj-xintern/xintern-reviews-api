'use strict';
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const CompanyHelper = require('./helpers/company')
const ReviewsHelper = require('./helpers/reviews')

//--------------- LAMBDA FUNCTIONS ---------------

//013_FEAT_CRUD-REVIEW
  //createReview 1.0
module.exports.createReview = async (event) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  try {
    return await ReviewsHelper.createReview(payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}
  //updateReview 2.1
module.exports.updateReview = async (event) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  let reviewId = event.pathParameters.review_id
  try {
    return await ReviewsHelper.updateReview(reviewId, payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}
  //updateReview 2.2
  module.exports.updateRating = async (event) => {
    let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
    let ratingId = event.pathParameters.rating_id
    try {
      return await ReviewsHelper.updateRating(ratingId, payload)
    } catch (err) {
        console.error('rating does not exist:\n', err.message)
        return Status.createErrorResponse(400, err.message)
    }
  }
  //updateReview 2.3
module.exports.updateCompany = async (event) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  let companyId = event.pathParameters.company_id
  try {
    return await ReviewsHelper.updateCompany(companyId, payload)
  } catch (err) {
      console.error('company does not exist:\n', err.message)
      return Status.createErrorResponse(400, err.message)
  }
}

  //deleteReview 3.3
module.exports.deleteReview = async (event) => {
  let reviewId = event.pathParameters.review_id
  try {
    return await ReviewsHelper.deleteReview(reviewId)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}

//014_FEAT_CRUD_COMMENT
  //createComment
module.exports.createComment = async (event) => {
  let reviewId = event.pathParameters.review_id
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  try {
    return await ReviewsHelper.createComment(reviewId, payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}
  //deleteComment
module.exports.deleteComment = async (event) => {
  let commentId = event.pathParameters.comment_id
  try {
    return await ReviewsHelper.deleteComment(commentId)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}
  //updateComment
module.exports.updateComment = async (event) => {
  let commentId = event.pathParameters.comment_id
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  try {
    return await ReviewsHelper.updateComment(commentId, payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}

module.exports.getFlaggedReviews = event => {
  return ReviewsHelper.getFlaggedReviews()
}

module.exports.getPopulatedReviews = async (event, context, callback) => {
	return await ReviewsHelper.getPopulatedReviews(event.pathParameters.review_id);
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
