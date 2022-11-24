import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { File } from 'formidable';
import fs from 'fs';

type UploadFileType = {
	file: File;
	location: string;
	type?: string;
};

function uploadFile({ file, location, type }: UploadFileType): Promise<
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
		if (process.env.NODE_ENV !== 'development') {
			cloudinary.uploader
				.upload(file.filepath, {
					public_id: location,
					resource_type: type,
				})
				.then((result) => {
					resolve(result);
				})
				.catch((error) => {
					reject(error);
				});
		} else {
			fs.readFile(file.filepath, (err, data) => {
				if (err) reject(err);
				else {
					const splitText = file.originalFilename
						? file.originalFilename.split('.')
						: undefined;
					const extension: string | undefined = splitText
						? splitText[splitText.length - 1]
						: undefined;

					let newLocation = location + `_${new Date().getTime()}`;
					if (extension) newLocation += `.${extension}`;

					fs.writeFile(newLocation, data, (err) => {
						if (err) reject(err);
						else {
							resolve({
								original_filename: file.originalFilename || file.newFilename,
								public_id: (
									file.originalFilename || file.newFilename
								).toLowerCase(),
								resource_type: file.mimetype || type || 'file',
								url: '/' + newLocation,
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
		}
	});
}

export default uploadFile;
