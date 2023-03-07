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

export default responses;
