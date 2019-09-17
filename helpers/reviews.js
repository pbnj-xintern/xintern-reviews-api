const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Comment = require('@pbnj-xintern/xintern-commons/models/Comment')
const dbExec = require('@pbnj-xintern/xintern-commons/util/db')
const status = require('@pbnj-xintern/xintern-commons/util/status')
const dbUrl = process.env.MONGO_URL;

module.exports.getFlaggedReviews = () => {
    return dbExec(
        dbUrl,
        () => {
            return Review.find({ flagged: true }).then(reviews => {
                return status.createSuccessResponse(200, reviews)
            }).catch(err => {
                console.log(err)
                return status.createErrorResponse(500, 'Could not find flagged reviews')
            })
        }
    )
}

module.exports.getFlaggedComments = () => {
    return dbExec(
        dbUrl,
        () => {
            return Comment.find({ flagged: true }).then(comments => {
                return status.createSuccessResponse(200, comments)
            }).catch(err => {
                console.log(err)
                return status.createErrorResponse(500, 'Could not find flagged comments')
            })
        }
    )
}