import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	post: {
		requestBody: {
			required: true,
			content: {
				'multipart/form-data': {
					schema: {
						type: 'object',
						properties: {
							data: {
								type: 'string',
								format: 'base64',
							},
						},
					},
					// encoding: {
					// 	image: {
					// 		contentType: 'image/*',
					// 	},
					// },
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
							$ref: refs.BASE,
						},
					},
				},
			},
		},
		summary: 'Import Assets Data',
		tags: [tags.Assets],
	},
};

export default path;
