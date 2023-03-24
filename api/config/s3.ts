import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { InvalidParamError } from '../errors/InvalidParamError';

const credentials = {
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
};

export const s3 = new S3Client({ 
	region: process.env.AWS_BUCKET_REGION,
	credentials: credentials,
});


export const upload = multer({
	storage: multerS3({
		s3: s3,
		acl: 'public-read',
		bucket: process.env.AWS_BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function (req, file, cb) {
			cb(null, Date.now().toString());
		}
	}),

	fileFilter: (req, file: Express.Multer.File, cb) => {
		const allowedMimes = [
			'image/jpeg',
			'image/png',
			'image/jpg',
			'application/pdf'
		];

		if(!allowedMimes.includes(file.mimetype)){
			cb(new InvalidParamError('Tipo de arquivo invalido!'));
		}
		cb(null, true);
	}
});

// app.post('/upload', upload.single('file'), function(req, res, next) {
// 	res.send('Successfully uploaded ');
// });