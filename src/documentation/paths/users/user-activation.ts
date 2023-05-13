import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	post: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['emails', 'action'],
						properties: {
							emails: {
								type: 'array',
								items: {
									type: 'string',
									format: 'email',
								},
							},
							action: {
								type: 'string',
								format: "'activate' | 'deactivate'",
							},
						},
						example: {
							emails: ['jandoe@kitehrms.com'],
							action: 'activate',
						},
					},
				},
			},
		},
		responses: {
			...responses,
			'200': {
				content: {
					'application/json': {
						schema: {
							$ref: refs.BASE,
						},
					},
				},
			},
			'400': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										error: {
											type: 'object',
											nullable: true,
											properties: {
												emails: {
													type: 'string',
													nullable: true,
												},
												action: {
													type: 'string',
													nullable: true,
												},
											},
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: 'Activate or Deactivate User',
		tags: [tags.Users],
	},
};

export default path;
