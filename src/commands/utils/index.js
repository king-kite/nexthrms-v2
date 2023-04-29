// const readline = require('readline').createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// });

// readline.question('Who are you?', name => {
// 	console.log(`Hey there ${name}!`);
// 	readline.close();
// })

const bcrypt = require('./bcrypt.js');
const models = [
	'assets',
	'attendance',
	'clients',
	'departments',
	'employees',
	'groups',
	'holiday',
	'jobs',
	'leaves',
	'managed_files',
	'overtime',
	'permissions',
	'projects',
	'projects_files',
	'projects_tasks',
	'users',
];
const logger = require('./logger.js');
const validators = require('./validators.js');

module.exports = {
	anonymousUserEmail: 'anonymous@kitehrms.com',
	anonymousUserId: '12345678-1234-4b89-8c04-789012345678',
	bcrypt,
	models,
	logger,
	...validators,
};
