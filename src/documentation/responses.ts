const responses = {
	"307": {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/BaseErrorRedirectModel"
				}
			}
		},
		description: "Redirect the user to another page"
	},
	"401": {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/BaseErrorModel",
				}
			}
		},
		description: "Authentication Failed"
	},
	"500": {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/BaseErrorModel"
				}
			}
		},
		description: "Internal Server Error"
	}
}

export default responses