'use strict';
const axios = require('axios')
const mongoose = require('mongoose')
const Review = require('xintern-commons/models/Review')
const Status = require('')

const TEST_KEY = process.env.TEST_KEY

//--------------- LAMBDA FUNCTIONS ---------------

module.exports.createReview = async (event) => {
  let data = event.body
  // let author = //grab User obj from event/context

  //grab properties from event param
  let newReview = Review({
    salary: data.salary,
    content: data.content,
    position: data.position
    // user: //User
  })
  try {
    //send newReview obj to db
    return sendOKResponse(201, 'Review successfully created!')
  } catch (err) {
    console.error('caught error:', err.message)
    return sendErrorResponse(400, err.message)
  }
};

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