import { InferType, array, boolean, date, mixed, number, object, string } from 'yup';

export const projectCreateSchema = object({
	name: string().required().label('Name'),
	description: string().nullable().optional().label('Description'),
	priority: string().optional().oneOf(['HIGH', 'MEDIUM', 'LOW']).default('HIGH').label('Priority'),
	initialCost: number().min(0).optional().default(0).label('Initial Cost'),
	rate: number().min(0).optional().default(0).label('Rate'),
	startDate: date().required().label('Start Date'),
	endDate: date().required().label('End Date'),
	completed: boolean().optional().label('Completed'),
	team: array()
		.of(
			object({
				// id: Joi.string().uuid().optional().allow('').label('Team Member ID'),
				employeeId: string().uuid().required().label('Employee ID'),
				isLeader: boolean().optional().default(false).label('Is Team Leader'),
			})
		)
		.optional()
		.label('Team'),
	client: string().uuid().nullable().optional().label('Client ID'),
});

export const projectFileCreateSchema = object({
	name: string().required().label('Name'),
	file: mixed().label('File'),
});

export const projectTeamCreateSchema = object({
	team: array()
		.of(
			object({
				employeeId: string().uuid().required().label('Employee ID'),
				isLeader: boolean().optional().label('Is Team Leader'),
			})
		)
		.required()
		.label('Team'),
});

export const projectTeamMemberUpdateSchema = object({
	employeeId: string().uuid().required().label('Employee ID'),
	isLeader: boolean().optional().label('Is Team Leader'),
});

export const taskCreateSchema = object({
	name: string().required().label('Name'),
	description: string().nullable().optional().label('Description'),
	priority: string().optional().oneOf(['HIGH', 'MEDIUM', 'LOW']).default('HIGH').label('Priority'),
	dueDate: date().required().label('Due Date'),
	completed: boolean().optional().label('Completed'),
	followers: array()
		.of(
			object({
				// id: Joi.string().uuid().optional().allow('').label('Team Member ID'),
				memberId: string().uuid().required().label('Team Member ID'),
				isLeader: boolean().optional().default(false).label('Is Task Leader'),
			})
		)
		.optional()
		.label('Followers'),
});

export const projectTaskFollowersCreateSchema = object({
	team: array()
		.of(
			object({
				memberId: string().uuid().required().label('Team Member ID'),
				isLeader: boolean().optional().label('Is Team Leader'),
			})
		)
		.required()
		.label('Team'),
});

export const projectTaskFollowerUpdateSchema = object({
	memberId: string().uuid().required().label('Team Member ID'),
	isLeader: boolean().optional().label('Is Team Leader'),
});

export type ProjectCreateType = InferType<typeof projectCreateSchema>;
export type ProjectFileCreateType = InferType<typeof projectFileCreateSchema>;
export type ProjectTeamCreateType = InferType<typeof projectTeamCreateSchema>;
export type ProjectTeamMemberUpdateType = InferType<typeof projectTeamMemberUpdateSchema>;
export type ProjectTaskCreateType = InferType<typeof taskCreateSchema>;
export type ProjectTaskFollowersCreateType = InferType<typeof projectTaskFollowersCreateSchema>;
export type ProjectTaskFollowerUpdateType = InferType<typeof projectTaskFollowerUpdateSchema>;
