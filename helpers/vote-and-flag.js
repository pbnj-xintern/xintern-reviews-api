const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const Comment = require('@pbnj-xintern/xintern-commons/models/Comment')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const RequestChecker = require('@pbnj-xintern/xintern-commons/util/request_checker')
const db = require('@pbnj-xintern/xintern-commons/util/db')
const mongoose = require('mongoose')
const UserHelper = require('./user')
const MONGO_URL = process.env.MONGO_URL

// be cautious when using this !
const getVotingLists = async (id, schema) => {
    return db.exec(
        MONGO_URL,
        () => schema.find({ _id: id })
            .select('upvotes downvotes')
            .then(docs => {
                if (!docs || docs.length === 0) {
                    console.error('Could not find documents with id', id)
                    return null
                }
                return {
                    upvotes: docs[0].upvotes || [],
                    downvotes: docs[0].downvotes || []
                }
            })
            .catch(err => {
                err.message ? console.error(err.message) : console.error(err)
                return null;
            })
    )
}

const udpateObjectSimple = async (mongooseObj, where, set) => {
    return mongooseObj.findOneAndUpdate(where, set, { new: true })
        .then(updatedObj => {
            if (!updatedObj)
                return Status.createErrorResponse(500, 'Could not update ' + mongooseObj.modelName)
            return Status.createSuccessResponse(200, updatedObj)
        })
        .catch(err => {
            console.error(err)
            return Status.createErrorResponse(500, 'Could not update ' + mongooseObj.modelName)
        })
}

const appendToVoteList = (userId, targetList, oppositeList) => {

    let uidTargetIndex = targetList.indexOf(userId)
    let uidOppositeIndex = oppositeList.indexOf(userId)

    //if not in target list then add
    if (uidTargetIndex === -1) {
        targetList.push(userId)

        // if user exists in opposite list
        // users should not be able to downvote and upvote at the same time
        if (uidOppositeIndex !== -1)
            oppositeList.splice(uidOppositeIndex, 1)
    }
    else //already voted, so it will un-vote
        targetList.splice(uidTargetIndex, 1)

    return {
        targetList: targetList,
        oppositeList: oppositeList
    }

}

module.exports.flagReview = async (userId, reviewId) => {
    let foundUser = await db.exec(MONGO_URL, () => User.findById(userId)).catch(() => false)
    if (foundUser) {
        let flaggedList = await db.exec(MONGO_URL, () => Review.findById(reviewId).select("flagged")).then(r => r.flagged).catch(() => null)

        if (!flaggedList) {
            return Status.createErrorResponse(500, 'Error while trying to flag review')
        }

        let index = flaggedList.indexOf(userId)

        index >= 0 ?
            flaggedList.splice(index, 1) :
            flaggedList.push(userId)

        let reviewUpdateResult = await db.exec(MONGO_URL,
            () => Review.findByIdAndUpdate(reviewId, { flagged: flaggedList }))
            .catch(e => {
                console.error(e)
                return null
            })

        return reviewUpdateResult ?
            Status.createSuccessResponse(200, "Successfully flagged review " + reviewUpdateResult._id + JSON.stringify(reviewUpdateResult.flagged)) :
            Status.createErrorResponse(500, 'Error while trying to flag review')
    }
    return Status.createErrorResponse(400, 'Could not flag review')
}


module.exports.flagComment = async (userId, commentId) => {
    let foundUser = await db.exec(MONGO_URL, () => User.findById(userId)).catch(() => false)
    if (foundUser) {
        let flaggedList = await db.exec(MONGO_URL, () => Comment.findById(commentId).select("flagged")).then(r => r.flagged).catch(() => null)

        if (!flaggedList) {
            return Status.createErrorResponse(500, 'Error while trying to flag comment')
        }

        let index = flaggedList.indexOf(userId)

        index >= 0 ?
            flaggedList.splice(index, 1) :
            flaggedList.push(userId)

        let commentUpdateResult = await db.exec(MONGO_URL,
            () => Comment.findByIdAndUpdate(commentId, { flagged: flaggedList }))
            .catch(e => {
                console.error(e)
                return null
            })

        return commentUpdateResult ?
            Status.createSuccessResponse(200, "Successfully flagged comment " + commentUpdateResult._id + JSON.stringify(commentUpdateResult.flagged)) :
            Status.createErrorResponse(500, 'Error while trying to flag comment')
    }
    return Status.createErrorResponse(400, 'Could not flag comment')
}

module.exports.genericUpvoteOrDownvote = async (schema_id, user_id, type, schema) => {

    if (type !== 'upvotes' && type !== 'downvotes')
        return Status.createErrorResponse(400, 'Missing a field')

    let oppositeType = type === 'upvotes' ? 'downvotes' : 'upvotes'
    let votingLists = await getVotingLists(schema_id, schema)
    let foundUserId = await UserHelper.findUserId({ user_id: user_id })

    if (!votingLists)
        return Status.createErrorResponse(404, 'Could not find review')
    if (!foundUserId)
        return Status.createErrorResponse(404, 'Could not find user')

    let targetList = votingLists[type]
    let oppositeList = votingLists[oppositeType]
    let updated = appendToVoteList(foundUserId, targetList, oppositeList)

    let where = { _id: schema_id }
    let set = {}
    set[type] = updated.targetList
    set[oppositeType] = updated.oppositeList

    return db.exec(
        MONGO_URL,
        () => udpateObjectSimple(schema, where, set)
    )
}

module.exports.upvoteOrDownvoteReview = async (review_id, user_id, type) => {
    return this.genericUpvoteOrDownvote(review_id, user_id, type, Review)
}

module.exports.upvoteOrDownvoteComment = async (comment_id, user_id, type) => {
    return this.genericUpvoteOrDownvote(comment_id, user_id, type, Comment)
}
