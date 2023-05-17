import { exportDataParametersWithSearch as parameters } from '../../parameters';
import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters,
		responses: {
			...responses,
			'200': {
				content: {
					'application/json': {
						schema: {
							$ref: refs.BASE,
						},
					},
				},
				description: 'Export Assets Information',
			},
		},
		summary: 'Export Assets Data',
		tags: [tags.Assets],
	},
};

export default path;
