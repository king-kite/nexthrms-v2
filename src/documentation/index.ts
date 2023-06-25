import paths from './paths';
import * as schemas from './schemas';

const documentation = {
	openapi: '3.0.0',
	info: {
		description:
			'Kite Human Resource Management System. A human resource management system built using NextJs and Typescript',
		title: 'Kite HRMS',
		version: '1.0',
		contact: {
			name: 'Emmanuel (Kite)',
			email: 'emmanuel.kolade1@gmail.com',
			url: 'https://github.com/king-kite',
		},
	},
	paths,
	components: {
		schemas,
		// securitySchemes: {
		// 				// 	cookieAuth: {
		// 				// 		type: 'apiKey',
		// 				// 		in: 'cookie',
		// 				// 		name: ACCESS_TOKEN
		// 				// 	}
		// 				// }
	},
	// security: [
	// 			// 	{ cookieAuth: [] }
	// 			// ]
};

export default documentation;
