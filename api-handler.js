'use strict';

const TEST_KEY = process.env.TEST_KEY

module.exports.hello = async (event) => {
  console.log("how tokens/secrets will be stored in serverless:", TEST_KEY)
};
