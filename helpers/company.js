const Company = require('@pbnj-xintern/xintern-commons/models/Company')
const db = require('@pbnj-xintern/xintern-commons/util/db')
const Status = require('@pbnj-xintern/xintern-commons/util/status')
const MONGO_URL = process.env.MONGO_URL

// being used
const findCompanyByName = async (eventBody) => {
    try {
        let foundCompany = await db.exec(MONGO_URL, () => {
            return Company.find({ name: eventBody.company_name })
        })
        console.log('Company Found:\n', foundCompany)
        return foundCompany
    } catch (err) {
        console.error('caught err while trying to find Company:\n', err.message)
        return Status.createErrorResponse(500, "Company does not exist.")
    }
}

const findCompanyByNameAndLocation = async (companyName, location) => {	//being used
    try {	module.exports.findCompanyByName = findCompanyByName; 
        let foundCompany = await db.exec(MONGO_URL, () => {	
            return Company.find({ name: companyName, location: location })	
        })	
        console.log('Company Found:\n', foundCompany)	
        return foundCompany[0]	
    } catch (err) {	
        console.error('caught err while trying to find Company:\n', err.message)	
        return Status.createErrorResponse(404, "Company does not exist.")	
    }	
}

//being used
module.exports.findCompanyByName = findCompanyByName;
module.exports.findCompanyByNameAndLocation = findCompanyByNameAndLocation;