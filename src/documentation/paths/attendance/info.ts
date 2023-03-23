import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

import { getStringedDate } from '../../../utils';

const path = {
	get: {
		parameters: [
			{
				in: 'query',
				name: 'date',
				schema: {
					type: 'string',
					format: 'date-time',
					default: getStringedDate(),
				},
			},
		],
		responses: {
			...responses,
			'200': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											type: 'object',
											properties: {
												timesheet: {
													nullable: true,
													$ref: refs.ATTENDANCE_INFO,
												},
												timeline: {
													type: 'array',
													items: {
														$ref: refs.ATTENDANCE_INFO,
													},
												},
												statistics: {
													type: 'array',
													items: {
														$ref: refs.ATTENDANCE_INFO,
													},
												},
											},
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: 'Get Attendance Info for the month',
		tags: [tags.Attendance],
	},
};

export default path;
