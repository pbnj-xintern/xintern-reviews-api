'use strict';
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const ReviewsHelper = require('./helpers/reviews')

//--------------- LAMBDA FUNCTIONS ---------------

module.exports.createReview = async (event) => {
  try {
    let response = await ReviewsHelper.createReview(event)
    return response
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
};