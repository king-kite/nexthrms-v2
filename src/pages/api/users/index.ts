import fs from 'fs';

import { USERS_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosAuth, axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../utils/parseForm';
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

		const data = await createUserSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const [image] = getFormFiles(files.image);

		const formData = new FormData();

		const fileBuffer = fs.readFileSync(image.filepath);

		const blob = new Blob([fileBuffer]);

		formData.append('form', JSON.stringify(data));
		formData.append('image', blob);

		const response = await axiosAuth(req).post(USERS_URL, formData);
		return res.status(201).json(response.data);
	});
