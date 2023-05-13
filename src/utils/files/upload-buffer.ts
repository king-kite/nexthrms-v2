import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

import { USE_LOCAL_MEDIA_STORAGE } from '../../config';

type UploadFileType = {
	buffer: Buffer;
	location: string;
	name: string;
	type?: 'auto' | 'image' | 'video' | 'raw' | 'auto';
};

function uploadBuffer({
	buffer,
	name,
	location,
	type = 'auto',
}: UploadFileType): Promise<
	| UploadApiResponse
	| {
			bytes?: number;
			original_filename: string;
			public_id: string;
			secure_url?: string;
			resource_type: string;
			url: string;
	  }
> {
	return new Promise((resolve, reject) => {
		try {
			if (USE_LOCAL_MEDIA_STORAGE) {
				const splitText = location.split('.');
				const extension = splitText[splitText.length - 1] || undefined;

				let newName = extension
					? splitText.filter((text, i) => i !== splitText.length - 1).join('')
					: location;

				const date = new Date();
				const date_str = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}`;

				let newLocation = newName + `_${date_str}_${new Date().getTime()}`;
				if (extension) newLocation += `.${extension}`;
				fs.writeFile(newLocation, buffer, (err) => {
					if (err) reject(err);
					else {
						resolve({
							bytes: buffer.byteLength,
							original_filename: name,
							public_id: name.toLowerCase(),
							resource_type: type || 'file',
							url: '/' + newLocation,
						});
					}
				});
			} else {
				const stream = cloudinary.uploader.upload_stream(
					{
						public_id: location,
						resource_type: type,
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result)
					}
				).end(buffer);
			}
		} catch (error) {
			reject(error)
		}
	});
}

export default uploadBuffer;
