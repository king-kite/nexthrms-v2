import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

import { USE_LOCAL_MEDIA_STORAGE } from '../../config';

type UploadFileType = {
	buffer: Buffer;
	location: string;
	name: string;
	type?: 'auto' | 'image' | 'video' | 'raw' | 'auto' | string;
};

function uploadBuffer({
	buffer,
	name,
	location,
	type = 'auto',
}: UploadFileType): Promise<
	| (UploadApiResponse & {
			location: string;
	  })
	| {
			bytes?: number;
			original_filename: string;
			location: string;
			public_id: string;
			secure_url?: string;
			resource_type: string;
			url: string;
	  }
> {
	return new Promise((resolve, reject) => {
		try {
			if (USE_LOCAL_MEDIA_STORAGE) {
				const _split = location.split('/');
				const dir = _split.filter((i, j) => j < _split.length - 1).join('/');

				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}

				fs.writeFile(location, buffer, (err) => {
					if (err) reject(err);
					else {
						resolve({
							bytes: buffer.byteLength,
							original_filename: name,
							// public_id: name.toLowerCase(),
							public_id: location,
							location,
							resource_type: type || 'file',
							url: '/' + location,
						});
					}
				});
			} else {
				cloudinary.uploader
					.upload_stream(
						{
							public_id: location,
						},
						(error, result) => {
							if (result)
								resolve({
									...result,
									resource_type: result.resource_type || type || 'file',
									location,
								});
							else reject(error);
						}
					)
					.end(buffer);
			}
		} catch (error) {
			reject(error);
		}
	});
}

export default uploadBuffer;
