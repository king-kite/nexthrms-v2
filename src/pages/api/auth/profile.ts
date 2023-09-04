import axios from 'axios';

import { PROFILE_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFiles, getFormFields } from '../../../utils/parseForm';
import { profileUpdateSchema } from '../../../validators/auth';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler()
	.get(async function (req, res) {
		const response = await axios.get(PROFILE_URL);
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

		data.profile.image = image;

		const response = await axios.post(PROFILE_URL, data);
		return res.status(200).json(response.data);
	});
