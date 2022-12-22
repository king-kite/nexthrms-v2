import { AuthDataType } from './auth';
import { PaginatedResponseType } from './base';

export type NotificationType = {
	id: string;
	type: 'LEAVE' | 'OVERTIME';
	sender: Omit<AuthDataType, "fullName" | "employee">;
	recipient: Omit<AuthDataType, "fullName" | "employee">;
	message: string;
	messageId: string | null;
	title: string;
	read: boolean;
	createdAt: Date;
};

export type GetNotificationResponseType = PaginatedResponseType<
	NotificationType[]
>;
