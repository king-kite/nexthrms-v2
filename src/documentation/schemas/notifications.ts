const userExample = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'johndoe@gmail.com',
	profile: {
		image: '/images/default.png'	
	}
}

const userModel = {
	type: 'object',
	properties: {
		firstName: {
			type: 'string'
		},
		lastName: {
			type: 'string'
		},
		email: {
			type: 'string',
			format: 'email'
		},
		profile: {
			type: 'object',
			nullable: true,
			properties: {
				image: {
					type: 'string'
				}
			}
		}
	}
}

export const NotificationModel = {
	type: 'object',
	required: ["name"],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		type: {
			type: 'string',
		},
		message: {
			type: 'string'
		},
		messageId: {
			type: 'string',
			format: 'uuid',
			nullable: true
		},
		read: {
			type: 'boolean',
		},
		title: {
			type: 'string'
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
		sender: userModel,
		recipient: userModel,
	},
	example: {
		id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		type: 'LEAVE',
		message: 'Hey I got a message for you',
		messageId: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		read: false,
		title: 'Someone sent a message',
		createdAt: '2001-03-10T00:00:00.000Z',
		sender: userExample,
		recipient: userExample,
	},
};
