import { permissions } from '../../../config';
import { prisma } from '../../../db';
import { hasObjectPermission } from '../../../db/utils';
import { auth } from '../../../middlewares';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { deleteFile } from '../../../utils/files';

export default auth().delete(async (req, res) => {
	let hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.managedfile.DELETE,
		]);

	if (!hasPerm) {
		// check if the user has delete object permission for this object
		hasPerm = await hasObjectPermission({
			model: 'managed_files',
			objectId: req.query.id as string,
			permission: 'DELETE',
			userId: req.user.id,
		});
	}

	if (!hasPerm) throw new NextApiErrorMessage(403);

	const record = await prisma.managedFile.findUnique({
		where: { id: req.query.id as string },
	});

	if (!record) throw new NextApiErrorMessage(404);

	await deleteFile((record.storageInfo as any)?.public_id || record.url);

	await prisma.managedFile.delete({
		where: {
			id: req.query.id as string,
		},
	});

	return res.status(200).json({
		status: 'success',
		message: 'File deleted successfully!',
	});
});
