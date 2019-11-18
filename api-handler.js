'use strict';
const ReviewsHelper = require('./helpers/reviews')
const UPVOTE_TYPE = 'upvotes'
const DOWNVOTE_TYPE = 'downvotes'
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const TOKEN_SECRET = process.env.TOKEN_SECRET
const AuthHelper = require('@pbnj-xintern/xintern-commons/util/auth_checker')
//--------------- LAMBDA FUNCTIONS ---------------

//013_FEAT_CRUD-REVIEW
//createReview 1.0
module.exports.createReview = async (event) => {
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
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		payload.author = decodedJWT.userId;
		return await ReviewsHelper.createComment(reviewId, payload)
	}

	return Status.createErrorResponse(401, "Invalid Bearer Token")
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

module.exports.upvoteReview = async (event, context, callback) => {
	let reviewId = event.pathParameters.review_id
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		let userId = decodedJWT.user_id
		return await ReviewsHelper.upvoteOrDownvoteReview(reviewId, userId, UPVOTE_TYPE)
	}
	return Status.createErrorResponse(401, "Invalid Bearer Token")

}

module.exports.downvoteReview = async (event, context, callback) => {
	let reviewId = event.pathParameters.review_id
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		let userId = decodedJWT.user_id
		return await ReviewsHelper.upvoteOrDownvoteReview(reviewId, userId, DOWNVOTE_TYPE)
	}
	return Status.createErrorResponse(401, "Invalid Bearer Token")
}

module.exports.upvoteComment = async (event, context, callback) => {
	let commentId = event.pathParameters.comment_id
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		let userId = decodedJWT.user_id
		return ReviewsHelper.upvoteOrDownvoteComment(commentId, userId, UPVOTE_TYPE)
	}
	return Status.createErrorResponse(401, "Invalid Bearer Token")


}

module, exports.downvoteComment = async (event, context, callback) => {
	let commentId = event.pathParameters.comment_id
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		let userId = decodedJWT.user_id
		return ReviewsHelper.upvoteOrDownvoteComment(commentId, userId, DOWNVOTE_TYPE)
	}
	return Status.createErrorResponse(401, "Invalid Bearer Token")

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

module.exports.getReviewById = async event => {
	let result = await ReviewsHelper.getReviewById(event.pathParameters.review_id);
	if (!result)
		return Status.createErrorResponse(404, "Could not find review")
	return Status.createSuccessResponse(200, result)
}

module.exports.getTopCompanies = async event => {
	return await ReviewsHelper.getTopCompanies();
}


module.exports.getRecentReviews = async (event) => {
	return await ReviewsHelper.getRecentReviews()
}

module.exports.getAllCompanies = async (event) => {
	return await ReviewsHelper.getAllCompanies()
}

module.exports.flagReview = async (event) => {
	if (!event.pathParameters.review_id)
		return Status.createErrorResponse(400, "Review is not specified")
	if (!event.body.user_id)
		return Status.createErrorResponse(400, "User is not specified")

	return await ReviewsHelper.flagReview(event.body.user_id, event.pathParameters.review_id)
}

module.exports.flagComment = async (event) => {
	if (!event.pathParameters.comment_id)
		return Status.createErrorResponse(400, "Comment is not specified")
	if (!event.body.user_id)
		return Status.createErrorResponse(400, "User is not specified")

	return await ReviewsHelper.flagComment(event.body.user_id, event.pathParameters.comment_id)
}

module.exports.getPopulatedComments = async event => {
	return await ReviewsHelper.getPopulatedComments(event.pathParameters.review_id)
}