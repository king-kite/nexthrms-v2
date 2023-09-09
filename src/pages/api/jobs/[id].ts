import { JOB_URL } from '../../../config/services';
import auth from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { createJobSchema } from '../../../validators/jobs';

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(JOB_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await createJobSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).put(JOB_URL((req.query.id as string).toString()), data);
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(JOB_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	});
