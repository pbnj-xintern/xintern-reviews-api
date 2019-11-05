
const {stub, assert} = require("sinon");

const dbModule = require('../node_modules/@pbnj-xintern/xintern-commons/util/db');
const reviewHelper = require('../helpers/reviews');
const db = stub(dbModule, 'exec');
const reviews = require('./mock/reviews.json')


it("get recent reviews 200", async () => {
  db.returns(['test','test'])
  let result = await reviewHelper.getRecentReviews()
  assert.match(result.statusCode, 200)
});

it("get recent reviews 404", async () => {
  db.returns([])
  let result = await reviewHelper.getRecentReviews()
  assert.match(result.statusCode, 404)
});

it("get top companies 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.name == 'Yext', true);
});

it("get top companies 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});

it("create review 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("create review 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update review 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update review 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get flagged review 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get flagged review 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update company 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update company 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update rating 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update rating 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("delete review 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("delete review 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get populated reviews 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get populated reviews 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("delete comment 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("delete comment 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("create comment 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("create comment 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update comment 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("update comment 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("upvote review 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("downvote review 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("upvote comment 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("downvote comment 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("add company 201", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("delete company 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("add company 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("delete company 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get reviews by company 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get reviews by company 404", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get recent reviews 200", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get recent reviews 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
it("get top companies 400", async () => {
  db.returns(reviews)
  let result = await reviewHelper.getTopCompanies();
  let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
  assert.match(yext.count, 2)
});
