import Joi from 'joi';

export const projectCreateSchema = Joi.object({
	name: Joi.string().required().label('Name'),
	description: Joi.string().required().allow('').label('Description'),
	priority: Joi.string()
		.optional()
		.valid('HIGH', 'MEDIUM', 'LOW')
		.default('HIGH')
		.label('Priority'),
	initialCost: Joi.number().optional().default(0).label('Initial Cost'),
	rate: Joi.number().optional().default(0).label('Rate'),
	startDate: Joi.date().required().label('Start Date'),
	endDate: Joi.date().required().label('End Date'),
	completed: Joi.boolean().optional().label('Completed'),
	team: Joi.array()
		.items(
			Joi.object({
				id: Joi.string().uuid().optional().allow('').label('Team Member ID'),
				employeeId: Joi.string().uuid().required().label('Employee ID'),
				isLeader: Joi.boolean()
					.optional()
					.default(false)
					.label('Is Team Leader'),
			})
		)
		.optional()
		.label('Team'),
	client: Joi.string().uuid().optional().allow('').label('Client ID'),
});
