import {
	deleteOvertime,
	getOvertime,
	updateOvertime,
} from '../../../../db/queries/overtime';
import { getUserObjectPermissions } from '../../../../db/utils';
import { employee } from '../../../../middlewares';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { overtimeCreateSchema } from '../../../../validators/overtime';

export default employee()
	.get(async (req, res) => {
		const overtime = await getOvertime(req.query.id as string);

		if (!overtime) {
			return res.status(404).json({
				status: 'error',
				message: 'Overtime record with specified ID was not found!',
			});
		}

		if (overtime.employee.id !== req.user.employee.id) {
			throw new NextApiErrorMessage(403);
		}

		// check if the user has a view object permission for this record
		const objPerm = await getUserObjectPermissions({
			modelName: 'overtime',
			objectId: req.query.id as string,
			permission: 'VIEW',
			userId: req.user.id,
		});

		// If the user no longer has view permission
		// Should have on create
		if (!objPerm.view) throw new NextApiErrorMessage(403);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched overtime successfully!',
			data: overtime,
		});
	})
	.put(async (req, res) => {
		const overtime = await getOvertime(req.query.id as string);

		if (!overtime) {
			return res.status(404).json({
				status: 'error',
				message: 'Overtime record with specified ID was not found!',
			});
		}

		if (overtime.employee.id !== req.user.employee.id) {
			throw new NextApiErrorMessage(403);
		}

		// check if the user has a view object permission for this record
		const objPerm = await getUserObjectPermissions({
			modelName: 'overtime',
			objectId: req.query.id as string,
			permission: 'EDIT',
			userId: req.user.id,
		});

		// If the user no longer has edit permission
		// Should have on create
		if (!objPerm.edit) throw new NextApiErrorMessage(403);

		// If the overtime is updated by the user, change the status to 'PENDING'
		const oldDate =
			typeof overtime.date === 'string'
				? new Date(overtime.date)
				: overtime.date;
		const currentDate = new Date();
		// As long as the overtime is the current date or greater than the current date
		// The user can update it
		if (oldDate.getTime() >= currentDate.getTime()) {
			const { employee, ...data } = await overtimeCreateSchema.validate(
				{
					...req.body,
				},
				{ abortEarly: false }
			);

			const updated = await updateOvertime(overtime.id, {
				...data,
				employee: {
					connect: {
						id: req.user.employee.id as string,
					},
				},
				status: 'PENDING',
			});

			return res.status(200).json({
				status: 'success',
				mesage:
					'Request for overtime was updated successfully. Do note that the hours may be updated to the actual time spent.',
				data: updated,
			});
		}
		return res.status(403).json({
			status: 'error',
			message:
				"This overtime request is passed it's date and can no longer be updated.",
		});
	})
	.delete(async (req, res) => {
		const overtime = await getOvertime(req.query.id as string);

		if (!overtime)
			throw new NextApiErrorMessage(
				404,
				'Overtime with the specified id was not found!'
			);

		if (overtime.employee.id !== req.user.employee.id)
			throw new NextApiErrorMessage(403);

		// check if the user has a view object permission for this record
		const objPerm = await getUserObjectPermissions({
			modelName: 'overtime',
			objectId: req.query.id as string,
			permission: 'DELETE',
			userId: req.user.id,
		});

		// If the user no longer has delete permission
		// Should have on create
		if (!objPerm.delete) throw new NextApiErrorMessage(403);

		if (overtime.status === 'APPROVED') {
			return res.status(403).json({
				status: 'error',
				message: `This overtime request has already been approved and can no longer be deleted!`,
			});
		}

		const oldDate =
			typeof overtime.date === 'string'
				? new Date(overtime.date)
				: overtime.date;
		const currentDate = new Date();
		// As long as the overtime is still pending, the user can edit as he/she likes
		// Also if the startDate has not yet been reached
		if (oldDate.getTime() >= currentDate.getTime()) {
			await deleteOvertime(req.query.id as string);

			return res.status(200).json({
				status: 'success',
				message: 'Overtime deleted successfully',
			});
		}
		return res.status(403).json({
			status: 'error',
			message:
				"This overtime request is passed it's date and can no longer be deleted.",
		});
	});
