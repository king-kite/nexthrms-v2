import { NotificationChoices } from '@prisma/client';

import prisma from '../client';

export async function createNotification({
	message,
	messageId,
	recipient,
	sender,
	title,
	type = 'ERROR',
}: {
	message: string;
	messageId?: string;
	recipient: string;
	sender?: string;
	title: string;
	type?: NotificationChoices;
}) {
	return prisma.notification.create({
		data: {
			message,
			messageId,
			recipientId: recipient,
			senderId: sender,
			title,
			type,
		},
	});
}
