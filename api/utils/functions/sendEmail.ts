import nodemailer from 'nodemailer';

export async function sendEmail(email:string, subject:string, body:string){
	const sender = process.env.EMAIL;
	const password = process.env.EMAIL_PASSWORD;

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: sender,
			pass: password,
		}
	});
    
	const mailOptions = {
		from: sender,
		to: email,
		subject: subject,
		text: body
	};

	const mail = transporter.sendMail(mailOptions);

	return mail;
}