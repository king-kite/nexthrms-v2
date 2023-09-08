import fs from 'fs';

import { PROFILE_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFiles, getFormFields } from '../../../utils/parseForm';
import { getToken } from '../../../utils/tokens';
import { profileUpdateSchema } from '../../../validators/auth';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(PROFILE_URL);
		return res.status(200).json(response.data);
	})
	.put(async function (req, res) {
		const { fields, files } = await parseForm(req);

		if (!fields.form) throw new NextErrorMessage(400, "'Form' field is required");

		const form = JSON.parse(getFormFields(fields.form)[0]);

		const data = await profileUpdateSchema.validate(form, {
			abortEarly: false,
		});

		const formData = new FormData();

		formData.append('form', JSON.stringify(data));

		if (files.image) {
			const [image] = getFormFiles(files.image);
			const fileBuffer = fs.readFileSync(image.filepath);

			const blob = new Blob([fileBuffer], {
				type: image.mimetype || undefined,
			});
			formData.append('image', blob);
		}

		const token = getToken(req, 'access');

		// Axios doesn't seem to work well with the form data
		const response = await fetch(PROFILE_URL, {
			method: 'PUT',
			body: formData,
			headers: {
				Authorization: 'Bearer ' + token,
			},
		});
		const result = await response.json();

		if (!response.ok && response.status === 200) {
			return res.status(200).json(result);
		}

		throw new NextErrorMessage(response.status, result.message, result.data);
	});
