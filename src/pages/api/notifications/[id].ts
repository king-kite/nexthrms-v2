import { prisma } from '../../../db';
import { auth } from '../../../middlewares';

export default auth().delete(async (req, res) => {
	const id = req.query.id as string;
	const notification = await prisma.notification.findUnique({
		where: {
			id,
		},
		select: {
			recipientId: true,
		},
	});
	if (!notification) {
		return res.status(404).json({
			status: 'error',
			message: 'Notification with specified ID does not exist',
		});
	}

	if (notification.recipientId !== req.user.id) {
		return res.status(403).json({
			status: 'error',
			message: 'You are forbidden from making this request.',
		});
	}

	await prisma.notification.delete({
		where: {
			id,
		},
	});

	return res.status(200).json({
		status: 'success',
		message: 'Notification was deleted successfully!',
	});
});
