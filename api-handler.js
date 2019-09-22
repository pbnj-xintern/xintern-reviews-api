'use strict';
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const ReviewsHelper = require('./helpers/reviews')

//--------------- LAMBDA FUNCTIONS ---------------

//013_FEAT_CRUD-REVIEW
  //createReview 1.0
module.exports.createReview = async (event) => {
  let payload = event.body
  try {
    return await ReviewsHelper.createReview(payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}
  //updateReview 2.1
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
  //updateReview 2.2
  module.exports.updateRating = async (event) => {
    let payload = event.body
    let ratingId = event.pathParameters.rating_id
    try {
      return await ReviewsHelper.updateReviewRating(ratingId, payload)
    } catch (err) {
        console.error('rating does not exist:\n', err.message)
        return Status.createErrorResponse(400, err.message)
    }
  }
  //updateReview 2.3
module.exports.updateCompany = async (event) => {
  let payload = event.body
  let companyId = event.pathParameters.company_id
  try {
    return await ReviewsHelper.updateReviewCompany(companyId, payload)
  } catch (err) {
      console.error('company does not exist:\n', err.message)
      return Status.createErrorResponse(400, err.message)
  }
}
  //deleteReview 3.1
module.exports.deleteRating = async (event) => {
  let ratingId = event.pathParameters.rating_id
  try {
    return await ReviewsHelper.deleteRating(ratingId)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}
  //deleteReview 3.2
module.exports.deleteAllComments = async (event) => {
  let payload = event.body //pass in comments array
  try {
    return await ReviewsHelper.deleteAllComments(payload)
  } catch (err) {
    console.error('caught error:', err.message)
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
  let payload = event.body
  try {
    return await ReviewsHelper.createComment(payload)
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
  let payload = event.body
  try {
    return await ReviewsHelper.updateComment(commentId, payload)
  } catch (err) {
    console.error('caught error:', err.message)
    return Status.createErrorResponse(400, err.message)
  }
}

// module.exports.addCommentToReview = async (event) => {
//   let payload = event.body
//   try {
//     return await ReviewsHelper.addCommentToReview(payload)
//   } catch (err) {
//     console.error('caught error:', err.message)
//     return Status.createErrorResponse(400, err.message)
//   }
// }

// module.exports.addCompany = async (event) => {

// }
