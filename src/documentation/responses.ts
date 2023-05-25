import { exportDataParametersWithSearch } from './parameters';
import * as refs from './refs';

const responses = {
	'307': {
		content: {
			'application/json': {
				schema: {
					allOf: [{ $ref: refs.BASE }, { $ref: refs.BASE_ERROR_REDIRECT }],
				},
			},
		},
		description: 'Redirect the user to another page',
	},
	'401': {
		content: {
			'application/json': {
				schema: {
					$ref: refs.BASE,
				},
			},
		},
		description: 'Authentication Failed',
	},
	'403': {
		content: {
			'application/json': {
				schema: {
					$ref: refs.BASE,
				},
			},
		},
		description: 'Unauthorized',
	},
	'404': {
		content: {
			'application/json': {
				schema: {
					$ref: refs.BASE,
				},
			},
		},
		description: 'Not Found',
	},
	'500': {
		content: {
			'application/json': {
				schema: {
					$ref: refs.BASE,
				},
			},
		},
		description: 'Internal Server Error',
	},
};

export function getExportResponse({
	description,
	parameters,
	tags,
	title,
}: {
	description?: string;
	parameters?: {
		in: 'path' | 'query';
		name: string;
		description?: string;
		required?: boolean;
		schema?: {
			default?: any;
			type?: string;
			format?: string;
		};
	}[];
	tags: string[];
	title: string;
}) {
	return {
		get: {
			parameters: [...exportDataParametersWithSearch, ...(parameters || [])],
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
					description,
				},
			},
			summary: title,
			tags,
		},
	};
}

export function getImportResponse({
	description,
	parameters,
	tags,
	title: summary,
}: {
	description?: string;
	parameters?: {
		in: 'path' | 'query';
		name: string;
		required?: boolean;
		description?: string;
		schema?: {
			type?: string;
			format?: string;
		};
	}[];
	tags: string[];
	title: string;
}) {
	return {
		post: {
			parameters,
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
					description,
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
			summary,
			tags,
		},
	};
}

export default responses;
