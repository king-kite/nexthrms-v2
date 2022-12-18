export const BaseModel = {
	type: 'object',
	properties: {
		status: {
			type: 'string',
			description: "returns 'error' or 'success' or 'redirect' ",
		},
		message: {
			type: 'string'
		}
	},
	// additionalProperties: true
}

export const BaseErrorRedirectModel = {
	allOf: [
		{
			$ref: "#/components/schemas/BaseModel",
		},
		{
			type: "object",
			nullable: true,
			properties: {
				redirect: {
					type: 'object',
					properties: {
						url: {
							type: 'string',
							format: 'uri'
						}
					}
				}
			}
		}
	]
}