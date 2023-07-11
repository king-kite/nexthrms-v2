import { permissions } from '../../../../config';
import {
	getAllOvertimeAdmin,
	createOvertime,
} from '../../../../db/queries/overtime';
import {
	addObjectPermissions,
	getRecords,
	getEmployeeOfficersId,
	updateObjectPermissions,
} from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { employeeMiddleware as employee } from '../../../../middlewares/api';
import { hasModelPermission } from '../../../../utils/permission';
import { NextErrorMessage } from '../../../../utils/classes';
import { overtimeCreateSchema } from '../../../../validators/overtime';

export default admin()
	.get(async (req, res) => {
		const result = await getRecords({
			model: 'overtime',
			perm: 'overtime',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				approved: 0,
				denied: 0,
				pending: 0,
				result: [],
			},
			getData(params) {
				return getAllOvertimeAdmin(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextErrorMessage(403);
	})
	.use(employee)
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.overtime.CREATE,
			]);

		if (!hasPerm) throw new NextErrorMessage(403);

		const { employee: employeeId, ...data } =
			await overtimeCreateSchema.validate(
				{
					...req.body,
				},
				{ abortEarly: false }
			);

		if (!employeeId) {
			return res.status(400).json({
				status: 'error',
				message: 'Employee ID is required',
			});
		}

		const overtime = await createOvertime({ ...data, employeeId });

		// Get the employees admin related officers
		const officers = await getEmployeeOfficersId(overtime.employee.id);

		await addObjectPermissions({
			model: 'overtime',
			objectId: overtime.id,
			users: [req.user.id, overtime.employee.user.id],
		});
		// add the admin officers for the user to edit and view
		await updateObjectPermissions({
			model: 'overtime',
			permissions: ['VIEW'],
			objectId: overtime.id,
			users: officers.filter(
				(id) => id !== req.user.id && id !== overtime.employee.user.id
			),
		});

		return res.status(201).json({
			status: 'success',
			mesage:
				'Request for overtime was created successfully. Do note that the hours may be updated to the actual time spent.',
			data: overtime,
		});
	});
