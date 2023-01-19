import parameters from '../../parameters';
import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters,
		responses: {
			...responses,
			'200': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											type: 'object',
											properties: {
												total: {
													type: 'number',
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.NOTIFICATION,
													},
												},
											},
										},
									},
								},
							],
						},
					},
				},
				description: 'Get Notifications',
			},
		},
		summary: 'Get Notifications',
		tags: [tags.Notifications],
	},
};

export default path;
