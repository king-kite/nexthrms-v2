import { prisma } from '../../../../../db';
import { auth } from '../../../../../middlewares';

export default auth().delete(async (req, res) => {
	await prisma.projectFile.delete({
		where: { id: req.query.fileId as string },
	});

	return res.status(200).json({
		status: 'success',
		message: 'Project file was deleted successfully!',
	});
});
