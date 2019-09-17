const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const db = require('@pbnj-xintern/xintern-commons/util/db')

const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

//--------------- FUNCTIONS ---------------

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

const findCompanyId = async (eventBody) => {
    let newCompany = Company({
        _id: new mongoose.Types.ObjectId(),
        name: eventBody.company,
        logo: "company logo here"
    })
    //if no existing Company found, create new Company and save 
    try { 
        let foundCompany = await db(MONGO_URL, () => {
            return Company.find({ name: eventBody.company.toLowerCase().trim() })
        })
        console.log('Company Found:\n', foundCompany)
        if (foundCompany.length > 0) {
            foundCompany = foundCompany[0]
        } else {
            foundCompany = newCompany
            let result = await db(MONGO_URL, () => {
                return foundCompany.save().catch(err => {
                    console.log('caught err when trying to save new Company to db:\n')
                    console.error(err.message)
                })
            })
            console.log('New Company saved:\n', result)
        }
        return foundCompany._id
    } catch (err) {
        console.error('caught err while trying to find Company:\n', err.message)
    }
}   

// const findReviewId = async (eventBody) => {
//     try {
//         let foundReview = await db(MONGO_URL, () => {
//             return Review.find({
//                 _id: eventBody.review_id
//             })
//         })
//         console.log('foundReview:\n', foundReview)
//         return foundReview[0]._id
//     } catch (err) {
//         console.error('review does not exist:\n', err.message)
//     }
// }

// const findRatingId = async (eventBody) => {
//     try {
//         let foundRating = await db(MONGO_URL, () => {
//             return Rating.find({
//                 _id: eventBody.rating_id
//             })
//         })
//         console.log('foundRating:\n', foundRating)
//         return foundRating[0]._id
//     } catch (err) {
//         console.error('rating does not exist:\n', err.message)
//     }
// }

const getReviewById = async (eventBody) => {
    try {
        let foundReview = await db(MONGO_URL, () => {
            return Review.find({
                _id: eventBody.review_id
            })
        })
        console.log('foundReview:\n', foundReview)
        return foundReview[0]
    } catch (err) {
        console.error('review does not exist:\n', err.message)
    }
}

const getRatingById = async (eventBody) => {
    try {
        let foundRating = await db(MONGO_URL, () => {
            return Rating.find({
                _id: eventBody.rating_id
            })
        })
        console.log('foundRating:\n', foundRating)
        return foundRating[0]
    } catch (err) {
        console.error('rating does not exist:\n', err.message)
    }
}


//--------------- EXPORTED FUNCTIONS ---------------

module.exports.createReview = async (payload) => {
    console.log('payload:\n', payload)
    //Find User
    let foundUserId = await findUserId(payload)
    console.log('foundUserId:\n', foundUserId)
    //Create Rating object and add to db
    let newRatingId = await createRatingAndSave(payload)
    console.log('newRatingId:\n', newRatingId)
    //Check if Company obj exists, if not create Company obj
    let foundCompanyId = await findCompanyId(payload)
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
            return newReview.save().catch(err => {
                console.log('caught err when trying to save Review to db:\n')
                console.error(err.message)
            })
        })
        console.log('Review Created:\n', result)
        return Status.createSuccessResponse(201, { message: "Review successfully created." })
    } catch (err) {
        console.error('caught err while trying to create Review to db:\n', err.message)
    }
}

module.exports.updateReview = async (payload) => {
    console.log('payload:\n', payload)
    //get Review to update
    let foundReview = await getReviewById(payload)
    //get Rating to update
    let foundRating = await getRatingById(payload)

    //find Company
    //if user enters new company name, check new company name against db. If not exist, add into db 
    let foundCompanyId = await findCompanyId(payload)
    console.log('foundReview:\n', foundReview)
    console.log('foundRating:\n', foundRating)

    let { salary, content, position, ...otherFields } = foundReview

}