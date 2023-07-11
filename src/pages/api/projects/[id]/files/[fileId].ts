import { permissions, USE_LOCAL_MEDIA_STORAGE } from '../../../../../config';
import prisma from '../../../../../db';
import {
	getUserObjectPermissions,
	hasViewPermission,
} from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';
import { hasModelPermission } from '../../../../../utils/permission';
import { deleteFile } from '../../../../../utils/files';
import { NextErrorMessage } from '../../../../../utils/classes';

export default auth()
	.use(async (req, res, next) => {
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextErrorMessage(403);
		next();
	})
	.delete(async (req, res) => {
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

		if (!hasPerm) throw new NextErrorMessage(403);

		const projectFile = await prisma.projectFile.findUnique({
			where: { id: req.query.fileId as string },
			select: {
				id: true,
				file: {
					select: {
						url: true,
						storageInfo: true,
					},
				},
			},
		});

		if (!projectFile)
			throw new NextErrorMessage(
				404,
				'Project file with the specified ID was not found!'
			);

		await prisma.projectFile.delete({
			where: { id: projectFile.id },
		});

		const deleteId = (projectFile.file.storageInfo as any).public_id;
		deleteFile(deleteId).catch((error) => {
			console.log('DELETE PROJECT FILE ERROR :>>', error);
		});

		return res.status(200).json({
			status: 'success',
			message: 'Project file was deleted successfully!',
		});
	});
