import fs from 'fs';

import { CLIENT_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../utils/parseForm';
import { getToken } from '../../../utils/tokens';
import { createClientSchema } from '../../../validators/clients';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(CLIENT_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const { fields, files } = await parseForm(req);

		if (!fields.form) throw new NextErrorMessage(400, "'Form' field is required");

		const [form] = JSON.parse(getFormFields(fields.form)[0]);

		const data = await createClientSchema.validate(form, {
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
		const response = await fetch(CLIENT_URL((req.query.id as string).toString()), {
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
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(CLIENT_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	});
