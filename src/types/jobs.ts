import { PaginatedResponseType, SuccessResponseType, ValidatorErrorType } from './base';
import { CreateJobType } from '../validators/jobs';

export type JobType = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  location: string | null;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'TEMPORARY' | 'OTHER';
  department: {
    id: string;
    name: string;
  } | null;
  updatedAt: Date | string;
  createdAt: Date | string;
};

export const jobSelect = {
  id: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  location: true,
  type: true,
  department: {
    select: {
      id: true,
      name: true,
    },
  },
  updatedAt: true,
  createdAt: true,
};

export type JobCreateType = CreateJobType;

export type JobCreateErrorType = ValidatorErrorType<JobCreateType>;

export type CreateJobResponseType = SuccessResponseType<JobType>;

export type GetJobsResponseType = PaginatedResponseType<JobType[]>;
