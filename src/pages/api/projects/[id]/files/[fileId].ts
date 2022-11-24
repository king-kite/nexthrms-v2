import { prisma } from '../../../../../db';
import { auth } from '../../../../../middlewares';

export default auth().delete(async (req, res) => {
	const file = await prisma.projectFile.findUniqueOrThrow({
		where: { id: req.query.fileId as string },
	});

	// TODO: Delete the file from Storage

	await prisma.projectFile.delete({
		where: { id: req.query.fileId as string },
	});

	return res.status(200).json({
		status: 'success',
		message: 'Project file was deleted successfully!',
	});
});
