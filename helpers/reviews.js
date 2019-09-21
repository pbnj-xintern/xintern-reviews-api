const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const Comment = require('@pbnj-xintern/xintern-commons/models/Comment')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const db = require('@pbnj-xintern/xintern-commons/util/db')

const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

//--------------- FUNCTIONS ---------------

//Returns user ID
const findUserId = async (eventBody) => {
    try {
        let foundUser = await db(MONGO_URL, () => {
            return User.find({
                _id: eventBody.user_id
            })
        })
        console.log('foundUser:\n', foundUser)
        return foundUser[0]._id
    } catch (err) {
        console.error('user does not exist:\n', err.message)
    }
}

//Creates a new Rating obj and saves to db. Returns rating ID
const createRatingAndSave = async (eventBody) => {
    let newRating = Rating({
        _id: new mongoose.Types.ObjectId(),
        culture: eventBody.culture,
        mentorship: eventBody.mentorship,
        impact: eventBody.impact,
        interview: eventBody.interview
    })
    try {
        let result = await db(MONGO_URL, () => {
            return newRating.save().catch(err => {
                console.log('caught err when trying to save Rating to db:\n')
                console.error(err.message)
            })
        })
        console.log('New Rating Created:\n', result)
        return newRating._id
    } catch (err) {
        console.error('caught err while trying to save Rating to db:\n', err.message)
    }
}

//Returns Company obj 
const findCompanyByName = async (eventBody) => {
    // let newCompany = Company({
    //     _id: new mongoose.Types.ObjectId(),
    //     name: eventBody.company,
    //     logo: "company logo here"
    // })
    try { 
        let foundCompany = await db(MONGO_URL, () => {
            return Company.find({ name: eventBody.company_name.toLowerCase().trim() })
        })
        console.log('Company Found:\n', foundCompany)
        if (foundCompany.length > 0) {
            foundCompany = foundCompany[0]
        } else {
            // foundCompany = newCompany
            // let result = await db(MONGO_URL, () => {
            //     return foundCompany.save().catch(err => {
            //         console.log('caught err when trying to save new Company to db:\n')
            //         console.error(err.message)
            //     })
            // })
            // console.log('New Company saved:\n', result)
            return Status.createErrorResponse(404, "Company does not exist.")
        }
        return foundCompany
    } catch (err) {
        console.error('caught err while trying to find Company:\n', err.message)
    }
}   

//Returns a Review obj
const getReviewById = async (reviewId) => {
    try {
        let foundReview = await db(MONGO_URL, () => {
            return Review.find({ _id: reviewId }).populate("rating user company")
        })
        console.log('foundReview:\n', foundReview)
        return foundReview[0]
    } catch (err) {
        console.error('review does not exist:\n', err.message)
    }
}

//--------------- EXPORTED FUNCTIONS ---------------

module.exports.createReview = async (payload) => {
    console.log('payload:\n', payload)
    let foundUserId = await findUserId(payload) //find user
    console.log('foundUserId:\n', foundUserId)
    let newRatingId = await createRatingAndSave(payload) //create Rating & add to db
    console.log('newRatingId:\n', newRatingId)
    let foundCompany = await findCompanyByName(payload) //create Company if not exist
    console.log('foundCompany:\n', foundCompany)
    //Create new Review and save
    let newReview = Review({
        _id: new mongoose.Types.ObjectId(),
        salary: payload.salary,
        content: payload.content,
        rating: newRatingId,
        position: payload.position,
        user: foundUserId,
        company: foundCompany._id,
        upvotes: [],
        downvotes: [],
        comments: []
    })
    try {
        let result = await db(MONGO_URL, () => {
            return newReview.save().catch(err => {
                console.error('caught err when trying to save to db:\n', err.message)
            })
        })
        console.log('createReview save status:\n', result)
        return Status.createSuccessResponse(201, { 
            review_id: newReview._id,
            message: "Review successfully CREATED." 
        })
    } catch (err) {
        console.error('caught err while trying to create Review to db:\n', err.message)
    }
}

module.exports.updateReviewFields = async (reviewId, payload) => {
    console.log('reviewId:\n', reviewId)
    let foundReview = await getReviewById(reviewId)
    console.log('foundReview:\n', foundReview)
    try {
        let result = await db(MONGO_URL, () => {
            return Review.findByIdAndUpdate(foundReview._id, {
                salary: payload.salary,
                content: payload.content,
                position: payload.position
            }, { new: true })
        })
        console.log('Updated review obj:\n', result)
        if (result) 
            return Status.createSuccessResponse(200, { 
                review_id: foundReview._id,
                company_id: foundReview.company._id,
                rating_id: foundReview.rating._id,
                message: "Review fields successfully UPDATED." 
            })
    } catch (err) {
        console.error('review does not exist:\n', err.message)
    }
}

module.exports.updateReviewCompany = async (companyId, payload) => {
    try {
      let result = await db(MONGO_URL, () => {
          return Company.findByIdAndUpdate(companyId, { //company _id
              name: payload.name,
              logo: payload.logo
          }, { new: true })
      })
      console.log('Updated Company obj:\n', result)
      if (result)
        return Status.createSuccessResponse(204, { 
            company_id: companyId,
            message: "Company successfully UPDATED." 
        })
    } catch (err) {
        console.error('company does not exist:\n', err.message)
    }
  }

module.exports.updateReviewRating = async (ratingId, payload) => {
    try {
        let result = await db(MONGO_URL, () => {
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
    }
}

//delete rating and comments first, then review
module.exports.deleteReview = async (reviewId) => {
    try {
        let result = await db(MONGO_URL, () => {
            return Review.findOneAndDelete({
                _id: reviewId
            })
        })
        console.log('Deleted Review obj:\n', result)
        if (result) 
            return Status.createSuccessResponse(200, { 
                review_id: reviewId,
                message: "Review successfully DELETED." 
            })
    } catch (err) {
        console.error('delete review caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.deleteRating = async (ratingId) => {
    try {
        let result = await db(MONGO_URL, () => {
            return Rating.findOneAndDelete({
                _id: ratingId
            })
        })
        if (result) 
            return Status.createSuccessResponse(200, { 
                rating_id: ratingId,
                message: "Rating successfully DELETED." 
            })
    } catch (err) {
        console.error('delete rating caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.deleteAllComments = async (payload) => {
    try {
        let result = await db(MONGO_URL, () => {
            return Comment.deleteMany({
                _id: {
                    $in: payload.comments //array of comments
                }
            })
        })
        if (result) 
            return Status.createSuccessResponse(200, { 
                message: "All comments successfully DELETED." 
            })
    } catch (err) {
        console.error('delete all comments caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.deleteComment = async (commentId) => {
    try {
        let result = await db(MONGO_URL, () => {
            return Comment.findOneAndDelete({
                _id: commentId
            })
        })
        if (result) 
            return Status.createSuccessResponse(200, { 
                comment_id: commentId,
                message: "Comment successfully DELETED." 
            })
    } catch (err) {
        console.error('delete comment caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

//update review (add comment to list)
module.exports.createComment = async (payload) => {
    let newComment = Comment({
        _id: new mongoose.Types.ObjectId(),
        content: payload.content,
        upvotes: [],
        downvotes: [],
        parentComment: null
    })
    try {
        let result = await db(MONGO_URL, () => {
            return newComment.save().catch(err => {
                console.error('caught err when trying to save to db:\n', err.message)
            })
        })
        if (result)
            return Status.createSuccessResponse(201, { 
                comment_id: newComment._id,
                message: "Comment successfully CREATED." 
            })
    } catch (err) {
        console.error('create comment caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}