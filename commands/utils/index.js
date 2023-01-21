// const readline = require('readline').createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// });

// readline.question('Who are you?', name => {
// 	console.log(`Hey there ${name}!`);
// 	readline.close();
// })

const bcrypt = require("./bcrypt.js");
const logger = require("./logger.js");
const validators = require("./validators.js");

module.exports = {
	bcrypt,
	logger,
	...validators
}