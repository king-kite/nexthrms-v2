import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			},
			{
				in: 'query',
				name: 'limit',
				schema: {
					type: 'number',
					default: 10
				}
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
					default: 0
				}
			},
			{
				in: 'query',
				name: 'search',
				schema: {
					type: 'string',
				}
			},
		],
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
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
													type: 'number'
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.PROJECT_TEAM
													}
												}
											}
										}
									}
								}
							]
						}
					}
				}
			}
		},
		summary: 'Get Project Team',
		tags: [tags.Projects]
	}
};

export default path;