import responses from "../../responses";

import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											type: 'object',
											properties: {
												total: {
													type: 'number'
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.ATTENDANCE
													}
												},
											}
										}
									}
								},
							]
						}
					}
				}
			},
		},
		summary: 'Get All Attendance',
		tags: [tags.Attendance]
	}
}

export default path;