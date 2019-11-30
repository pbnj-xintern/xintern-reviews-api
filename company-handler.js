'use strict';
const CompanyHelper = require('./helpers/company')
const TOKEN_SECRET = process.env.TOKEN_SECRET
const AuthHelper = require('@pbnj-xintern/xintern-commons/util/auth_checker')
const middy = require('middy')
const Status = require('@pbnj-xintern/xintern-commons/util/status')

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

module.exports.getCompaniesByName = async event => {
	let companyName = event.pathParameters.company_name;
	if (!companyName)
		return Status.createErrorResponse(400, 'Company name not specified')
	let results = await CompanyHelper.getCompanyArrByName(companyName)
	if (!results)
		return Status.createErrorResponse(500, 'Could not find companies with specified name')

	return Status.createSuccessResponse(200, results)
}