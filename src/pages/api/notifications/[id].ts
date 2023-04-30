import { prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { NextApiErrorMessage } from '../../../utils/classes';

export default auth()
	.use(async (req, res, next) => {
		const id = req.query.id as string;
		const notification = await prisma.notification.findUnique({
			where: {
				id,
			},
			select: {
				recipientId: true,
			},
		});

		if (!notification)
			throw new NextApiErrorMessage(
				404,
				'Notification with specified ID does not exist'
			);

		if (notification.recipientId !== req.user.id)
			throw new NextApiErrorMessage(403);
		next();
	})
	.get(async (req, res) => {
		const notification = await prisma.notification.findUnique({
			where: {
				id: req.query.id as string,
			},
			select: {
				createdAt: true,
				id: true,
				title: true,
				message: true,
				messageId: true,
				read: true,
				recipient: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
						profile: {
							select: {
								image: true,
							},
						},
					},
				},
				sender: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
						profile: {
							select: {
								image: true,
							},
						},
					},
				},
				type: true,
			},
		});
		if (!notification)
			throw new NextApiErrorMessage(
				404,
				'Notification with the specified was not found!'
			);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched notification successfully.',
			data: notification,
		});
	})
	.put(async (req, res) => {
		const { read } = req.body;

		await prisma.notification.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				read: !!read,
			},
			select: { id: true },
		});

		return res.status(200).json({
			status: 'success',
			message: 'Notification updated successfully',
		});
	})
	.delete(async (req, res) => {
		const id = req.query.id as string;

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
