
const { stub, assert } = require("sinon");

const dbModule = require('../node_modules/@pbnj-xintern/xintern-commons/util/db');
const reviewHelper = require('../helpers/reviews');
const User = require('../node_modules/@pbnj-xintern/xintern-commons/models/User')
const auth_checker = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const createReviewEvent = require('./test-events/createReview')
const ReviewApi = require('../api-handler')
const mongoose = require('mongoose')
const userResult = require('./mock-results/user')
const reviewResult = require('./mock-results/review')
const companyResult = require('./mock-results/company')
const commentResult = require('./mock-results/comment')
const createComment = require('./test-events/createComment')
const upvoteReview = require('./test-events/upvoteReview')
let decodeJWT = stub(auth_checker, 'decodeJWT')
decodeJWT.returns(userResult.users[0])
it("create review 201", async () => {
	let db = stub(dbModule, 'exec');
	db.onFirstCall().returns(userResult.users)
	db.onSecondCall().returns(reviewResult.review)
	db.onThirdCall().returns(companyResult.companies)
	
	let result = await ReviewApi.createReview(createReviewEvent)
	assert.match(result.statusCode, 201)
	db.restore()
});


it("create review no bearer 401", async () => {
	let db = stub(dbModule, 'exec');
	let createReviewEventNoHeader = require('./test-events/createReview')
	createReviewEvent.headers.Authorization = null
	db.onFirstCall().returns(userResult.users)
	db.onSecondCall().returns(reviewResult.review)
	db.onThirdCall().returns(companyResult.companies)
	let result = await ReviewApi.createReview(createReviewEventNoHeader)
	assert.match(result.statusCode, 401)
	db.restore()
});

it("create comment 201", async () => {
	let db = stub(dbModule, 'exec');
	db.onFirstCall().returns(commentResult.comment)
	db.onSecondCall().returns([reviewResult.review])
	db.onThirdCall().returns(reviewResult.review)
	let result = await ReviewApi.createComment(createComment)
	assert.match(result.statusCode, 201)
	db.restore()
});

// it("upvote review 201", async () => {//reviewResult.review
// 	let db = stub(dbModule, 'exec');
// 	db.onCall(0).returns({
// 		upvotes: [],
// 		downvotes:[]
// 	})
// 	db.onCall(1).returns(userResult.users)
// 	db.onCall(2).returns(reviewResult.reviews)
// 	db.onCall(3).returns({statusCode: 200})

	
// 	let result = await ReviewApi.upvoteReview(upvoteReview)
// 	assert.match(result.statusCode, 201)
// });




// it("get recent reviews 200", async () => {
//   db.returns(['test','test'])
//   let result = await reviewHelper.getRecentReviews()
//   assert.match(result.statusCode, 200)
// });

// it("get recent reviews 404", async () => {
//   db.returns([])
//   let result = await reviewHelper.getRecentReviews()
//   assert.match(result.statusCode, 404)
// });

// it("get top companies 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.name == 'Yext', true);
// });

// it("get top companies 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });


// it("create review 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update review 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update review 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get flagged review 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get flagged review 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update company 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update company 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update rating 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update rating 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("delete review 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("delete review 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get populated reviews 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get populated reviews 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("delete comment 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("delete comment 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("create comment 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("create comment 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update comment 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("update comment 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("upvote review 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("downvote review 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("upvote comment 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("downvote comment 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("add company 201", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("delete company 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("add company 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("delete company 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get reviews by company 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get reviews by company 404", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get recent reviews 200", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get recent reviews 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
// it("get top companies 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });
