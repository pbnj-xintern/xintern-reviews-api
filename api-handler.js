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

module.exports.updateReview = async (event, payload) => {
  let payload = event.body
  let reviewId = event.pathParameters.review_id
  try {
    return await ReviewsHelper.updateReview(reviewId, payload)
  } catch (err) {
    console.error('caught error:', err.message)
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