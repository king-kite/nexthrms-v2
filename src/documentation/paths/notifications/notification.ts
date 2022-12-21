import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	delete: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid',
				},
			},
		],
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
		},
		summary: 'Delete Single Notification',
		tags: [tags.Notifications],
	},
};

export default path;
