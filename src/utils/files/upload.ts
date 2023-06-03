import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { File } from 'formidable';
import fs from 'fs';

import { USE_LOCAL_MEDIA_STORAGE } from '../../config';

type UploadFileType = {
	file: File;
	location: string;
	type?: 'auto' | 'image' | 'video' | 'raw' | 'auto' | string;
};

function uploadFile({
	file,
	location: oldLocation,
	type,
}: UploadFileType): Promise<
	| (UploadApiResponse & {
			location: string;
	  })
	| {
			original_filename: string;
			public_id: string;
			location: string;
			secure_url?: string;
			resource_type: string;
			url: string;
	  }
> {
	return new Promise((resolve, reject) => {
		let location = oldLocation;
		const splitText = file.originalFilename
			? file.originalFilename.split('.')
			: undefined;
		const extension: string | undefined = splitText
			? splitText[splitText.length - 1]
			: undefined;
		if (extension) location += `.${extension}`;

		if (USE_LOCAL_MEDIA_STORAGE) {
			fs.readFile(file.filepath, (err, data) => {
				if (err) reject(err);
				else {
					fs.writeFile(location, data, (err) => {
						if (err) reject(err);
						else {
							resolve({
								original_filename: file.originalFilename || file.newFilename,
								public_id: location,
								resource_type: file.mimetype || type || 'file',
								location,
								url: '/' + location,
							});
							fs.unlink(file.filepath, (error) => {
								if (err)
									console.log(
										'DELETE FILE AFTER UPLOAD ERROR (DEVELOPMENT) :>> ',
										{
											error,
										}
									);
							});
						}
					});
				}
			});
		} else {
			cloudinary.uploader
				.upload(
					file.filepath,
					{
						public_id: location,
					},
					(error) => {
						if (error) reject(error);
					}
				)
				.then((result) => {
					resolve({
						...result,
						resource_type: result.resource_type || type || 'file',
						location,
					});
				})
				.catch((error) => {
					reject(error);
				});
		}
	});
}

export default uploadFile;
