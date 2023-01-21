const logger = require("./logger.js");
const validators = require("./validators.js");

module.exports = {
	logger,
	...validators
}