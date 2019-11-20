const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const Comment = require('@pbnj-xintern/xintern-commons/models/Comment')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const RequestChecker = require('@pbnj-xintern/xintern-commons/util/request_checker')
const AuthChecker = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const db = require('@pbnj-xintern/xintern-commons/util/db')
const mongoose = require('mongoose')
const ReviewHelper = require('./reviews')
const MONGO_URL = process.env.MONGO_URL


const addCommentToReview = async (reviewId, commentId) => {
    try {
        //grab existing comments from review obj
        let review = await ReviewHelper.getReviewById(reviewId)
        let existingComments = review.comments
        //add new comment to list
        existingComments.push(commentId)
        //update review obj
        let result = await db.exec(MONGO_URL, () => {
            return Review.findByIdAndUpdate(reviewId, {
                comments: existingComments
            }, { new: true })
        })
        if (result)
            return Status.createSuccessResponse(200, {
                message: "Comment successfully added to Review."
            })
    } catch (err) {
        console.error('add comment to review caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

const getAllComments = async (reviewId) => {
    try {
        let comments = await db.exec(MONGO_URL, () => {
            return Comment.find({ review: reviewId }).populate('author')
        })
        return comments
    } catch (err) {
        console.error('get all comments caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

const deleteAllComments = async (payload) => {
    try {
        let commentsList = await getAllComments(payload.review_id)
        let result = await db.exec(MONGO_URL, () => {
            return Comment.deleteMany({
                _id: {
                    $in: commentsList //array of comments
                }
            })
        })
        if (result)
            return { OKmessage: "All comments successfully DELETED." }
    } catch (err) {
        console.error('delete all comments caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

//createComment + link to Review
module.exports.createComment = async (reviewId, payload) => {
    let newComment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        content: payload.content,
        upvotes: [],
        downvotes: [],
        parentComment: (payload.parent_comment_id) ? payload.parent_comment_id : null,
        author: payload.author,
        review: reviewId
    })
    try {
        let result = await db.exec(MONGO_URL, () => {
            return newComment.save()
        })

        if (!result._id || result === null) return Status.createErrorResponse(400, "Comment could not be created.")
        console.log('new comment:\n', result)
        let newCommentId = result._id
        let response = await addCommentToReview(reviewId, newCommentId)
        if (response.statusCode === 200)
            return Status.createSuccessResponse(201, {
                comment_id: newComment._id,
                message: "Comment successfully CREATED."
            })
    } catch (err) {
        console.error('create comment caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

//deleteComment - patch request to remove content and user, but keep the object
module.exports.deleteComment = async (commentId) => {
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Comment.findOneAndUpdate(commentId, {
                author: null, //handle err msg client side
                content: "[this comment has been removed.]"
            })
        })
        return (result.author === null) ? Status.createSuccessResponse(200, { comment_id: commentId, message: "Comment successfully DELETED." }) : Status.createErrorResponse(400, "Comment did not delete.")
    } catch (err) {
        console.error('delete comment caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}
//updateComment
module.exports.updateComment = async (commentId, payload) => {
    let payloadIsValid = await RequestChecker(payload, Comment)
    if (!payloadIsValid) return Status.createErrorResponse(400, "payload does not match model.")
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Comment.findByIdAndUpdate(commentId, {
                content: payload.content
            }, { new: true })
        })
        if (result)
            return Status.createSuccessResponse(204, {
                message: "Comment successfully UPDATED."
            })
    } catch (err) {
        console.error('update comment caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

function bfs(root, map) {
    let queue = [root];
    while (queue.length > 0) {
        let node = queue.shift();
        node.replies = map[node._id];
        if (node.replies != null) {
            queue = queue.concat(node.replies)
        }
    }
}

module.exports.getPopulatedComments = async reviewId => {
    try {
        let result = await getAllComments(reviewId);
        let map = {};
        let comments = result.map(comment => comment.toObject())
        let rootComments = comments.filter(x => {
            return !x.parentComment;
        });

        for (var comment of comments) {
            if (!comment.parentComment) {
                map[comment._id] = []
            } else if (!map[comment.parentComment]) {
                map[comment.parentComment] = [comment]
            } else if (map[comment.parentComment]) {
                map[comment.parentComment].push(comment)
            }
        }
        rootComments.forEach(root => bfs(root, map));

        return Status.createSuccessResponse(200, rootComments);
    }
    catch (err) {
        return Status.createErrorResponse(400, "Unable to populate comments")
    }
}

module.exports.deleteAllComments = deleteAllComments