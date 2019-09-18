const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
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

//Checks if Company exists in db by name. Returns company ID 
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

//Finds company by Id. Returns Company obj
const findCompanyById = async (companyId, eventBody) => {
    let newCompany = Company({
        _id: new mongoose.Types.ObjectId(),
        name: eventBody.company_name,
        logo: "company logo here"
    })
    try { 
        let foundCompany = await db(MONGO_URL, () => {
            return Company.find({ _id: companyId })
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
            console.log('New Company created and saved:\n', result)
            // return Status.createErrorResponse(404, "Company does not exist.")
        }
        return foundCompany
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

// const getRatingById = async (ratingId) => {
//     try {
//         let foundRating = await db(MONGO_URL, () => {
//             return Rating.find({
//                 _id: ratingId
//             })
//         })
//         console.log('foundRating:\n', foundRating)
//         return foundRating[0]
//     } catch (err) {
//         console.error('rating does not exist:\n', err.message)
//     }
// }

//----------- make into endpoints ----------- //
const updateRating = (ratingId, payload) => {
    try {
        return Rating.findByIdAndUpdate(ratingId, {
            culture: payload.culture,
            mentorship: payload.mentorship,
            impact: payload.impact,
            interview: payload.interview
        })
    } catch (err) {
        console.error('rating does not exist:\n', err.message)
    }
}
const updateCompany = async (companyId, payload) => {
    try {
        return await Company.findByIdAndUpdate(companyId, {
            name: payload.company_name,
            logo: payload.company_logo
        })
    } catch (err) {
        console.error('company does not exist:\n', err.message)
    }
}
const updateReview = async (reviewId, payload) => {
    try {
        return await Review.findByIdAndUpdate(reviewId, {
            salary: payload.salary,
            content: payload.content,
            position: payload.position
        })
    } catch (err) {
        console.error('review does not exist:\n', err.message)
    }
}
//----------- make into endpoints ----------- //

//Returns an updated review obj
const updateReviewFields = async (foundReview, payload) => {
    //update rating-related fields
    let updateRatingResult = await updateRating(foundReview.rating._id, payload)
    console.log('updateRatingResult:\n', updateRatingResult)
    //update company-related fields
    let updateCompanyResult = await updateCompany(foundReview.company._id, payload)
    console.log('updateCompanyResult:\n', updateCompanyResult)
    //update review-related fields
    return await updateReview(foundReview._id, payload)
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
    let foundCompany = await findCompanyByName(payload)
    console.log('foundCompanyId:\n', foundCompanyId)
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
        return Status.createSuccessResponse(201, { message: "Review successfully created." })
    } catch (err) {
        console.error('caught err while trying to create Review to db:\n', err.message)
    }
}

module.exports.updateReview = async (reviewId, payload) => {
    console.log('reviewId:\n', reviewId)
    //get Review to update
    let foundReview = await getReviewById(reviewId)
    console.log('foundReview:\n', foundReview)
    //update
    let updateReviewResult = await updateReviewFields(foundReview, payload)
    if (updateReviewResult) return Status.createSuccessResponse(200, { message: "Reviewed updated." })
}