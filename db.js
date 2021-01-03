'use strict';
const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI =
	'mongodb+srv://cmstaginguser:LCAjzpYG1c7G91nH@charitymoments-staging.lq54v.mongodb.net/charitymoment-staging?retryWrites=true&w=majority';
let dbInstance = null;
module.exports.get = async function() {
	if (dbInstance) {
		return Promise.resolve(dbInstance);
	}
	const db = await MongoClient.connect(MONGODB_URI);
	dbInstance = db.db('charitymoment-staging');
	return dbInstance;
};
