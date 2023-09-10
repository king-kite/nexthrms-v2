import fs from 'fs';

import { PROJECT_FILES_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';
import { NextErrorMessage } from '../../../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../../../utils/parseForm';
import { getToken } from '../../../../../utils/tokens';
import { getRouteParams } from '../../../../../validators/pagination';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);
		const url = PROJECT_FILES_URL(req.query.id as string) + params;

		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	.post(async (req, res) => {
		const { fields, files } = await parseForm(req);

		if (!files.file) throw new NextErrorMessage(400, 'File was not provided.');

		const name = JSON.parse(getFormFields(fields.name)[0]);
		const [file] = getFormFiles(files.file);

		const formData = new FormData();
		formData.append('name', name);

		const fileBuffer = fs.readFileSync(file.filepath);

		const blob = new Blob([fileBuffer], {
			type: file.mimetype || undefined,
		});

		formData.append('file', blob);

		const token = getToken(req, 'access');

		// Axios doesn't seem to work well with the form data
		const response = await fetch(PROJECT_FILES_URL(req.query.id as string), {
			method: 'POST',
			body: formData,
			headers: {
				Authorization: 'Bearer ' + token,
			},
		});
		const result = await response.json();

		if (!response.ok && response.status === 201) {
			return res.status(201).json(result);
		}

		throw new NextErrorMessage(response.status, result.message, result.data);
	});
