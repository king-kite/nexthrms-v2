import { permissions } from '../../../config';
import {
	prisma,
	getHolidays,
	holidaySelectQuery as selectQuery,
} from '../../../db';
import {
	addObjectPermissions,
	getRecords,
	getUserObjects,
} from '../../../db/utils';
import { employee } from '../../../middlewares';
import { adminMiddleware as admin } from '../../../middlewares/api';
import { HolidayType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { createHolidaySchema, multipleDeleteSchema } from '../../../validators';

export default employee()
	.get(async (req, res) => {
		const result = await getRecords({
			model: 'holiday',
			perm: 'holiday',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				result: [],
			},
			getData(params) {
				return getHolidays(params);
			},
		});
		if (result) return res.status(200).json(result);
		return {
			status: 'success',
			message: 'Fetched data successfully',
			data: {
				total: 0,
				result: [],
			},
		};
	})
	.use(admin)
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.holiday.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const valid: {
			name: string;
			date: Date | string;
		} = await createHolidaySchema.validateAsync({ ...req.body });

		const holiday = (await prisma.holiday.create({
			data: valid,
			select: selectQuery,
		})) as unknown as HolidayType;

		await addObjectPermissions({
			model: 'holiday',
			objectId: holiday.id,
			users: [req.user.id],
		});

		return res.status(201).json({
			status: 'success',
			message: 'Holiday created successfully!',
			data: holiday,
		});
	})
	.delete(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.holiday.DELETE]);

		const valid: { values: string[] } =
			await multipleDeleteSchema.validateAsync({ ...req.body });

		if (valid.values.length < 1) {
			return res.status(400).json({
				status: 'error',
				message:
					'Invalid Data. Provide at least 1 holiday ID in the values array.',
			});
		}

		if (!hasPerm) {
			const userObjects = await getUserObjects({
				modelName: 'holiday',
				userId: req.user.id,
				permission: 'DELETE',
			});
			const everyId = userObjects.every((obj) =>
				valid.values.includes(obj.objectId)
			);
			if (!everyId)
				return res.status(403).json({
					status: 'error',
					message:
						'Sorry, you are not authorized to delete some of the holidays requested.',
				});
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.holiday.deleteMany({
			where: {
				id: {
					in: valid.values,
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message:
				'Holiday' +
				(valid.values.length > 1 ? 's were ' : ' was ') +
				'deleted successfully',
		});
	});
