'use strict';
const CompanyHelper = require('./helpers/company')
const TOKEN_SECRET = process.env.TOKEN_SECRET
const AuthHelper = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const middy = require('middy')

//--------------- LAMBDA FUNCTIONS ---------------
module.exports.updateCompany = middy(async (event) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	let companyId = event.pathParameters.company_id
	return await CompanyHelper.updateCompany(companyId, payload)
}).use(AuthHelper.verifyJWT(TOKEN_SECRET))

module.exports.addCompany = async (event, context) => {
	let payload = (event.body instanceof Object) ? event.body : JSON.parse(event.body)
	return await CompanyHelper.addCompany(payload)
}

module.exports.deleteCompany = async (event) => {
	return await CompanyHelper.deleteCompany(event.pathParameters.company_id)
}

module.exports.getTopCompanies = async () => {
	return await CompanyHelper.getTopCompanies();
}

module.exports.getAllCompanies = async () => {
	return await CompanyHelper.getAllCompanies()
}

module.exports.getCompanyLocations = async (event) => {
	return await CompanyHelper.getCompanyLocations(event.queryStringParameters.company_name)
}