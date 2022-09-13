import { AuthDataType } from './auth';
import { PaginatedResponseType } from './base';

export type NotificationType = {
	id: string;
	type: 'LEAVE' | 'OVERTIME';
	sender: AuthDataType;
	recipient: AuthDataType;
	message: string;
	messageId: string | null;
	title: string;
	read: boolean;
	createdAt: Date;
};

export type GetNotificationResponseType = PaginatedResponseType<
	NotificationType[]
>;
