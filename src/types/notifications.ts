import { PaginatedResponseType } from './base';

export type ParticipantType = {
	firstName: string;
	lastName: string;
	email: string;
	profile: {
		image: {
			id: string;
			location: string;
			url: string | null;
		} | null;
	};
};

type NotificationChoices = 'DOWNLOAD' | 'ERROR' | 'LEAVE' | 'OVERTIME' | 'SUCCESS';

export type NotificationType = {
	id: string;
	type: NotificationChoices;
	sender: ParticipantType;
	recipient: ParticipantType;
	message: string;
	messageId: string | null;
	title: string;
	read: boolean;
	createdAt: Date;
};

export type GetNotificationResponseType = PaginatedResponseType<NotificationType[]>;
