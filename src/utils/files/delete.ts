import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

import { USE_LOCAL_MEDIA_STORAGE } from '../../config';

function deleteFile(public_id: string, options?: any): Promise<unknown> {
	return new Promise((resolve, reject) => {
		try {
			if (USE_LOCAL_MEDIA_STORAGE) {
				const resolvedPath = path.resolve(
					public_id.startsWith('/') ? public_id.slice(1) : public_id
				);
				// if file path does not exist
				if (!fs.existsSync(resolvedPath)) {
					resolve(undefined);
				} else
					fs.unlink(resolvedPath, (err) => {
						if (err) reject(err);
						resolve(undefined);
					});
			} else {
				cloudinary.uploader
					.destroy(public_id, { public_id, ...options })
					.then((result) => {
						resolve(result);
					})
					.catch((error) => {
						reject(error);
					});
			}
		} catch (error) {
			reject(error);
		}
	});
}

export default deleteFile;
