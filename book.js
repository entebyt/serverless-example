'use strict';

const dbjs = require('./db.js');
const {
	default: { statusCodes, messages }
} = require('./constants');
module.exports.books = async (event, context) => {
	const db = await dbjs.get();
	return db
		.collection('books')
		.find()
		.toArray()
		.then(response => {
			return {
				statusCode: statusCodes.SUCCESS,
				headers: {
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
				},
				body: JSON.stringify({ books: response, status: statusCodes.SUCCESS })
			};
		})
		.catch(err => {
			console.log('=> an error occurred: ', err);
			return { statusCode: statusCodes.INTERNAL_SERVER_ERROR, body: err };
		});
};
