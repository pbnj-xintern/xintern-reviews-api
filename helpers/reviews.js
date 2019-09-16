const Review = require('@pbnj-xintern/xintern-commons/models/Review')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const db = require('@pbnj-xintern/xintern-commons/util/db')
const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL

module.exports.createReview = (event) => {
    console.log('---------- i am in the helper fn ----------')
    let payload = event.body
  
    //Create Rating object

    //Check if Company obj exists, if not create Company obj

    //Use the generated id's of the two Objs for the Review obj
    
    //grab properties from event param
    let newReview = Review({
        _id: new mongoose.Types.ObjectId(),
        salary: payload.salary,
        content: payload.content,
        rating: payload.rating_id,
        position: payload.position,
        user: payload.user_id,
        company: payload.company_id,
        upvotes: [],
        downvotes: [],
        comments: []
    })

    db(MONGO_URL, () => {
        newReview.save().catch(err => {
            console.log('caught err when trying to save Review to db\n')
            console.error(err.message)
        })
    }).then(result => {
        console.log('review created:\n', result)
        return Status.createSuccessResponse(201, "Review successfully created.")
    })
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