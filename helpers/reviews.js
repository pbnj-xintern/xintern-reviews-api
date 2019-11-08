const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const User = require('@pbnj-xintern/xintern-commons/models/User')
const Rating = require('@pbnj-xintern/xintern-commons/models/Rating')
const Comment = require('@pbnj-xintern/xintern-commons/models/Comment')
const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const RequestChecker = require('@pbnj-xintern/xintern-commons/util/request_checker')
const db = require('@pbnj-xintern/xintern-commons/util/db')
const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL



//--------------- FUNCTIONS ---------------

//Returns user ID
const findUserId = async (eventBody) => {
    try {
        let foundUser = await db.exec(MONGO_URL, () => {
            return User.find({
                _id: eventBody.user_id
            })
        })
        console.log('foundUser:\n', foundUser)
        return (foundUser[0]._id) ? foundUser[0]._id : null
    } catch (err) {
        console.error('user does not exist:\n', err.message)
        return null
    }
}

//Returns Company obj 
const findCompanyByName = async (eventBody) => {
    try {
        let foundCompany = await db.exec(MONGO_URL, () => {
            return Company.find({ name: eventBody.company_name.toLowerCase().trim() })
        })
        console.log('Company Found:\n', foundCompany)
        if (foundCompany.length > 0) {
            foundCompany = foundCompany[0]
        } else {
            return Status.createErrorResponse(404, "Company does not exist.")
        }
        return foundCompany
    } catch (err) {
        console.error('caught err while trying to find Company:\n', err.message)
        return null
    }
}

//Returns Company obj 
const findCompanyById = async (companyId) => {
    try { 
        let foundCompany = await db.exec(MONGO_URL, () => {
            return Company.find({ _id: companyId })
        })
        console.log('Company Found:\n', foundCompany)
        if (foundCompany.length > 0) {
            foundCompany = foundCompany[0]
        } else {
            return null
        }
        return foundCompany
    } catch (err) {
        console.error('caught err while trying to find Company:\n', err.message)
    }
}   

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

const addCommentToReview = async (reviewId, commentId) => {
    try {
        //grab existing comments from review obj
        let review = await getReviewById(reviewId)
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
            return Comment.find({review:reviewId}).populate('author')
        })
        return comments
    } catch (err) {
        console.error('get all comments caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
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

const userListsInReview = async id => {
    return db.exec(
        MONGO_URL,
        () => Review.find({ _id: id })
            .select('upvotes downvotes flagged')
            .then(reviews => {
                if (!reviews || reviews.length === 0) {
                    console.error('Could not find reviews with id', id)
                    return null
                }
                return {
                    upvotes: reviews[0].upvotes || [],
                    downvotes: reviews[0].downvotes || []
                }
            })
            .catch(err => {
                err.message ? console.error(err.message) : console.error(err)
                return null;
            })
    )
}

const userListsInComemnts = async id => {
    return db(
        MONGO_URL,
        () => Review.find({ _id: id })
            .select('upvotes downvotes flagged')
            .then(reviews => {
                if (!reviews || reviews.length === 0) {
                    console.error('Could not find comments with id', id)
                    return null
                }
                return {
                    upvotes: reviews[0].upvotes || [],
                    downvotes: reviews[0].downvotes || []
                }
            })
            .catch(err => {
                err.message ? console.error(err.message) : console.error(err)
                return null;
            })
    )
}

const getVotingLists = async (id, schema) => {
    return db(
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

// be cautious when using this !
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

//--------------- EXPORTED FUNCTIONS ---------------

//013_FEAT_CRUD-REVIEW
//createReview 1.0
module.exports.createReview = async (payload) => {
    console.log('payload:\n', payload)
    let foundUserId = await findUserId(payload)
    if (foundUserId === null) return Status.createErrorResponse(404, "User not found.")
    let ratingId = await createRating(payload)
    if (ratingId === null) return Status.createErrorResponse(400, "Rating could not be created.")
    let foundCompany = await findCompanyByName(payload)
    if (foundCompany.statusCode || foundCompany === null) return Status.createErrorResponse(404, "Could not find Company.")
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
        currency: payload.currency
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
                position: payload.position
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
//updateReview 2.3
module.exports.updateCompany = async (companyId, payload) => {
    let payloadIsValid = await RequestChecker(payload, Company)
    if (!payloadIsValid) return Status.createErrorResponse(400, "payload does not match model.")
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Company.findByIdAndUpdate(companyId, { //company _id
                name: payload.name,
                logo: payload.logo,
                location: payload.location
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
        return Status.createErrorResponse(400, err.message)
    }
}

//deleteReview
module.exports.deleteReview = async (reviewId) => {
    try {
        let reviewRatingId = await db.exec(MONGO_URL, () => Review.find({ _id: reviewId }).select('rating'))
        let deleteRatingResults = await deleteRating(reviewRatingId)
        if (deleteRatingResults.OKmessage) console.log(deleteRatingResults)
        let deleteCommentResults = await deleteAllComments(reviewId)
        if (deleteCommentResults.OKmessage) console.log(deleteCommentResults)

        let result = await db.exec(MONGO_URL, () => {
            return Review.findOneAndDelete({
                _id: reviewId
            })
        })
        if (result)
            console.log('Deleted Review obj:\n', result)
        return Status.createSuccessResponse(200, {
            review_id: reviewId,
            message: "Review successfully DELETED."
        })
    } catch (err) {
        console.error('delete review caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

//014_FEAT_CRUD_COMMENT
//createComment + link to Review
module.exports.createComment = async (reviewId, payload) => {
    let newComment = Comment({
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


module.exports.getTopCompanies = async () => {
    let allReviews = null
    try{
        allReviews = await db.exec('mongodb+srv://bond:bondyan@cluster0-am7uh.mongodb.net/test?retryWrites=true&w=majority', () => {
            return Review.find({}).populate('company');
        });
        let companyMap = {}; 
        allReviews.forEach(review => {
            if(review.company){
                companyMap[review.company.name] = review.company;
            }
        })
        let counter = {};
        allReviews.forEach(review => {
            if(review.company){
                let company_name = review.company.name;
                counter[company_name] = counter[company_name] ? ++counter[company_name] : 1;
            }
        })
        let companyList = []
        Object.keys(counter).forEach(key => {
            companyList.push({
                _id: companyMap[key]._id,
                name: companyMap[key].name,
                count: counter[key],
                logo: companyMap[key].logo
            })
        })

        companyList.sort((a,b) => {
            return b.count - a.count;
        })
        if (companyList.length >= 12){
            return Status.createSuccessResponse(200,companyList.slice(0,12));
        }
        return Status.createSuccessResponse(200, companyList);
        

    }catch(err){
        console.log(err.msg);
        return Status.createErrorResponse(400, 'Could not fetch top companies');
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

module.exports.genericUpvoteOrDownvote = async (schema_id, user_id, type, schema) => {

    if (type !== 'upvotes' && type !== 'downvotes')
        return Status.createErrorResponse(400, 'Missing a field')

    let oppositeType = type === 'upvotes' ? 'downvotes' : 'upvotes'
    let votingLists = await getVotingLists(schema_id, schema)
    let foundUserId = await findUserId({ user_id: user_id })

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
module.exports.addCompany = async (payload) => {
    let newCompany = new Company({
        _id: new mongoose.Types.ObjectId(),
        name: payload.name,
        logo: payload.logo,
        location: payload.location
    })
    try {
        let result = await db.exec(MONGO_URL, () => {
            return newCompany.save()
        })
        if (!result._id || result === null) return Status.createErrorResponse(400, "Company could not be created.")
        return Status.createSuccessResponse(201, {
            company_id: newCompany._id,
            message: "Company successfully CREATED."
        })
    } catch (err) {
        console.error('create company caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.deleteCompany = async (companyId) => {
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Company.findOneAndDelete({
                _id: companyId
            })
        })
        if (result._id) {
            console.log('Deleted Company obj:\n', result)
            return Status.createSuccessResponse(200, { 
                company_id: companyId,
                message: "Company successfully DELETED." 
            })
        } else {
            return Status.createErrorResponse(404, "Could not delete company.")
        }
    } catch (err) {
        console.error('delete company caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.getReviewsByCompany = async (companyId) => {
    try {
        let validCompany = await findCompanyById(companyId)
        if (validCompany == null) return Status.createErrorResponse(404, "Company does not exist.")
        let result = await db.exec(MONGO_URL, () => {
            return Review.find({ company: companyId }).populate('company rating user')
        })
        if (result.length == 0) return Status.createErrorResponse(404, "Company does not exist.")
        result = result.reverse() //sorts by most recent
        return Status.createSuccessResponse(200, result)
    } catch (err) {
        console.error('get company reviews caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.getRecentReviews = async () => {
    try {
        let result = await db.exec('mongodb+srv://bond:bondyan@cluster0-am7uh.mongodb.net/test?retryWrites=true&w=majority', () => {

            return Review.find().populate("company rating user")
        })
        if (result.length === 0) return Status.createErrorResponse(404, "No recent Reviews.")
        result = result.filter((review, i, arr) => {
            return review.company !== null
        })
        let sortedResult = result.sort((a, b) => {
            return (a.createdAt < b.createdAt) ? 1 : -1 //most recent to least recent
        })
        return Status.createSuccessResponse(200, sortedResult.splice(0, 10))
    } catch (err) {
        console.error('get recent reviews caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.getAllCompanies = async () => {
    try {
        let result = await db.exec(MONGO_URL, () => {
            return Company.find()
        })
        if (result.length === 0) return Status.createErrorResponse(404, "No Companies found.")
        result = result.filter((company, i, arr) => {
            return i === arr.findIndex((c => {
                return c.name === company.name
            }))
        })
        result.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0))
        return Status.createSuccessResponse(200, result)
    } catch (err) {
        console.error('get recent reviews caught error:', err.message)
        return Status.createErrorResponse(400, err.message)
    }
}

module.exports.getPopulatedComments = async reviewId =>{
    try{
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
    catch(err){
        return Status.createErrorResponse(400, "Unable to populate comments")
    }
}
module.exports.getReviewById = getReviewById