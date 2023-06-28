import { permissions } from '../../../config';
import prisma from '../../../db';
import {
	getHoliday,
	holidaySelectQuery as selectQuery,
} from '../../../db/queries/holidays';
import { getRecord, getUserObjectPermissions } from '../../../db/utils';
import { employee } from '../../../middlewares';
import { adminMiddleware as admin } from '../../../middlewares/api';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { createHolidaySchema } from '../../../validators/holidays';

export default employee()
	.get(async (req, res) => {
		const record = await getRecord({
			model: 'holiday',
			perm: 'holiday',
			permission: 'VIEW',
			user: req.user,
			objectId: req.query.id as string,
			getData() {
				return getHoliday(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: '404',
				message: 'Holiday record with the specified ID was not found',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched data successfully!',
			data: record.data,
		});
	})
	.use(admin)
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.holiday.EDIT]);

		if (!hasPerm) {
			const perms = await getUserObjectPermissions({
				modelName: 'holiday',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			hasPerm = perms.edit;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await createHolidaySchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);
		const holiday = await prisma.holiday.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: selectQuery,
		});
		return res.status(200).json({
			status: 'success',
			message: 'Holiday updated successfully',
			data: holiday,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.holiday.DELETE]);

		if (!hasPerm) {
			const perms = await getUserObjectPermissions({
				modelName: 'holiday',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			hasPerm = perms.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.holiday.delete({ where: { id: req.query.id as string } });
		return res.status(200).json({
			status: 'success',
			message: 'Holiday deleted successfully',
		});
	});
