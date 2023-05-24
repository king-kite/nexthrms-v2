import responses from "../../responses";
import * as refs from "../../refs";
import * as tags from "../../tags";

const path = {
	get: {
		parameters: [
			{
				in: "path",
				name: "projectId",
				required: true,
				schema: {
					type: "string",
					format: "uuid",
				},
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
									type: "object",
									properties: {
										data: {
											type: 'object',
											properties: {
												result: {
													type: "array",
													items: {
														$ref: refs.PROJECT_FILE,
													},
												},
											}
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: "Get Project Files",
		tags: [tags.Projects],
	},
	post: {
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
		requestBody: {
			required: true,
			content: {
				"multipart/form-data": {
					schema: {
						type: "object",
						properties: {
							file: {
								type: "string",
								format: "base64",
							},
							name: {
								type: 'string'
							},
						},
					},
					encoding: {
						file: {
							contentType: "*",
						},
					},
				},
			},
		},
		responses: {
			...responses,
			"201": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: "object",
									properties: {
										data: {
											$ref: refs.PROJECT_FILE,
										},
									},
								},
							],
						},
					},
				},
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: "object",
									properties: {
										error: {
											type: "object",
											properties: {
												name: {
													type: "string",
													nullable: true,
												},
												file: {
													type: "string",
													nullable: true,
												},
												message: {
													type: "string",
													nullable: true,
												}
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
		summary: "Add a new Project File",
		tags: [tags.Projects],
	},
};

export default path;
