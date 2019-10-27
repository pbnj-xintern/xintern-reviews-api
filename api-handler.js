'use strict';
const ReviewsHelper = require('./helpers/reviews')
const UPVOTE_TYPE = 'upvotes'
const DOWNVOTE_TYPE = 'downvotes'

//--------------- LAMBDA FUNCTIONS ---------------

//013_FEAT_CRUD-REVIEW
//createReview 1.0
module.exports.createReview = async (event) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  return await ReviewsHelper.createReview(payload)
}
//updateReview 2.1
module.exports.updateReview = async (event) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  let reviewId = event.pathParameters.review_id
  return await ReviewsHelper.updateReview(reviewId, payload)
}
//updateReview 2.2
module.exports.updateRating = async (event) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  let ratingId = event.pathParameters.rating_id
  return await ReviewsHelper.updateRating(ratingId, payload)
}
//updateReview 2.3
module.exports.updateCompany = async (event) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  let companyId = event.pathParameters.company_id
  return await ReviewsHelper.updateCompany(companyId, payload)
}

//deleteReview 3.3
module.exports.deleteReview = async (event) => {
  let reviewId = event.pathParameters.review_id
  return await ReviewsHelper.deleteReview(reviewId)
}

//014_FEAT_CRUD_COMMENT
//createComment
module.exports.createComment = async (event) => {
  let reviewId = event.pathParameters.review_id
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  return await ReviewsHelper.createComment(reviewId, payload)
}
//deleteComment
module.exports.deleteComment = async (event) => {
  let commentId = event.pathParameters.comment_id
  return await ReviewsHelper.deleteComment(commentId)
}
//updateComment
module.exports.updateComment = async (event) => {
  let commentId = event.pathParameters.comment_id
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  return await ReviewsHelper.updateComment(commentId, payload)
}

module.exports.getFlaggedReviews = event => {
  return ReviewsHelper.getFlaggedReviews()
}

module.exports.getPopulatedReviews = async (event, context, callback) => {
  return await ReviewsHelper.getPopulatedReviews(event.pathParameters.review_id);
}

module, exports.upvoteReview = async (event, context, callback) => {
  let reviewId = event.pathParameters.review_id
  let userId = event.body.user_id

  if (!reviewId)
    return Status.createErrorResponse(400, "Unclear which review should be upvoted")
  if (!userId)
    return Status.createErrorResponse(400, "Unclear which user is upvoting")

  return ReviewsHelper.upvoteOrDownvoteReview(reviewId, userId, UPVOTE_TYPE)
}

module, exports.downvoteReview = async (event, context, callback) => {
  let reviewId = event.pathParameters.review_id
  let userId = event.body.user_id

  if (!reviewId)
    return Status.createErrorResponse(400, "Unclear which review should be downvoted")
  if (!userId)
    return Status.createErrorResponse(400, "Unclear which user is downvoting")

  return ReviewsHelper.upvoteOrDownvoteReview(reviewId, userId, DOWNVOTE_TYPE)
}

module, exports.upvoteComment = async (event, context, callback) => {
  let commentId = event.pathParameters.comment_id
  let userId = event.body.user_id

  if (!commentId)
    return Status.createErrorResponse(400, "Unclear which comment will be downvoted")
  if (!userId)
    return Status.createErrorResponse(400, "Unclear which user is attempting to downvote")

  return ReviewsHelper.upvoteOrDownvoteComment(commentId, userId, UPVOTE_TYPE)
}

module, exports.downvoteComment = async (event, context, callback) => {
  let commentId = event.pathParameters.comment_id
  let userId = event.body.user_id

  if (!commentId)
    return Status.createErrorResponse(400, "Unclear which comment will be downvoted")
  if (!userId)
    return Status.createErrorResponse(400, "Unclear which user is attempting to downvote")

  return ReviewsHelper.upvoteOrDownvoteComment(commentId, userId, DOWNVOTE_TYPE)
}

module.exports.addCompany = async (event, context) => {
  let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
  return await ReviewsHelper.addCompany(payload)
}

module.exports.deleteCompany = async (event) => {
  return await ReviewsHelper.deleteCompany(event.pathParameters.company_id)
}

module.exports.getReviewsByCompany = async (event) => {
  return await ReviewsHelper.getReviewsByCompany(event.pathParameters.company_id)
}

module.exports.getTopCompanies = async event => {
  return await ReviewsHelper.getTopCompanies();
}


module.exports.getRecentReviews = async (event) => {
  return await ReviewsHelper.getRecentReviews()
}
