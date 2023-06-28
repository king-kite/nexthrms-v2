import permissions from '../../../config/permissions';
import prisma from '../../../db';
import { getJob } from '../../../db/queries/jobs';
import { getRecord, getUserObjectPermissions } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { createJobSchema } from '../../../validators/jobs';

export default admin()
	.get(async (req, res) => {
		const record = await getRecord({
			model: 'jobs',
			perm: 'job',
			objectId: req.query.id as string,
			user: req.user,
			permission: 'VIEW',
			getData() {
				return getJob(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: 'error',
				message: 'Job with the specified ID does not exist.',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched job successfully',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.job.EDIT]);

		if (!hasPerm) {
			const perms = await getUserObjectPermissions({
				userId: req.user.id,
				objectId: req.query.id as string,
				modelName: 'jobs',
				permission: 'EDIT',
			});
			hasPerm = perms.edit;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await createJobSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);
		const job = await prisma.job.update({
			where: {
				id: req.query.id as string,
			},
			data,
		});
		return res.status(200).json({
			status: 'success',
			message: 'Job updated successfully',
			data: job,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.job.DELETE]);

		if (!hasPerm) {
			const perms = await getUserObjectPermissions({
				userId: req.user.id,
				objectId: req.query.id as string,
				modelName: 'jobs',
				permission: 'DELETE',
			});
			hasPerm = perms.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.job.delete({ where: { id: req.query.id as string } });
		return res.status(200).json({
			status: 'success',
			message: 'Job deleted successfully',
		});
	});
