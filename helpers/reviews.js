const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const db = require('@pbnj-xintern/xintern-commons/util/db')

const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

//--------------- FUNCTIONS ---------------

const findUser = async (eventBody) => {
    try {
        let foundUser = await User.findById(eventBody.user_id)
        foundUser = (foundUser.length > 0) ? foundUser[0] : console.error('user does not exist.')
        return foundUser._id
    } catch (err) {
        console.error('caught err while trying to find user in db:\n', err.message)
    }
}

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
            newRating.save().catch(err => {
                console.log('caught err when trying to save Rating to db (inner):\n')
                console.error(err.message)
            })
        })
        console.log('New Rating Created:\n', result)
        return newRating._id
    } catch (err) {
        console.error('caught err while trying to save Rating to db:\n', err.message)
    }
}

const findCompany = async (eventBody) => {
    let newCompany = Company({
        _id: new mongoose.Types.ObjectId(),
        name: eventBody.company,
        logo: "company logo here"
    })
    //if no existing Company found, create new Company and save 
    try { 
        let foundCompany = await Company.find({ name: eventBody.company.toLowerCase().trim() })
        foundCompany = (foundCompany.length > 0) ? foundCompany[0] : newCompany
        return (foundCompany.length > 0) ? foundCompany[0]._id : newCompany._id
    } catch (err) {
        console.error('caught err while trying to find Company:\n', err.message)
    }
}   

//--------------- EXPORTED FUNCTIONS ---------------

module.exports.createReview = async (event) => {
    console.log('---------- i am in the helper fn ----------')
    let payload = event.body
    console.log('payload:\n', payload)
    //Find User
    let foundUserId = await findUser(payload)
    console.log('foundUserId:\n', foundUserId)
    //Create Rating object and add to db
    let newRatingId = await createRatingAndSave(payload)
    console.log('newRatingId:\n', newRatingId)
    //Check if Company obj exists, if not create Company obj
    let foundCompanyId = await findCompany(payload)
    console.log('foundCompanyId:\n', foundCompanyId)
    //Create new Review and save
    let newReview = Review({
        _id: new mongoose.Types.ObjectId(),
        salary: payload.salary,
        content: payload.content,
        rating: newRatingId,
        position: payload.position,
        user: foundUserId,
        company: foundCompanyId,
        upvotes: [],
        downvotes: [],
        comments: []
    })
    try {
        let result = await db(MONGO_URL, () => {
            newReview.save().catch(err => {
                console.log('caught err when trying to save Review to db (inner):\n')
                console.error(err.message)
            })
        })
        console.log('Review Created:\n', result)
        return Status.createSuccessResponse(201, "Review successfully created.")
    } catch (err) {
        console.error('caught err while trying to save Review to db:\n', err.message)
    }
}