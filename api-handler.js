'use strict';
const axios = require('axios')
const User = require('xintern-commons/models/User')

const TEST_KEY = process.env.TEST_KEY

//--------------- FUNCTIONS ---------------

//Returns a success response
const sendOKResponse = (body) => {
  return {
    statusCode: 200,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  }
}

//Returns an error response
const sendErrorResponse = (statusCode, errorMessage) => {
  console.error('sendErrorRepsonse: console logging error msg:\n', errorMessage)
  return { 
    statusCode: statusCode, 
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: errorMessage })
  }
}

//--------------- LAMBDA FUNCTIONS ---------------

module.exports.hello = async (event) => {
  console.log("how tokens/secrets will be stored in serverless:", TEST_KEY)
  let newUser = User({
    username: "test-user",
    name: "coop kid",
    sex: "M",
    school: "uOttawa",
    program: "SEG",
    age: "22",
    createdAt: new Date()
  })
  console.log('created new user:\n', newUser)
  return sendOKResponse(`how tokens/secrets will be stored in serverless: ${TEST_KEY}`)
};

// {
//   _id: mongoose.Schema.Types.ObjectId,
//   createdAt: { type: mongoose.Schema.Types.Date, required: true },
//   deletedAt: { type: mongoose.Schema.Types.Date, default: null },
//   username: { type: String },
//   name: { type: String },
//   sex: { type: String },
//   photo: { type: String },
//   school: { type: String },
//   program: { type: String },
//   age: { type: Number },
//   isShowInfo: { type: mongoose.Schema.Types.Boolean, default: true }
// }