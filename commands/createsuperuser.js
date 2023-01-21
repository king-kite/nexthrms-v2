// const readline = require('readline').createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// });

// readline.question('Who are you?', name => {
// 	console.log(`Hey there ${name}!`);
// 	readline.close();
// })

const prompt = require("prompt-sync")({ sigint: true });

const { getEmail, getPassword, handleJoiError, logger } = require("./utils/index.js");

(async function main() {
	const fisrtName = prompt("Enter First Name: ");
	const lastName = prompt("Enter Last Name: ");
	const email = await getEmail();
	const password = await getPassword();

	console.log({ email, password, fisrtName, lastName })
})();
