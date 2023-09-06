import fs from 'fs';

import { PROFILE_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosAuth, axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFiles, getFormFields } from '../../../utils/parseForm';
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

		const [form] = JSON.parse(getFormFields(fields.form)[0]);

		const data = await profileUpdateSchema.validate(form, {
			abortEarly: false,
		});

		const [image] = getFormFiles(files.image);

		const formData = new FormData();

		const fileBuffer = fs.readFileSync(image.filepath);

		const blob = new Blob([fileBuffer]);

		formData.append('form', JSON.stringify(data));
		formData.append('image', blob);

		const response = await axiosAuth(req).post(PROFILE_URL, formData);
		return res.status(200).json(response.data);
	});
