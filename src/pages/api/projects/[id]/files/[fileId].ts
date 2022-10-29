import { firebaseBucket, prisma } from '../../../../../db';
import { auth } from '../../../../../middlewares';

export default auth().delete(async (req, res) => {
	const file = await prisma.projectFile.findUniqueOrThrow({
		where: { id: req.query.fileId as string },
	});

	if (file.storageName && file.storageGeneration) {
		firebaseBucket
			.file(file.storageName)
			.delete({
				ifGenerationMatch: parseInt(file.storageGeneration),
			})
			.catch((error) => {
				if (process.env.NODE_ENV === 'development')
					console.log('PROJECT DELETE FILE ERROR :>> ', error);
			});
	}

	await prisma.projectFile.delete({
		where: { id: req.query.fileId as string },
	});

	return res.status(200).json({
		status: 'success',
		message: 'Project file was deleted successfully!',
	});
});
