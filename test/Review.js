
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
  assert.match(yext.name, 'Yex')
});

// it("get top companies 400", async () => {
//   db.returns(reviews)
//   let result = await reviewHelper.getTopCompanies();
//   console.log(result)
//   let yext = JSON.parse(result.body).find(el => el.name == 'Yext');
//   assert.match(yext.count, 2)
// });





// getReviewsByCompany 



// moduleWithDependency(1, 2);
