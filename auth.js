'use strict';

const dbjs = require('./db.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mail = require('./mail');
const {
	default: { statusCodes, messages }
} = require('../constants');
module.exports.login = async (event, context) => {
	const db = await dbjs.get();

	// user email
	let email = event.body.email;

	// user password
	let password = event.body.password;

	const user = await db.collection('users').findOne({ email });
	if (user) {
		try {
			// salt user password
			const salt = crypto.randomBytes(16).toString('hex');

			//hashing user password
			const hash = crypto
				.pbkdf2Sync(password, salt, 1000, 64, `sha512`)
				.toString(`hex`);
			if (user.password === hash) {
				// current time
				var now = new Date();
				now.setTime(+date + 365 / 86400000);

				//create jwt token
				const token = jwt.sign({ user: user.username }, 'secret_key');
				var cookieString =
					'authcookie=' +
					token +
					'; domain=my.domain; expires=' +
					now.toGMTString() +
					';';

				//save token in cookie
				context.done(null, { Cookie: cookieString });
				return {
					statusCode: statusCodes.SUCCESS,
					body: JSON.stringify({ message: 'Success' })
				};
			} else {
				return {
					statusCode: statusCodes.BAD_REQUEST,
					body: JSON.stringify({ message: 'Username or password is incorrect' })
				};
			}
		} catch {
			return {
				statusCode: statusCodes.BAD_REQUEST,
				body: JSON.stringify({ message: messages.BAD_REQUEST })
			};
		}
	} else {
		return {
			statusCode: statusCodes.UNAUTHORIZED,
			body: JSON.stringify({ message: 'User not found' })
		};
	}

	// Use this code if you don't use the http event with the LAMBDA-PROXY integration
	// return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
module.exports.signup = async (event, context) => {
	// user email
	let email = event.body.email;

	// user password
	let password = event.body.password;

	const userCollection = db.collection('users');
	const user = await userCollection.findOne({ email });

	if (!user) {
		try {
			// salt user password
			const salt = crypto.randomBytes(16).toString('hex');

			//hashing user password
			const hash = crypto
				.pbkdf2Sync(password, salt, 1000, 64, `sha512`)
				.toString(`hex`);

			const newUser = {
				name: event.body.name,
				email,
				password: hash,
				username: event.body.username
			};
			// create a user in database
			await userCollection.insert(newUser);

			// create new token
			const token = jwt.sign({ user: event.body.username }, 'secret_key');
			var cookieString =
				'authcookie=' +
				token +
				'; domain=my.domain; expires=' +
				now.toGMTString() +
				';';

			//save token in cookie
			context.done(null, { Cookie: cookieString });
			return {
				statusCode: statusCodes.SUCCESS,
				body: JSON.stringify({ message: 'Success', content: newUser })
			};
		} catch {
			return {
				statusCode: statusCodes.BAD_REQUEST,
				body: JSON.stringify({ message: messages.BAD_REQUEST })
			};
		}
	} else {
		return {
			statusCode: statusCodes.BAD_REQUEST,
			body: JSON.stringify({ message: 'User already exists' })
		};
	}
};

module.exports.forgotpassword = async event => {
	// user email
	let email = event.body.email;

	const userCollection = db.collection('users');
	const user = await userCollection.findOne({ email });
	if (user) {
		try {
			const token = jwt.sign({ user: user.username }, 'secret_key');
			const resetPasswordUrl = `/api/forgot-password/${token}`;
			// html body
			const html =
				'<br>Dear user,<br>You have requested to reset your login password. Here is your password reset link:' +
				`<a href=${resetPasswordUrl}>Password reset link</a><br>` +
				'<br>Please use this to reset your password and login.<br>';
			await mail.sendMail({ to: email, subject: 'Forgot Password', html });
		} catch {
			return {
				statusCode: statusCodes.BAD_REQUEST,
				body: JSON.stringify({ message: messages.BAD_REQUEST })
			};
		}
	} else {
		return {
			statusCode: statusCodes.UNAUTHORIZED,
			body: JSON.stringify({ message: 'User not found' })
		};
	}
};
module.exports.validateToken = async event => {
	const user = await validate(event.pathParameters.token);
	if (user) {
		try {
			return {
				statusCode: statusCodes.SUCCESS,
				body: JSON.stringify({
					message: 'Success',
					content: { token: event.pathParameters.token }
				})
			};
		} catch {
			return {
				statusCode: statusCodes.BAD_REQUEST,
				body: JSON.stringify({ message: messages.BAD_REQUEST })
			};
		}
	} else {
		return {
			statusCode: statusCodes.UNAUTHORIZED,
			body: JSON.stringify({ message: 'Incorrect token' })
		};
	}
};
async function validate(token) {
	const userCollection = db.collection('users');
	const decodedToken = jwt.decode(token, 'secret_key');
	const user = await userCollection.findOne({
		username: decodedToken.username
	});
	return user;
}
module.exports.resetpassword = async event => {
	const password = event.body.password;
	const user = await validate(event.body.token);

	if (user) {
		const salt = crypto.randomBytes(16).toString('hex');

		//hashing user password
		const hash = crypto
			.pbkdf2Sync(password, salt, 1000, 64, `sha512`)
			.toString(`hex`);
		db.collection('users').findOneAndUpdate(
			{ username: user.username },
			{ password: hash }
		);
		try {
		} catch {}
	} else {
		return {
			statusCode: statusCodes.UNAUTHORIZED,
			body: JSON.stringify({ message: 'Invalid token' })
		};
	}
};
