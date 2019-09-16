const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const dbExec = require('@pbnj-xintern/xintern-commons/util/db')
const status = require('@pbnj-xintern/xintern-commons/util/status')
const dbUrl = process.env.MONGO_URL;

module.exports.getFlaggedReviews = async () => {
    let b = await dbExec(
        dbUrl,
        () => {
            return Review.find({ flagged: true }).exec((err, reviews) => {
                if (err) {
                    console.log(err)
                    return status.createErrorResponse(500, 'Could not find flagged reviews')
                }
                return status.createSuccessResponse(200, reviews)
            })
        }
    )
    return b
}