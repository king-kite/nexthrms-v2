import { permissions } from '../../../config';
import prisma from '../../../db';
import { getJobs } from '../../../db/queries/jobs';
import { getRecords, getUserObjects } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { multipleDeleteSchema } from '../../../validators';
import { createJobSchema } from '../../../validators/jobs';

export default admin()
	.get(async (req, res) => {
		const result = await getRecords({
			query: req.query,
			user: req.user,
			model: 'jobs',
			perm: 'job',
			placeholder: {
				total: 0,
				result: [],
			},
			getData(params) {
				return getJobs(params);
			},
		});
		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.job.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await createJobSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);
		const job = await prisma.job.create({
			data,
			select: {
				id: true,
				name: true,
			},
		});
		return res.status(201).json({
			status: 'success',
			message: 'Job created successfully!',
			data: job,
		});
	})
	.delete(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.job.DELETE]);

		const valid = await multipleDeleteSchema.validate(
			{
				...req.body,
			},
			{ abortEarly: false }
		);

		if (!hasPerm) {
			const userObjects = await getUserObjects({
				modelName: 'jobs',
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
						'Sorry, you are not authorized to delete some of the jobs requested.',
				});
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.job.deleteMany({
			where: {
				id: {
					in: valid.values,
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Deleted jobs successfully',
		});
	});
