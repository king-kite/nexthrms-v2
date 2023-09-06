import fs from 'fs';

import { ASSETS_IMPORT_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosAuth } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFiles } from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth().post(async function (req, res) {
	const { files } = await parseForm(req);

	if (!files.data) throw new NextErrorMessage(400, 'Data field is required!');

	const [data] = getFormFiles(files.data);

	if (
		data.mimetype !== 'text/csv' &&
		data.mimetype !== 'application/zip' &&
		data.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	)
		throw new NextErrorMessage(
			400,
			'Sorry, only CSVs, Microsoft excel files and Zip files are allowed!'
		);

	const formData = new FormData();

	const fileBuffer = fs.readFileSync(data.filepath);

	const blob = new Blob([fileBuffer]);

	formData.append('data', blob);

	const response = await axiosAuth(req).post(ASSETS_IMPORT_URL, formData);
	return res.status(200).json(response.data);
});
