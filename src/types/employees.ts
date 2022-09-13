import { PaginatedResponseType, SuccessResponseType } from './base';

type UserDataType = {
	firstName: string;
	lastName: string;
	email: string;
	profile: {
		image: string;
	} | null;
	isActive: boolean;
};

export type CreateEmployeeQueryType = {
	dateEmployed: string;
	department: string;
	job: string;
	supervisor: string | null;
	user: {
		email: string;
		firstName: string;
		lastName: string;
		profile: {
			phone: string;
			gender: 'MALE' | 'FEMALE';
			image: string;
			address: string;
			state: string;
			city: string;
			dob: string;
		};
	} | null;
	userId: string | null;
};

export type CreateEmployeeErrorResponseType = {
	dateEmployed?: string;
	department?: string;
	job?: string;
	supervisor?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	gender?: string;
	image?: string;
	address?: string;
	state?: string;
	city?: string;
	dob?: string;
	userId?: string;
};

interface EmployeeUserType extends UserDataType {
	profile: {
		dob: string | null;
		gender: 'MALE' | 'FEMALE';
		image: string;
		address: string | null;
		city: string | null;
		phone: string | null;
		state: string | null;
	} | null;
}

export type EmployeeType = {
	id: string;
	dateEmployed: Date | string;
	department: {
		id: string;
		name: string;
		hod: { user: UserDataType } | null;
	} | null;
	job: {
		id: string;
		name: string;
	} | null;
	user: EmployeeUserType;
	supervisor: {
		id: string;
		department: {
			name: string;
		} | null;
		user: UserDataType;
	} | null;
	leaves: {
		startDate: Date | string;
		endDate: Date | string;
		reason: string;
		type: string;
		approved: boolean;
	}[];
};
export type CreateEmployeeResponseType = SuccessResponseType<EmployeeType>;

export interface GetEmployeesResponseType
	extends PaginatedResponseType<EmployeeType[]> {
	total: number;
	result: EmployeeType[];
	active: number;
	inactive: number;
	on_leave: number;
}

// Delete the ones below later

import { DataListType, PaginationType } from './common';
import { DepartmentType } from './departments';
import { _ProfileType, ProfileDataType, UserType } from './user';

export type AttendanceDayType = {
	id: string;
	date: string;
	punch_in: string;
	punch_out?: string;
	hours?: number;
} | null;

export type AttendanceWeekType = {
	mon: AttendanceDayType;
	tue: AttendanceDayType;
	wed: AttendanceDayType;
	thu: AttendanceDayType;
	fri: AttendanceDayType;
};

export type AttendanceStatisticsType = {
	today?: number;
	week?: number;
	month?: number;
	remaining?: number;
	overtime?: number;
};

export type AttendanceInfoType = {
	hours_spent_today?: AttendanceDayType;
	overtime_hours?: number;
	week_hours?: AttendanceWeekType;
	statistics?: AttendanceStatisticsType;
};

export interface AttendanceListType extends DataListType {
	results: AttendanceType[];
}

export type AttendanceType = {
	id: string;
	date: string;
	punch_in: string;
	punch_out?: string;
	production?: string;
	break?: number;
	overtime?: number;
};

export interface ContactInfoType
	extends Omit<UserType, 'full_name' | 'active'> {
	full_name?: string;
	active?: boolean;
	profile: ProfileDataType;
}

export type _ClientType = {
	id: string;
	company: string;
	position: string;
	contact: ContactInfoType;
};

export interface UserEmployeeType extends UserType {
	id: string;
	job: string;
}

export type _ProjectType = {
	id: string;
	client: _ClientType;
	leaders: UserEmployeeType[];
	team: UserEmployeeType[];
	created_by: UserEmployeeType;
	name: string;
	start_date: string;
	end_date: string;
	initial_cost: number;
	rate: number;
	priority: string;
	// priority: "H" | "M" | "L";
	description: string;
	completed: boolean;
	is_active: boolean;
	tasks: {
		id: string;
		name: string;
		completed: boolean;
	}[];
	files: ProjectFileType[];
};

export type ProjectCreateType = {
	client?: string;
	leaders: { id: string }[];
	team: { id: string }[];
	name: string;
	start_date: string;
	end_date: string;
	initial_cost: number;
	rate: number;
	priority: string;
	description: string;
};

export type ProjectCreateErrorType = {
	client: string;
	leaders: string;
	team: string;
	name: string;
	start_date: string;
	end_date: string;
	initial_cost: string;
	rate: string;
	priority: string;
	description: string;
};

export interface ProjectListType extends DataListType {
	total?: number;
	completed?: number;
	ongoing?: number;
	results: _ProjectType[];
}

export type TaskType = {
	id: string;
	project: {
		id: string;
		name: string;
	};
	completed: boolean;
	verified: boolean;
	name: string;
	description: string;
	priority: string;
	followers: UserEmployeeType[];
	leaders: UserEmployeeType[];
	created_by: UserEmployeeType;
	create_date: string;
	due_date: string;
};

export interface TaskListType extends DataListType {
	project: {
		name: string;
		id: string;
	};
	total: number;
	completed: number;
	verified: number;
	count: number;
	ongoing: number;
	results: TaskType[];
}

export type TaskCreateType = {
	leaders: { id: string }[];
	followers: { id: string }[];
	name: string;
	due_date: string;
	priority: string;
	description: string;
};

export type TaskFormInitStateType = {
	name: string;
	due_date: string;
	priority: string;
	followers: string[];
	leaders: string[];
	description: string;
};

export type TaskCreateErrorType = {
	leaders: string;
	followers: string;
	name: string;
	due_date: string;
	priority: string;
	description: string;
};

export type ProjectFileType = {
	id: number;
	project: {
		id: string;
		name: string;
	};
	name: string;
	file_type: string;
	file: string;
	size: number;
	date: string;
	uploaded_by: {
		name: string;
		id: string;
	};
};

export type ProjectFileCreateType = {
	name: string;
	file: any;
};

export type ProjectFileCreateErrorType = {
	name: string;
	file: string;
};
