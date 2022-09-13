import Joi from 'joi';

// Haven't used this yet though.

export const createNotificationSchema = Joi.object({
	message: Joi.string().required().label('Message'),
	messageId: Joi.string().optional().label('Message ID'),
	recipient: Joi.string().required().label('Recipient'),
	read: Joi.boolean().label('Read'),
	sender: Joi.string().required().label('Sender'),
	title: Joi.string().required().label('Title'),
	type: Joi.string().valid('LEAVE', 'OVERTIME').required().label('Type'),
});
