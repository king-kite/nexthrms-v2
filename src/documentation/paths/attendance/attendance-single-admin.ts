import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
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
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.ATTENDANCE,
										},
									},
								},
							],
						},
					},
				},
				description: 'Get Single Attendance Information',
			},
			'404': {
				content: {
					'application/json': {
						schema: {
							$ref: refs.BASE,
						},
					},
				},
			},
		},
		summary: 'Get Single Attendance',
		tags: [tags.Attendance],
	},
	put: {
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
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							employee: {
								type: 'string',
								format: 'uuid',
							},
							date: {
								type: 'string',
								format: 'date-time',
							},
							punchIn: {
								type: 'string',
								format: 'date-time',
							},
							punchOut: {
								nullable: true,
								type: 'string',
								format: 'date-time',
							},
							overtime: {
								type: 'object',
								nullable: true,
								properties: {
									hours: {
										type: 'number',
									},
									reason: {
										type: 'string',
									},
								},
							},
						},
						example: {
							employee: 'aace576f-ad6e-4166-ab05-9751f922e3f0',
							date: '2022-12-10T00:00:00.224Z',
							punchIn: '1970-01-01T07:00:00.224Z',
							punchOut: '1970-01-01T17:00:00.224Z',
							overtime: {
								hours: 10,
								reason: 'This is the reason for this leave.',
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
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.ATTENDANCE,
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
											properties: {
												date: {
													nullable: true,
													type: 'string',
												},
												employee: {
													nullable: true,
													type: 'string',
												},
												punchIn: {
													nullable: true,
													type: 'string',
												},
												punchOut: {
													nullable: true,
													type: 'string',
												},
												overtime: {
													type: 'object',
													nullable: true,
													properties: {
														hours: {
															nullable: true,
															type: 'string',
														},
														reason: {
															nullable: true,
															type: 'string',
														},
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
			},
		},
		summary: 'Updated Single Attendance',
		tags: [tags.Attendance],
	},
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
		summary: 'Delete Single Attendance',
		tags: [tags.Attendance],
	},
};

export default path;
