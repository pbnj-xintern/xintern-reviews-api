const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const db = require('@pbnj-xintern/xintern-commons/util/db')

const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

module.exports.createReview = async (event) => {
    console.log('---------- i am in the helper fn ----------')
    let payload = event.body
    //find User
    try {
        let foundUser = await User.findById(payload.user_id)
        foundUser = (foundUser.length > 0) ? foundUser[0] : console.error('user does not exist.')
        let foundUserId = foundUser._id
    } catch (err) {
        console.error('caught err while trying to find user:\n', err.message)
    }
    //Create Rating object and add to db
    let newRating = Rating({
        _id: new mongoose.Types.ObjectId(),
        culture: payload.culture,
        mentorship: payload.mentorship,
        impact: payload.impact,
        interview: payload.interview
    })
    try {
        let result = await db(MONGO_URL, () => {
            newRating.save().catch(err => {
                console.log('caught err when trying to save Rating to db (inner):\n')
                console.error(err.message)
            })
        })
        console.log('rating created:\n', result)
        return Status.createSuccessResponse(201, "Rating successfully created.")
    } catch (err) {
        console.error('caught err while trying to save Rating to db:\n', err.message)
    }
    let newRatingId = newRating._id
    //Check if Company obj exists, if not create Company obj
    let foundCompany = await Company.find({ company: payload.company.toLowerCase().trim() })
    foundCompany = (foundCompany.length > 0) ? {} : {} 

    //grab properties from event param
    let newReview = Review({
        _id: new mongoose.Types.ObjectId(),
        salary: payload.salary,
        content: payload.content,
        rating: newRatingId,
        position: payload.position,
        user: foundUserId,
        company: ,
        upvotes: [],
        downvotes: [],
        comments: []
    })

    let result = await db(MONGO_URL, () => {
        newReview.save().catch(err => {
            console.log('caught err when trying to save Review to db:s\n')
            console.error(err.message)
        })
    })
    console.log('review created:\n', result)
    return Status.createSuccessResponse(201, "Review successfully created.")
}

// Review model
// {
//   _id: mongoose.Schema.Types.ObjectId,

//   createdAt: { type: mongoose.Schema.Types.Date, default: new Date(), required: true },

//   salary: { type: mongoose.Schema.Types.Number, required: true },
//   content: { type: mongoose.Schema.Types.String, required: true },
//   rating: { type: mongoose.Schema.Types.ObjectId, ref: "Rating", required: true },
//   position: { type: mongoose.Schema.Types.String, required: true },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  
//   deleted: { type: mongoose.Schema.Types.Boolean, default: false }, 
//   flagged: { type: mongoose.Schema.Types.Boolean, default: false },
//   upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], //all children
// }