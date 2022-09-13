import { SuccessResponseType } from './base';

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

export type ProjectType = {
	id: string;
	client: {
		id: string;
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
