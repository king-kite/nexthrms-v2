import { NotificationChoices } from '@prisma/client';

import prisma from '..';
import { handlePrismaErrors } from '../../validators';

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

export function handleNotificationErrors(
	error: { status: number; data: string | unknown } | any,
	options: {
		title: string;
		recipient: string;
	}
) {
	if (!error) return;
	let message = '';
	if (error.status) {
		message =
			typeof error.data !== 'string'
				? process.env.NODE_ENV === 'development'
					? 'A server error occurred. Unable to import assets data from excel file. ' +
					  (error.data as any)?.message
					: 'A server error occurred. Unable to import assets data from excel file.'
				: error.data;
	} else {
		const err = handlePrismaErrors(error);
		message = err.message;
	}
	let title = options.title;
	if ((error as any).data?.title) title = error.data.title;
	createNotification({
		message,
		recipient: options.recipient,
		title,
		type: 'ERROR',
	});
}
