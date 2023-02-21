import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

import { USE_LOCAL_MEDIA_STORAGE } from '../../../config';

async function asyncReadFile(filePath: string): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const resolvedPath = path.resolve(`media/${filePath}`);
			fs.readFile(resolvedPath, (err, data) => {
				if (err) reject(err);
				resolve(data);
			});
		} catch (error) {
			reject(error);
		}
	});
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (USE_LOCAL_MEDIA_STORAGE) {
		const { name, type } = req.query;

		if (!name || name.length <= 0) {
			return res.status(404).json({
				status: 'error',
				message: 'File was not found!',
			});
		}

		try {
			const filePath = (name as string[]).join('/');
			const fileBuffer = await asyncReadFile(filePath);
			res.setHeader('Content-Type', type ? String(type) : 'image/*');
			return res.status(200).end(fileBuffer);
		} catch (error) {
			try {
				// Send a default file
				const filePath = path.resolve('public/images/logo.png');
				const fileBuffer = await asyncReadFile(filePath);
				res.setHeader('Content-Type', 'image/*');
				return res.status(200).end(fileBuffer);
			} catch (error) {
				return res.status(500).json({
					status: 'error',
					message: 'Unable to load file!',
				});
			}
		}
	}
	return res.status(404).json({
		status: 'error',
		message: 'Page Not FOund!',
	});
}
