import { InferType, boolean, string, object } from 'yup';

// Haven't used this yet though.

export const createNotificationSchema = object({
	message: string().required().label('Message'),
	messageId: string().nullable().optional().label('Message ID'),
	recipient: string().required().label('Recipient'),
	read: boolean().label('Read'),
	sender: string().required().label('Sender'),
	title: string().required().label('Title'),
	type: string().oneOf(['LEAVE', 'OVERTIME']).required().label('Type'),
});

export type CreateNotificationType = InferType<typeof createNotificationSchema>;
