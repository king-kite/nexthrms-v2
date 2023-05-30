import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { File } from 'formidable';
import fs from 'fs';

import { USE_LOCAL_MEDIA_STORAGE } from '../../config';

type UploadFileType = {
	file: File;
	location: string;
	type?: 'image' | 'video' | 'raw' | 'auto';
};

function uploadFile({ file, location, type }: UploadFileType): Promise<
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
						resource_type: type,
					},
					(error) => {
						if (error) reject(error);
					}
				)
				.then((result) => {
					resolve({ ...result, location });
				})
				.catch((error) => {
					reject(error);
				});
		}
	});
}

export default uploadFile;
