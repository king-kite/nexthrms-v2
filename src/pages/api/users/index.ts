import fs from 'fs';

import { USERS_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../utils/parseForm';
import { getToken } from '../../../utils/tokens';
import { createUserSchema } from '../../../validators/users';
import { getRouteParams } from '../../../validators/pagination';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(USERS_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const { fields, files } = await parseForm(req);

		if (!fields.form) throw new NextErrorMessage(400, "'Form' field is required");

		const [form] = JSON.parse(getFormFields(fields.form)[0]);

		const data = await createUserSchema.validate(form, {
			abortEarly: false,
			stripUnknown: true,
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
		const response = await fetch(USERS_URL, {
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
