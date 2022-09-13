import { prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const { limit, offset } = validateParams(req.query);
	const [total, notifications] = await prisma.$transaction([
		prisma.notification.count({
			where: { recipientId: req.user.id },
		}),
		prisma.notification.findMany({
			skip: offset,
			take: limit,
			where: { recipientId: req.user.id },
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
		}),
	]);

	return res.status(200).json({
		status: 'success',
		message: 'Fetch notifications successfully. A total of ' + total,
		data: { total, result: notifications },
	});
});
