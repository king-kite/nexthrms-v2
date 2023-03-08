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
	'overtime',
	'permissions',
	'projects',
	'projects_files',
	'projects_tasks',
	'projects_tasks_followers',
	'projects_team',
	'users',
];
const logger = require('./logger.js');
const validators = require('./validators.js');

module.exports = {
	anonymousUserId: '12345678-1234-4b89-8c04-789012345678',
	bcrypt,
	models,
	logger,
	...validators,
};
