'use strict';
const ReviewsHelper = require('./helpers/reviews')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const TOKEN_SECRET = process.env.TOKEN_SECRET
const AuthHelper = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const middy = require('middy')

//--------------- LAMBDA FUNCTIONS ---------------
module.exports.createReview = middy(async (event) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		payload.user_id = decodedJWT.userId;
		return await ReviewsHelper.createReview(payload)
	}
	return Status.createErrorResponse(401, "Invalid Bearer Token")
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))
//updateReview 2.1
module.exports.updateReview = middy(async (event) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let reviewId = event.pathParameters.review_id
	return await ReviewsHelper.updateReview(reviewId, payload)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

//updateReview 2.2
module.exports.updateRating = middy(async (event) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let ratingId = event.pathParameters.rating_id
	return await ReviewsHelper.updateRating(ratingId, payload)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

//deleteReview 3.3
module.exports.deleteReview = middy(async (event) => {
	let reviewId = event.pathParameters.review_id
	return await ReviewsHelper.deleteReview(reviewId)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

module.exports.getFlaggedReviews = event => {
    return Status.createErrorResponse(501, 'NOT YET SUPPORTED')
	// return ReviewsHelper.getFlaggedReviews()
}

module.exports.getReviewsByCompany = async (event) => {
	return await ReviewsHelper.getReviewsByCompany(event.pathParameters.company_id)
}

module.exports.getReviewById = async event => {
	let result = await ReviewsHelper.getReviewById(event.pathParameters.review_id);
	if (!result)
		return Status.createErrorResponse(404, "Could not find review")
	return Status.createSuccessResponse(200, result)
}

module.exports.getRecentReviews = async (event) => {
	return await ReviewsHelper.getRecentReviews()
}