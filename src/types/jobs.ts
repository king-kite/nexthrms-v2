import { PaginatedResponseType, SuccessResponseType } from './base';

export type JobType = {
	id: string;
	name: string;
	updatedAt: Date | string;
	createdAt: Date | string;
};

export type JobImportQueryType = {
	id?: string | null;
	name: string;
	updated_at?: Date | string | null;
	created_at?: Date | string | null;
};

export type CreateJobResponseType = SuccessResponseType<JobType>;

export type GetJobsResponseType = PaginatedResponseType<JobType[]>;
