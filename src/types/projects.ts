import {
	BaseResponseType,
	PaginatedResponseType,
	SuccessResponseType,
} from './base';

// ****** Project ******

export type ProjectType = {
	id: string;
	client: {
		id: string;
		company: string;
		position: string;
		contact: {
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: string;
			};
		};
	};
	name: string;
	description: string;
	completed: boolean;
	startDate: Date | string;
	endDate: Date | string;
	initialCost: number;
	rate: number;
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
	team: ProjectTeamType[];
	updatedAt: Date | string;
};

export type CreateProjectQueryType = {
	name: string;
	description: string;
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
	initialCost: number;
	rate: number;
	startDate: string;
	endDate: string;
	team?: {
		employeeId: string;
		isLeader: boolean;
	}[];
	client?: string;
	completed?: boolean;
};

export type CreateProjectErrorResponseType = {
	name?: string;
	client?: string;
	completed?: boolean;
	description?: string;
	startDate?: string;
	endDate?: string;
	initialCost?: string;
	rate?: string;
	priority?: string;
	team?: string;
};

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
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: string;
			};
		};
		job: {
			name: string;
		} | null;
	};
	isLeader: boolean;
};

export type GetProjectTeamResponseType = PaginatedResponseType<
	ProjectTeamType[]
>;

export type CreateProjectTeamQueryType = {
	team: {
		employeeId: string;
		isLeader: boolean;
	}[];
};

export type CreateProjectTeamResponseType = BaseResponseType;
// ****** Project Team ******

// ****** Project File ******

export type ProjectFileType = {
	id: string;
	name: string;
	file: string;
	size: number;
	type: string;
	project: {
		id: string;
		name: string;
	};
	employee: {
		id: string;
		user: {
			firstName: string;
			lastName: string;
			email: string;
		};
	};
	updatedAt: Date | string;
};

export type CreateProjectFileQueryType = {
	name: string;
	file: any; //File
};

export type CreateProjectFileErrorResponseType = {
	message?: string;
	name?: string;
	file?: string;
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
	followers: ProjectTeamType[];
	project: {
		id: string;
		name: string;
	};
	updatedAt: Date | string;
};

export type GetProjectTasksResponseType = SuccessResponseType<{
	total: number;
	result: ProjectTaskType[];
	completed: number;
	ongoing: number;
}>;

export type CreateProjectTaskQueryType = {
	name: string;
	description: string;
	dueDate: Date | string;
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
	followers?: {
		employeeId: string;
		isLeader?: boolean;
	}[];
	completed?: boolean;
};

export type CreateProjectTaskErrorResponseType = {
	message?: string;
	name?: string;
	description?: string;
	dueDate?: string;
	priority?: string;
	followers?: string;
};
// ****** Project Tasks ******
