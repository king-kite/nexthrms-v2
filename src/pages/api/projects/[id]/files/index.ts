import fs from 'fs';
import NodeFormData from 'form-data';

import { PROJECT_FILES_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn, axiosAuth } from '../../../../../utils/axios';
import { NextErrorMessage } from '../../../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../../../utils/parseForm';
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

		const name = getFormFields(fields.name)[0];
		const [file] = getFormFiles(files.file);

		const formData = new NodeFormData();
		formData.append('name', name);
		formData.append('file', fs.createReadStream(file.filepath));

		const response = await axiosAuth(req).post(
			PROJECT_FILES_URL(req.query.id as string),
			formData,
			formData.getHeaders()
		);
		return res.status(201).json(response.data);
	});
