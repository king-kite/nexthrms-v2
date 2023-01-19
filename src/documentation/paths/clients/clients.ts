import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

import { ClientModel } from '../../schemas/clients';

const { id: propId, ...clientProps } = ClientModel.properties;
const { id: expId, ...clientExp } = ClientModel.example;

// Remove the isActive key and value;
const { isActive: propIsActive, ...clientContactProperties } =
  ClientModel.properties.contact.properties;
const { isActive: expIsActive, ...clientContactExample } =
  ClientModel.example.contact;

export const clientProperties = {
  ...clientProps,
  contact: {
    ...clientProps.contact,
    properties: clientContactProperties,
  },
};

export const clientExample = {
  ...clientExp,
  contact: clientContactExample
};

const path = {
	get: {
		parameters: [
			{
				in: 'query',
				name: 'limit',
				schema: {
					type: 'number',
					default: 10,
				},
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
					default: 0,
				},
			},
			{
				in: 'query',
				name: 'search',
				required: false,
				schema: {
					type: 'string',
				},
			},
			{
				in: 'query',
				name: 'from',
				required: false,
				schema: {
					type: 'date-time',
				},
			},
			{
				in: 'query',
				name: 'to',
				required: false,
				schema: {
					type: 'date-time',
          default: new Date().toLocaleDateString('en-Ca')
				},
			},
		],
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
												active: {
													type: 'number',
												},
												inactive: {
													type: 'number',
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.CLIENT,
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
				description: 'Get All Clients Information',
			},
		},
		summary: 'Get All Clients',
		tags: [tags.Clients],
	},
	post: {
		requestBody: {
			required: true,
			content: {
				'multipart/form-data': {
					schema: {
						type: 'object',
						properties: {
							image: {
								type: 'string',
								format: 'base64',
							},
							form: {
								type: 'object',
								required: ['company', 'position'],
								properties: {
									...clientProperties,
									contactId: {
										type: 'string',
										format: 'uuid',
										nullable: true,
									},
								},
								example: {
									...clientExample,
									contactId: null,
								},
							},
						},
					},
					encoding: {
						image: {
							contentType: 'image/*',
						},
					},
				},
			},
		},
		responses: {
			...responses,
			'201': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.CLIENT,
										},
									},
								},
							],
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
												firstName: {
													type: 'string',
													nullable: true,
												},
												lastName: {
													type: 'string',
													nullable: true,
												},
												email: {
													type: 'string',
													nullable: true,
												},
												phone: {
													type: 'string',
													nullable: true,
												},
												image: {
													type: 'string',
													nullable: true,
												},
												gender: {
													type: 'string',
													nullable: true,
												},
												address: {
													type: 'string',
													nullable: true,
												},
												state: {
													type: 'string',
													nullable: true,
												},
												city: {
													type: 'string',
													nullable: true,
												},
												contactId: {
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
		summary: 'Create new client',
		tags: [tags.Clients],
	},
};

export default path;
