import fs from 'fs';
import NodeFormData from 'form-data';

import { PROFILE_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn, axiosAuth } from '../../../utils/axios';
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

		const form = JSON.parse(getFormFields(fields.form)[0]);

		const data = await profileUpdateSchema.validate(form, {
			abortEarly: false,
		});

		const formData = new NodeFormData();

		formData.append('form', JSON.stringify(data));

		if (files.image) {
			const [image] = getFormFiles(files.image);
			formData.append('image', fs.createReadStream(image.filepath));
		}

		const response = await axiosAuth(req).put(PROFILE_URL, formData, formData.getHeaders());
		return res.status(200).json(response.data);
	});
