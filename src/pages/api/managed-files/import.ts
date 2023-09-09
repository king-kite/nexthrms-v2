import fs from 'fs';

import { MANAGED_FILES_IMPORT_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFiles } from '../../../utils/parseForm';
import { getToken } from '../../../utils/tokens';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth().post(async function (req, res) {
	const { files } = await parseForm(req);

	if (!files.data) throw new NextErrorMessage(400, 'Data field is required!');

	const [data] = getFormFiles(files.data);

	const formData = new FormData();

	const fileBuffer = fs.readFileSync(data.filepath);

	const blob = new Blob([fileBuffer], {
		type: data.mimetype || undefined,
	});

	formData.append('data', blob);

	const token = getToken(req, 'access');

	// Axios doesn't seem to work well with the form data
	const response = await fetch(MANAGED_FILES_IMPORT_URL, {
		method: 'POST',
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
