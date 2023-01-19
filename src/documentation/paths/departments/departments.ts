import { parametersWithSearch as parameters } from "../../parameters"
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
														$ref: refs.DEPARTMENT,
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
				description: 'Get All Departments Information',
			},
		},
		summary: 'Get All Departments',
		tags: [tags.Departments],
	},
	post: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							name: {
								type: 'string',
							},
							hod: {
								type: 'string',
								nullable: true,
							},
						},
						example: {
							name: 'Engineering',
							hod: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
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
											$ref: refs.DEPARTMENT,
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
												name: {
													type: 'string',
													nullable: true,
												},
												hod: {
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
		summary: 'Create new department',
		tags: [tags.Departments],
	},
	delete: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							values: {
								type: 'array',
								items: {
									type: 'string',
									format: 'uuid',
								},
							},
						},
						example: {
							values: [
								'e0c55c26-e5b8-41a2-8269-13881ad7b563',
								'169f1878-88c2-4828-a3de-bc61f9f7d2dd',
							],
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
												values: {
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
		summary: 'Delete Multiple Departments',
		tags: [tags.Departments],
	},
};

export default path;
