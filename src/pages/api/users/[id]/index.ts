import fs from 'fs';
import NodeFormData from 'form-data';

import { USER_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn, axiosAuth } from '../../../../utils/axios';
import { NextErrorMessage } from '../../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../../utils/parseForm';
import { createUserSchema } from '../../../../validators/users';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(USER_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const { fields, files } = await parseForm(req);

		if (!fields.form) throw new NextErrorMessage(400, "'Form' field is required");

		const form = JSON.parse(getFormFields(fields.form)[0]);

		const data = await createUserSchema.validate(form, {
			abortEarly: false,
			stripUnknown: true,
		});

		const formData = new NodeFormData();
		formData.append('form', JSON.stringify(data));

		if (files.image) {
			const [image] = getFormFiles(files.image);
			formData.append('image', fs.createReadStream(image.filepath));
		}

		const response = await axiosAuth(req).put(
			USER_URL(req.query.id as string).toString(),
			formData,
			formData.getHeaders()
		);
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(USER_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	});
