import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

import { USE_LOCAL_MEDIA_STORAGE } from '../../config';

type UploadFileType = {
	buffer: Buffer;
	location: string;
	name: string;
	type?: 'image' | 'video' | 'raw' | 'auto';
};

function uploadBuffer({
	buffer,
	name,
	location,
	type,
}: UploadFileType): Promise<
	| UploadApiResponse
	| {
			original_filename: string;
			public_id: string;
			secure_url?: string;
			resource_type: string;
			url: string;
	  }
> {
	return new Promise((resolve, reject) => {
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
					folder: location,
					public_id: location,
					resource_type: type,
				},
				(error, result) => {
					if (result) resolve(result);
					else if (error) reject(error);
				}
			);
			fs.createReadStream(buffer).pipe(stream);
		}
	});
}

export default uploadBuffer;
