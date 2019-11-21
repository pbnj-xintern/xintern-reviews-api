const User = require('@pbnj-xintern/xintern-commons/models/User')
const db = require('@pbnj-xintern/xintern-commons/util/db')

const MONGO_URL = process.env.MONGO_URL

//Returns user ID
module.exports.findUserId = async (eventBody) => {
    try {
        let foundUser = await db.exec(MONGO_URL, () => {
            return User.find({
                _id: eventBody.user_id
            })
        })
        console.log('foundUser:\n', foundUser)
        return (foundUser[0]._id) ? foundUser[0]._id : null
    } catch (err) {
        console.error('user does not exist:\n', err.message)
        return null
    }
}