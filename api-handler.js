'use strict';
const ReviewsHelper = require('./helpers/reviews')
const UPVOTE_TYPE = 'upvotes'
const DOWNVOTE_TYPE = 'downvotes'
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const AuthHelper = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const middy = require('middy')
const TOKEN_SECRET = process.env.TOKEN_SECRET

//--------------- LAMBDA FUNCTIONS ---------------

//013_FEAT_CRUD-REVIEW
//createReview 1.0

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
//updateReview 2.3
module.exports.updateCompany = middy(async (event) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let companyId = event.pathParameters.company_id
	return await ReviewsHelper.updateCompany(companyId, payload)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

//deleteReview 3.3
module.exports.deleteReview = middy(async (event) => {
	let reviewId = event.pathParameters.review_id
	return await ReviewsHelper.deleteReview(reviewId)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

//014_FEAT_CRUD_COMMENT
//createComment
module.exports.createComment = middy(async (event) => {
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
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))
//deleteComment
module.exports.deleteComment = middy(async (event) => {
	let commentId = event.pathParameters.comment_id
	return await ReviewsHelper.deleteComment(commentId)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))
//updateComment
module.exports.updateComment = middy(async (event) => {
	let commentId = event.pathParameters.comment_id
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	return await ReviewsHelper.updateComment(commentId, payload)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

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

module.exports.flagReview = middy(async (event) => {
	if (!event.pathParameters.review_id)
		return Status.createErrorResponse(400, "Review is not specified")
	if (!event.body.user_id)
		return Status.createErrorResponse(400, "User is not specified")

	return await ReviewsHelper.flagReview(event.body.user_id, event.pathParameters.review_id)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

module.exports.flagComment = middy(async (event) => {
	if (!event.pathParameters.comment_id)
		return Status.createErrorResponse(400, "Comment is not specified")
	if (!event.body.user_id)
		return Status.createErrorResponse(400, "User is not specified")

	return await ReviewsHelper.flagComment(event.body.user_id, event.pathParameters.comment_id)
}).use(verifyJWT(TOKEN_SECRET))

module.exports.getPopulatedComments = async event => {
	return await ReviewsHelper.getPopulatedComments(event.pathParameters.review_id)
}





