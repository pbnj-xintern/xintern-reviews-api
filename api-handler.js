'use strict';
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const ReviewsHelper = require('./helpers/reviews')

//--------------- LAMBDA FUNCTIONS ---------------

module.exports.createReview = async (event) => {
  let payload = event.body
  try {
    return await ReviewsHelper.createReview(payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}

module.exports.updateReviewFields = async (event) => {
  let payload = event.body
  let reviewId = event.pathParameters.review_id
  try {
    return await ReviewsHelper.updateReviewFields(reviewId, payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}

module.exports.updateReviewCompany = async (event) => {
  let payload = event.body
  let companyId = event.pathParameters.company_id
  try {
    return await ReviewsHelper.updateReviewCompany(companyId, payload)
  } catch (err) {
      console.error('company does not exist:\n', err.message)
      return Status.createErrorResponse(400, err.message)
  }
}

module.exports.updateReviewRating = async (event) => {
  let payload = event.body
  let ratingId = event.pathParameters.rating_id
  try {
    return await ReviewsHelper.updateReviewRating(ratingId, payload)
  } catch (err) {
      console.error('rating does not exist:\n', err.message)
      return Status.createErrorResponse(400, err.message)
  }
}











module.exports.deleteReview = async (event) => {
  let payload = event.body
  try {
    // return await ReviewsHelper.deleteReview(payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}
module.exports.addCompany = async (event) => {

}
