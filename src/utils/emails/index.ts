import nodemailer from 'nodemailer';

type MailOptionsType = {
	from?: string;
	to: string;
	subject: string;
	html?: string;
	cc?: string;
	bcc?: string;
	text?: string;
};

// Create Transport
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined,
	auth: {
		user: process.env.EMAIL_HOST_USER,
		pass: process.env.EMAIL_HOST_PASS,
	},
});

// Verify Transport
async function verifyTransport() {
	try {
		const success = await transporter.verify();
		if (process.env.NODE_ENV === 'development')
			console.log('Server is ready to take our messages :>> ', success);
		return success
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('EMAIL ERROR. Unable to verify connection :>> ', error);
	}
}

export async function sendMail(
	mailOptions: MailOptionsType,
	options?: {
		onError?: (error: any) => void;
		onSuccess?: (info: any) => void;
	}
) {
	try {
		const verified = await verifyTransport()
		const info = await transporter.sendMail(mailOptions);
		if (process.env.NODE_ENV === 'development')
			console.log('EMAIL SENDING SUCCESS :>> ', info);
		if (options && options.onSuccess) options.onSuccess(info);
		return info;
	} catch (err) {
		if (process.env.NODE_ENV === 'development')
			console.log('EMAIL SENDING ERROR :>> ', err);
		if (options && options.onError) options.onError(err);
	}
}

export default transporter;


/** 
 * Testing Email send unsing Ethreal Email 
 * // Use at least Nodemailer v4.1.0
const nodemailer = require('nodemailer');

// Generate SMTP service account from ethereal.email
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');

    // Create a SMTP transporter object
    const transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			auth: {
				user: 'briana.bashirian73@ethereal.email',
				pass: 'C4z6z62E96rRqQKw1B'
			}
		});

    // Message object
    let message = {
        from: 'Sender Name <sender@example.com>',
        to: 'Recipient <recipient@example.com>',
        subject: 'Nodemailer is unicode friendly ✔',
        text: 'Hello to myself!',
        html: '<p><b>Hello</b> to myself!</p>'
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
});
 * */
