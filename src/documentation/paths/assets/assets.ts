import responses from "../../responses";
import * as refs from "../../refs";
import * as tags from "../../tags";

import { AssetModel } from "../../schemas/assets";

const {user, id, updatedAt, ...assetProperties} = AssetModel.properties
const {id: eid, updatedAt: eupdatedAt, user: euser, ...assetExample } = AssetModel.example

export const content = {
	"application/json": {
		schema: {
			...AssetModel,
			required: [ ...AssetModel.required, 'userId'],
			properties: {
				...assetProperties,
				userId: {
					type: 'string',
					format: 'uuid'
				}
			},
			example: {
				...assetExample,
				userId: "3be85792-7bc0-44b6-ba80-4cfc6a14313b"
			}
		}
	}
}

export const errorProperties = {
	assetId: {
		type: 'string',
		nullable: true
	},
	condition: {
		type: 'string',
		nullable: true
	},
	description: {
		type: 'string',
		nullable: true
	},
	manufacturer: {
		type: 'string',
		nullable: true
	},
	model: {
		type: 'string',
		nullable: true,
	},
	name: {
		type: 'string',
		nullable: true
	},
	purchaseDate: {
		type: 'string',
		nullable: true
	},
	purchaseFrom: {
		type: 'string',
		nullable: true
	},
	serialNo: {
		type: 'string',
		nullable: true
	},
	supplier: {
		type: 'string',
		nullable: true
	},
	status: {
		type: 'string',
		nullable: true
	},
	userId: {
		type: 'string',
		nullable: true
	},
	warranty: {
		type: 'string',
		nullable: true
	},
	value: {
		type: 'string',
		nullable: true
	}
}

const path = {
	get: {
		parameters: [
			{
				in: 'query',
				name: 'limit',
				schema: {
					type: 'number',
					default: 10,
				}
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
					default: 0,
				}
			},
			{
				in: 'query',
				name: 'from',
				schema: {
					type: 'string',
					format: 'date-time'
				}
			},
			{
				in: 'query',
				name: 'to',
				schema: {
					type: 'string',
					format: 'date-time'
				}
			},
			{
				in: 'query',
				name: 'search',
				required: false,
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
													type: "array",
													items: {
														$ref: refs.ASSET,
													},
												}
											}
										}
									}
								}
							],
						},
					},
				}
			},
		},
		summary: "Get All Assets",
		tags: [tags.Assets],
	},
	post: {
		requestBody: {
			required: true,
			content,
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
											$ref: refs.ASSET,
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
											nullable: true,
											properties: errorProperties,
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: "Add new asset",
		tags: [tags.Assets],
	},
};

export default path;
