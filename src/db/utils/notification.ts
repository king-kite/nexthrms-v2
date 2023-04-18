import { NotificationChoices } from '@prisma/client';

import prisma from '../client';

export async function createNotification({
	message,
	recipient,
	sender,
	title,
	type = 'SUCCESS',
}: {
	message: string;
	recipient: string;
	sender?: string;
	title: string;
	type?: NotificationChoices;
}) {
	return prisma.notification.create({
		data: {
			message,
			recipientId: recipient,
			senderId: sender,
			title,
			type,
		},
	});
}
