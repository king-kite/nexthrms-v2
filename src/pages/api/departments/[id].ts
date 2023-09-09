import { DEPARTMENT_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { createDepartmentSchema } from '../../../validators/departments';

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(DEPARTMENT_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await createDepartmentSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).put(
			DEPARTMENT_URL((req.query.id as string).toString()),
			data
		);
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(DEPARTMENT_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	});
