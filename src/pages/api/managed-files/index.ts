import fs from 'fs';
import type { File } from 'formidable';

import { MANAGED_FILES_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFields, getFormFiles } from '../../../utils/parseForm';
import { getToken } from '../../../utils/tokens';
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

		const [file] = getFormFiles(files.file);
		const [directory] = JSON.parse(getFormFields(fields.directory)[0]);
		const [name] = JSON.parse(getFormFields(fields.name)[0]);
		const [type] = JSON.parse(getFormFields(fields.type)[0]);

		const data = await managedFileCreateSchema.validate(
			{
				directory,
				file,
				name,
				type,
			},
			{ abortEarly: false, stripUnknown: true }
		);

		if (data.type === 'file' && !data.file) throw new NextErrorMessage(400, 'File is required.');

		const formData = new FormData();
		if (data.directory) formData.append('directory', data.directory);

		formData.append('name', data.name);
		formData.append('type', data.type);

		if (data.file) {
			const fileBuffer = fs.readFileSync((data.file as File).filepath);

			const blob = new Blob([fileBuffer], {
				type: (data.file as File).mimetype || undefined,
			});

			formData.append('file', blob);
		}

		const token = getToken(req, 'access');

		// Axios doesn't seem to work well with the form data
		const response = await fetch(MANAGED_FILES_URL, {
			method: 'PUT',
			body: formData,
			headers: {
				Authorization: 'Bearer ' + token,
			},
		});
		const result = await response.json();

		if (!response.ok && response.status === 201) {
			return res.status(201).json(result);
		}

		throw new NextErrorMessage(response.status, result.message, result.data);
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
