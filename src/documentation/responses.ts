import * as refs from "./responses"

const responses = {
	"307": {
		content: {
			"application/json": {
				schema: {
					$ref: refs.BASE_ERROR_REDIRECT
				}
			}
		},
		description: "Redirect the user to another page"
	},
	"401": {
		content: {
			"application/json": {
				schema: {
					$ref: refs.BASE,
				}
			}
		},
		description: "Authentication Failed"
	},
	"500": {
		content: {
			"application/json": {
				schema: {
					$ref: refs.BASE,
				}
			}
		},
		description: "Internal Server Error"
	}
}

export default responses