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
				image: string;
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
			id: string;
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
	followers: {
		id: string;
		member: {
			id: string;
			employee: ProjectTeamType['employee'];
		};
		isLeader: boolean;
	}[];
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
	project: {
		id: string;
		name: string;
	};
}>;

export type CreateProjectTaskQueryType = {
	name: string;
	description: string;
	dueDate: Date | string;
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
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
