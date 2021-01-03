import nodemailer from 'nodemailer';

export async function sendMail(mailOpts, callback) {
	var transport = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'divyanshu.chat@gmail.com',
			pass: 'rchtkelljhtwxgby'
		}
	});

	// Setup mail configuration
	var mailOptions = {
		from: 'noreply@charitymoments.com', // sender address
		to: 'email', // list of receivers
		subject: '', // Subject line
		html: '',
		...mailOpts
	};

	// send mail
	transport.sendMail(mailOptions, function(error, info) {
		if (error) {
			callback(constant.FALSE);
			console.log('email sending failed ' + error);
		} else {
			callback(constant.TRUE);
			console.log('Message %s sent: %s', info.messageId, info.response);
		}
		transport.close();
	});
}
