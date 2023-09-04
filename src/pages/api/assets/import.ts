import axios from 'axios';
import { ASSETS_IMPORT_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm, { getFormFiles } from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler().post(async function (req, res) {
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

	const response = await axios.post(ASSETS_IMPORT_URL, data);
	return res.status(200).json(response.data);
});
