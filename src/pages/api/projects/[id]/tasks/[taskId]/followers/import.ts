import fs from 'fs';
import NodeFormData from 'form-data';

import { PROJECT_TASK_FOLLOWERS_IMPORT_URL } from '../../../../../../../config/services';
import { auth } from '../../../../../../../middlewares';
import { axiosAuth } from '../../../../../../../utils/axios';
import { NextErrorMessage } from '../../../../../../../utils/classes';
import parseForm, { getFormFiles } from '../../../../../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth().post(async function (req, res) {
	const { files } = await parseForm(req);

	if (!files.data) throw new NextErrorMessage(400, 'Data field is required!');

	const [data] = getFormFiles(files.data);

	const formData = new NodeFormData();
	formData.append('data', fs.createReadStream(data.filepath));

	const response = await axiosAuth(req).put(
		PROJECT_TASK_FOLLOWERS_IMPORT_URL(req.query.id as string, req.query.taskId as string),
		formData,
		formData.getHeaders()
	);
	return res.status(200).json(response.data);
});
