import { ProjectPriority } from '@prisma/client';

import {
	BaseResponseType,
	PaginatedResponseType,
	SuccessResponseType,
} from './base';

// ****** Project ******

export type ProjectType = {
	id: string;
	client?: {
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
					url: string;
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
	priority: ProjectPriority;
	team: ProjectTeamType[];
	progress?: number; // In Decimal. Multiply by 100 to get percentage
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type ProjectImportQueryType = {
	id: string;
	client_id?: string | null;
	name: string;
	description: string;
	completed: boolean;
	start_date: Date | string;
	end_date: Date | string;
	initial_cost: number;
	rate: number;
	priority: ProjectPriority;
	created_at: Date | string;
	updated_at: Date | string;
};

export type CreateProjectQueryType = {
	name: string;
	description: string;
	priority: ProjectPriority;
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
	completed?: string;
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
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: {
					id: string;
					url: string;
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

export type ProjectTeamImportQueryType = {
	id?: string | null;
	is_leader: boolean;
	employee_id: string;
	project_id: string;
	created_at?: Date | string | null;
	updated_at?: Date | string | null;
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
	file: {
		id: string;
		name: string;
		url: string;
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

export type ProjectFileImportQueryType = {
	id?: string | null;
	name: string;
	file: string;
	file_id: string | null;
	size: number;
	storage_info_keys?: string | null;
	storage_info_values?: string | null;
	type: string;
	project_id: string;
	uploaded_by?: string | null;
	created_at?: Date | string | null;
	updated_at?: Date | string | null;
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
	priority: ProjectPriority;
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

export type ProjectTaskImportQueryType = {
	project_id: string;
	id?: string;
	name: string;
	description: string;
	completed?: boolean;
	priority: ProjectPriority;
	due_date: Date | string;
	created_at?: Date | string | null;
	updated_at?: Date | string | null;
};

export type ProjectTaskFollowerImportQueryType = {
	id?: string | null;
	is_leader: boolean;
	member_id: string;
	task_id: string;
	created_at?: Date | string | null;
	updated_at?: Date | string | null;
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

export type CreateProjectTaskQueryType = {
	name: string;
	description: string;
	dueDate: Date | string;
	priority: ProjectPriority;
	followers?: {
		memberId: string; // -> Project Team (Member) ID
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
	completed?: string;
};

export type CreateProjectTaskFollowersQueryType = {
	team: {
		memberId: string;
		isLeader: boolean;
	}[];
};
// ****** Project Tasks ******
