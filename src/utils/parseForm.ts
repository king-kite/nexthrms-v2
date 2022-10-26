import formidable from 'formidable';
import type { NextApiRequest } from 'next';

import { NextApiRequestExtendUser } from '../types';

export default function parseForm(
	request: NextApiRequest | NextApiRequestExtendUser
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
	return new Promise((resolve, reject) => {
		const form = new formidable.IncomingForm({ keepExtensions: true });

		form.parse(request, (error, fields, files) => {
			if (error) throw reject(error);
			resolve({ fields, files });
		});
	});
}
