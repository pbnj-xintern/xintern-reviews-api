const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const RequestChecker = require('@pbnj-xintern/xintern-commons/util/request_checker')
const db = require('@pbnj-xintern/xintern-commons/util/db')
const UserHelper = require('./user')
const CompanyHelper = require('./company')
const CommentHelper = require('./comment')
const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

//--------------- FUNCTIONS ---------------
//Returns a Review obj
const getReviewById = async (reviewId) => {
    try {
        let foundReview = await db.exec(MONGO_URL, () => {
            return Review.find({ _id: reviewId }).populate("rating user company")
        })
        console.log('foundReview:\n', foundReview)
        return foundReview[0]
    } catch (err) {
        console.error('review does not exist:\n', err.message)
    }
}

const deleteRating = async (ratingId) => {
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Rating.findOneAndDelete({
                _id: ratingId
            })
        })
        if (result)
            console.log(`Rating successfully DELETED: ${ratingId}`)
        return { OKmessage: `Rating successfully DELETED: ${ratingId}` }
    } catch (err) {
        console.error('delete rating caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}
//Creates a new Rating obj and saves to db. Returns rating ID
const createRating = async (eventBody) => {
    let payloadIsValid = await RequestChecker(eventBody, Rating)
    if (!payloadIsValid) return "payload does not match model."
    let newRating = Rating({
        _id: new mongoose.Types.ObjectId(),
        culture: eventBody.culture,
        mentorship: eventBody.mentorship,
        impact: eventBody.impact,
        interview: eventBody.interview
    })
    try {
        let result = await db.exec(MONGO_URL, () => newRating.save())
        console.log('New Rating Created:\n', result)
        return (result._id) ? newRating._id : null
    } catch (err) {
        console.error('caught err while trying to save Rating to db:\n', err.message)
        return null
    }
}

//--------------- EXPORTED FUNCTIONS ---------------
//createReview 1.0
module.exports.createReview = async (payload) => {
    console.log('payload:\n', payload)
    let foundUserId = await UserHelper.findUserId(payload)
    if (foundUserId === null) return Status.createErrorResponse(404, "User not found.")
    let ratingId = await createRating(payload)
    if (ratingId === null) return Status.createErrorResponse(400, "Rating could not be created.")
    let foundCompany = await CompanyHelper.findCompanyByNameAndLocation(payload.company_name, payload.location)
    if (foundCompany.statusCode || foundCompany.length === 0) return Status.createErrorResponse(404, "Could not find Company.")
    //Create new Review and save
    let newReview = Review({
        _id: new mongoose.Types.ObjectId(),
        salary: payload.salary,
        content: payload.content,
        rating: ratingId,
        position: payload.position,
        user: foundUserId,
        company: foundCompany._id,
        upvotes: [],
        downvotes: [],
        comments: [],
        currency: payload.currency,
        payPeriod: payload.payPeriod
    })
    try {
        let result = await db.exec(MONGO_URL, () => {
            return newReview.save()
        })
        console.log('createReview save status:\n', result)
        return Status.createSuccessResponse(201, {
            review_id: newReview._id,
            message: "Review successfully CREATED."
        })
    } catch (err) {
        console.error('caught err while trying to create Review to db:\n', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

//updateReview 2.1
module.exports.updateReview = async (reviewId, payload) => {
    let payloadIsValid = await RequestChecker(payload, Review)
    if (!payloadIsValid) return Status.createErrorResponse(400, "payload does not match model.")
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Review.findByIdAndUpdate(reviewId, {
                salary: payload.salary,
                currency: payload.currency,
                content: payload.content,
                position: payload.position,
                payPeriod: payload.payPeriod
            }, { new: true })
        })
        console.log('Updated review obj:\n', result)
        if (result)
            return Status.createSuccessResponse(200, {
                review_id: reviewId,
                company_id: result.company._id,
                rating_id: result.rating._id,
                message: "Review fields successfully UPDATED."
            })
    } catch (err) {
        console.error('review does not exist:\n', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

//updateReview 2.2
module.exports.updateRating = async (ratingId, payload) => {
    let payloadIsValid = await RequestChecker(payload, Rating)
    if (!payloadIsValid) return Status.createErrorResponse(400, "payload does not match model.")
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Rating.findByIdAndUpdate(ratingId, { //rating _id
                culture: payload.culture,
                mentorship: payload.mentorship,
                impact: payload.impact,
                interview: payload.interview
            }, { new: true })
        })
        console.log('Updated Rating obj:\n', result)
        if (result)
            return Status.createSuccessResponse(204, {
                rating_id: ratingId,
                message: "Rating successfully UPDATED."
            })
    } catch (err) {
        console.error('rating does not exist:\n', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

//deleteReview
module.exports.deleteReview = async (reviewId) => {
    try {
        let reviewRatingId = await db.exec(MONGO_URL, () => Review.find({ _id: reviewId }).select('rating'))
        let deleteRatingResults = await deleteRating(reviewRatingId)
        if (deleteRatingResults.OKmessage) console.log(deleteRatingResults)
        let deleteCommentResults = await CommentHelper.deleteAllComments(reviewId)
        if (deleteCommentResults.OKmessage) console.log(deleteCommentResults)

        let result = await db.exec(MONGO_URL, () => {
            return Review.findOneAndDelete({
                _id: reviewId
            })
        })
        if (result) {
            console.log('Deleted Review obj:\n', result)
            return Status.createSuccessResponse(200, {
                review_id: reviewId,
                message: "Review successfully DELETED."
            })
        }
    } catch (err) {
        console.error('delete review caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.getFlaggedReviews = () => {
    return db.exec(
        MONGO_URL,
        () => {
            return Review.find({ flagged: true }).then(reviews => {
                return Status.createSuccessResponse(200, reviews)
            }).catch(err => {
                console.log(err)
                return Status.createErrorResponse(500, 'Could not find flagged reviews')
            })
        }
    )
}

module.exports.getReviewsByCompany = async (companyName) => {
    try {
        companyName = decodeURIComponent(companyName)
        let company = { company_name: companyName }
        let foundCompanies = await CompanyHelper.findCompanyByName(company)
        let result = await db.exec(MONGO_URL, () => {
            return Review.find({ company: { $in: foundCompanies } }).populate('company rating user').sort({ createdAt: 'desc' })
        })
        if (result.length == 0) return Status.createErrorResponse(500, "Company does not exist.")
        return Status.createSuccessResponse(200, result)
    } catch (err) {
        console.error('get company reviews caught error:', err.message)
        return Status.createErrorResponse(500, err.message)
    }
}

module.exports.getRecentReviews = async () => {
    try {
        let result = await db.exec('mongodb+srv://bond:bondyan@cluster0-am7uh.mongodb.net/test?retryWrites=true&w=majority', () => {
            return Review.find().populate("company rating user").sort({ createdAt: 'desc' }).limit(10)
        })
        if (result.length === 0) return Status.createErrorResponse(500, "No recent Reviews.")
        return Status.createSuccessResponse(200, result)
    } catch (err) {
        console.error('get recent reviews caught error:', err.message)
        return Status.createErrorResponse(500, err.message)
    }
}

module.exports.getReviewById = getReviewById

module.exports.getAllPositions = async () => db.exec(MONGO_URL,
    () =>
        Review.aggregate([
            { $match: {} },
            {
                $group: {
                    _id: '$position',
                    positionName: {$first: '$position'},
                    numReviews: { $sum: 1 }
                }
            }
        ]).sort({ numReviews: 'desc' })
            .catch(e => {
                console.error(e.message || e)
                return false
            })
)

module.exports.getReviewsByPosition = async position => db.exec(MONGO_URL,
    () => Review.find({ position: new RegExp(position.toLowerCase(), "i") })
        .sort({ createdAt: 'desc' })
        .populate('rating user company')
        .limit(20)
        .catch(e => {
            console.error(e.message || e)
            return false
        })
)

module.exports.getUpvotedReviewsByUserId = async userId => {
    return Status.createSuccessResponse(200, await db.exec(MONGO_URL,
        () => Review.find(
            { upvotes: { $all: [userId] } }
        )))
}

module.exports.getDownvotedReviewsByUserId = async userId => {
    return Status.createSuccessResponse(200, await db.exec(MONGO_URL,
        () => Review.find(
            { downvotes: { $all: [userId] } }
        )))
}

module.exports.getReviewsByUsername = async username => {
    try {
        let user = await db.exec(MONGO_URL, 
         () => (
             User.findOne({
                 username : username
             })
         ))
         return Status.createSuccessResponse(200, 
             await db.exec(MONGO_URL, 
                 () => Review.find({user : user._id}).populate('user')))
 
     } catch (err) {
         console.error('unable to fetch reviews', err.message)
         return Status.createErrorResponse(400, err.message)
     }
}

module.exports.getPositionByName = async position => db.exec(MONGO_URL,
    () =>
        Review.aggregate([
            {
                $match: {
                    position: new RegExp(position.toLowerCase(), "i")
                }
            },
            {
                $group: {
                    _id: '$position',
                    positionName: { $first: '$position' },
                    numReviews: { $sum: 1 }
                }
            }
        ])
            .sort({ numReviews: 'desc' })
            .limit(10)
            .catch(e => {
                console.error(e.message || e)
                return false
            })
)

