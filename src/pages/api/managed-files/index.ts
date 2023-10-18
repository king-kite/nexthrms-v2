import fs from 'fs';
import NodeFormData from 'form-data';
import type { File } from 'formidable';

import { MANAGED_FILES_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn, axiosAuth } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../utils/parseForm';
import {
	deleteManagedFilesSchema,
	managedFileCreateSchema,
} from '../../../validators/managed-files';
import { getRouteParams } from '../../../validators/pagination';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(MANAGED_FILES_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const { fields, files } = await parseForm(req);

		const file = files.file ? getFormFiles(files.file)[0] : null;
		const directory = fields.directory ? getFormFields(fields.directory)[0] : null;
		const name = fields.name ? getFormFields(fields.name)[0] : null;
		const type = fields.type ? getFormFields(fields.type)[0] : null;

		const data = await managedFileCreateSchema.validate(
			{
				directory,
				file,
				name,
				type,
			},
			{ abortEarly: false }
		);

		if (data.type === 'file' && !data.file) throw new NextErrorMessage(400, 'File is required.');

		const formData = new NodeFormData();
		if (data.directory) formData.append('directory', data.directory);

		formData.append('name', data.name);
		formData.append('type', data.type);

		if (data.file) {
			formData.append('file', fs.createReadStream((data.file as File).filepath));
		}

		const response = await axiosAuth(req).post(MANAGED_FILES_URL, formData, formData.getHeaders());
		return res.status(201).json(response.data);
	})
	.delete(async function (req, res) {
		const { fields } = (await parseForm(req)) as { fields: any };

		const valid = await deleteManagedFilesSchema.validate({ ...fields }, { abortEarly: false });

		if (!valid.files && valid.folder === null && valid.folder === undefined)
			throw new NextErrorMessage(400, 'Provide a folder or a files array.');

		if (valid.files && valid.files.length <= 0)
			throw new NextErrorMessage(400, 'No file was sent.');

		const response = await axiosJn(req)({
			url: MANAGED_FILES_URL,
			method: 'DELETE',
			data: valid,
		});
		return res.status(200).json(response.data);
	});
