'use strict';
const CommentHelper = require('./helpers/comment')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const TOKEN_SECRET = process.env.TOKEN_SECRET
const AuthHelper = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const middy = require('middy')
const Comment = require('@pbnj-xintern/xintern-commons/models/Comment')

//--------------- LAMBDA FUNCTIONS ---------------
module.exports.getUpvotedCommentsByUserId = middy(async (event) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		let user_id = decodedJWT.userId;
		return await CommentHelper.getUpvotedCommentsByUserId(user_id)
	}
	return Status.createErrorResponse(403, "Invalid Bearer Token")
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

module.exports.getDownvotedCommentsByUserId = middy(async (event) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		let user_id = decodedJWT.userId;
		return await CommentHelper.getDownvotedCommentsByUserId(user_id)
	}
	return Status.createErrorResponse(403, "Invalid Bearer Token")
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))


module.exports.createComment = middy(async (event) => {
	let reviewId = event.pathParameters.review_id
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let decodedJWT = false
	if (event.headers && event.headers.Authorization) {
		decodedJWT = AuthHelper.decodeJWT(event.headers.Authorization.replace("Bearer ", ""));
	}
	if (decodedJWT) {
		payload.author = decodedJWT.userId;
		return await CommentHelper.createComment(reviewId, payload)
	}

	return Status.createErrorResponse(401, "Invalid Bearer Token")
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))
//deleteComment
module.exports.deleteComment = middy(async (event) => {
	let commentId = event.pathParameters.comment_id
	return await CommentHelper.deleteComment(commentId)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

//updateComment
module.exports.updateComment = middy(async (event) => {
	let commentId = event.pathParameters.comment_id
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	return await CommentHelper.updateComment(commentId, payload)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

module.exports.getPopulatedComments = async event => {
	return await CommentHelper.getPopulatedComments(event.pathParameters.review_id)
}