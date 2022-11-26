import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (process.env.NODE_ENV === 'development') {
		const { name, type } = req.query;

		if (!name || name.length <= 0) {
			return res.status(404).json({
				status: 'error',
				message: 'File was not found!',
			});
		}

		try {
			const imagePath = (name as string[]).join('/');
			const filePath = path.resolve(`media/${imagePath}`);
			const imageBuffer = fs.readFileSync(filePath);
			res.setHeader('Content-Type', type ? String(type) : 'image/*');
			return res.status(200).send(imageBuffer);
		} catch (error) {
			// Send a default file
			// const filePath = path.resolve('public/logo.png');
			// const imageBuffer = fs.readFileSync(filePath);
			// res.setHeader('Content-Type', 'image/*');
			return res.status(500).json({
				status: 'error',
				message: 'Unable to load file!',
			});
		}
	}
	return res.status(404).json({
		status: 'error',
		message: 'Page Not FOund!',
	});
}
