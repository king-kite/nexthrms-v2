import { permissions } from '../../../../../config';
import {
	prisma,
	projectFileSelectQuery as selectQuery,
} from '../../../../../db';
import {
	getUserObjectPermissions,
	hasViewPermission,
} from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';
import {
	CreateProjectFileQueryType,
	ProjectFileType,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';

export default auth()
	.use(async (req, res, next) => {
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextApiErrorMessage(403);
		next();
	})
	.delete(async (req, res) => {
		// const file = await prisma.projectFile.findUniqueOrThrow({
		// 	where: { id: req.query.fileId as string },
		// });
		// TODO: Delete the file from Storage

		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projectfile.DELETE,
			]);

		if (!hasPerm) {
			const objPerm = await getUserObjectPermissions({
				modelName: 'projects_files',
				permission: 'DELETE',
				objectId: req.query.fileId as string,
				userId: req.user.id,
			});
			hasPerm = objPerm.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.projectFile.delete({
			where: { id: req.query.fileId as string },
		});

		return res.status(200).json({
			status: 'success',
			message: 'Project file was deleted successfully!',
		});
	});
