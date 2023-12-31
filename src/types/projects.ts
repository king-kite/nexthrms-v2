import {
	ResponseType,
	PaginatedResponseType,
	SuccessResponseType,
	ValidatorErrorType,
} from './base';
import type {
	ProjectCreateType,
	ProjectFileCreateType,
	ProjectTeamCreateType,
	ProjectTaskCreateType,
	ProjectTaskFollowersCreateType,
} from '../validators/projects';

// ****** Project ******

export type ProjectType = {
	id: string;
	client: {
		id: string;
		company: string;
		position: string;
		contact: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: {
					id: string;
					location: string;
					url: string | null;
				} | null;
			};
		};
	} | null;
	name: string;
	description: string;
	completed: boolean;
	startDate: Date | string;
	endDate: Date | string;
	initialCost: number;
	rate: number;
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
	team: ProjectTeamType[];
	progress?: number; // In Decimal. Multiply by 100 to get percentage
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type CreateProjectQueryType = Omit<ProjectCreateType, 'startDate' | 'endDate'> & {
	startDate: Date | string;
	endDate: Date | string;
};

export type CreateProjectErrorResponseType = ValidatorErrorType<CreateProjectQueryType>;

export type GetProjectsResponseType = SuccessResponseType<{
	result: ProjectType[];
	total: number;
	completed: number;
	ongoing: number;
}>;
// ****** Project ******

// ****** Project Team ******
export type ProjectTeamType = {
	id: string;
	employee: {
		id: string;
		user: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: {
					id: string;
					location: string;
					url: string | null;
				} | null;
			};
		};
		job: {
			name: string;
		} | null;
	};
	isLeader: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type GetProjectTeamResponseType = SuccessResponseType<{
	total: number;
	result: ProjectTeamType[];
	project: {
		id: string;
		name: string;
		client: {
			id: string;
			company: string;
			position: string;
			contact: {
				id: string;
				firstName: string;
				lastName: string;
				email: string;
				profile: {
					image: {
						id: string;
						url: string | null;
						location: string;
					} | null;
				} | null;
			};
		} | null;
	};
}>;

export type CreateProjectTeamQueryType = ProjectTeamCreateType;

export type CreateProjectTeamResponseType = ResponseType;
// ****** Project Team ******

// ****** Project File ******

export type ProjectFileType = {
	id: string;
	file: {
		id: string;
		location: string;
		name: string;
		url: string | null;
		size: number;
		type: string;
	};
	project: {
		id: string;
		name: string;
	};
	employee: {
		id: string;
		user: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
		};
	};
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type CreateProjectFileQueryType = ProjectFileCreateType;

export type CreateProjectFileErrorResponseType = Omit<
	ValidatorErrorType<ProjectFileCreateType>,
	'file'
> & {
	message?: string;
	file?:
		| string
		| {
				url?: string;
		  };
};

export type GetProjectFilesResponseType = SuccessResponseType<{
	result: ProjectFileType[];
}>;
// ****** Project File ******

// ****** Project Tasks ******
export type ProjectTaskType = {
	id: string;
	name: string;
	description: string;
	completed: boolean;
	dueDate: Date | string;
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
	followers: ProjectTaskFollowerType[];
	project: {
		id: string;
		name: string;
	};
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type ProjectTaskFollowerType = {
	id: string;
	member: {
		id: string;
		employee: ProjectTeamType['employee'];
	};
	isLeader: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type GetProjectTasksResponseType = SuccessResponseType<{
	total: number;
	result: ProjectTaskType[];
	completed: number;
	ongoing: number;
	project: {
		id: string;
		name: string;
	};
}>;

export type GetProjectTaskFollowersResponseType = SuccessResponseType<{
	total: number;
	result: ProjectTeamType[];
	task: {
		id: string;
		name: string;
		project: {
			id: string;
			name: string;
		};
	};
}>;

export type CreateProjectTaskQueryType = Omit<ProjectTaskCreateType, 'dueDate'> & {
	dueDate: Date | string;
};

export type CreateProjectTaskErrorResponseType = ValidatorErrorType<ProjectTaskCreateType> & {
	message?: string;
};

export type CreateProjectTaskFollowersQueryType = ProjectTaskFollowersCreateType;
// ****** Project Tasks ******
