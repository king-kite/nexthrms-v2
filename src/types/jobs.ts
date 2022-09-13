import { PaginatedResponseType, SuccessResponseType } from './base';

export type JobType = {
	id: string;
	name: string;
};

export type CreateJobResponseType = SuccessResponseType<JobType>;

export type GetJobsResponseType = PaginatedResponseType<JobType[]>;
