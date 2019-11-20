'use strict';
const VoteAndFlagHelper = require('./helpers/vote-and-flag')
const UPVOTE_TYPE = 'upvotes'
const DOWNVOTE_TYPE = 'downvotes'
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const TOKEN_SECRET = process.env.TOKEN_SECRET
const AuthHelper = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const middy = require('middy')

//--------------- LAMBDA FUNCTIONS ---------------
module.exports.upvoteReview = async (event, context, callback) => {
	let reviewId = event.pathParameters.review_id
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		let userId = decodedJWT.user_id
		return await VoteAndFlagHelper.upvoteOrDownvoteReview(reviewId, userId, UPVOTE_TYPE)
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
		return await VoteAndFlagHelper.upvoteOrDownvoteReview(reviewId, userId, DOWNVOTE_TYPE)
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
		return VoteAndFlagHelper.upvoteOrDownvoteComment(commentId, userId, UPVOTE_TYPE)
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
		return VoteAndFlagHelper.upvoteOrDownvoteComment(commentId, userId, DOWNVOTE_TYPE)
	}
	return Status.createErrorResponse(401, "Invalid Bearer Token")

}

module.exports.flagReview = middy(async (event) => {
	if (!event.pathParameters.review_id)
		return Status.createErrorResponse(400, "Review is not specified")
	if (!event.body.user_id)
		return Status.createErrorResponse(400, "User is not specified")

	return await VoteAndFlagHelper.flagReview(event.body.user_id, event.pathParameters.review_id)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

module.exports.flagComment = middy(async (event) => {
	if (!event.pathParameters.comment_id)
		return Status.createErrorResponse(400, "Comment is not specified")
	if (!event.body.user_id)
		return Status.createErrorResponse(400, "User is not specified")

	return await VoteAndFlagHelper.flagComment(event.body.user_id, event.pathParameters.comment_id)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))