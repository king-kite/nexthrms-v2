import formidable from 'formidable';
import type { NextApiRequest } from 'next';

export function getFormFields(fields: string | string[]) {
	if (Array.isArray(fields)) return fields;
	return [fields];
}

export function getFormFiles(files: formidable.File[] | formidable.File) {
	if (Array.isArray(files)) return files;
	return [files];
}

export default function parseForm(
	request: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
	return new Promise((resolve, reject) => {
		const form = new formidable.IncomingForm({ keepExtensions: true });

		form.parse(request, (error, fields, files) => {
			if (error) throw reject(error);
			resolve({ fields, files });
		});
	});
}
