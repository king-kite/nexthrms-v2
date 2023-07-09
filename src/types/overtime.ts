import { LeaveStatus, OvertimeChoices } from '@prisma/client';

import { ValidatorErrorType, SuccessResponseType } from './base';
import { OvertimeCreateType } from '../validators/overtime';

import type { OvertimeType } from '../db/queries/overtime';
export type { OvertimeType } from '../db/queries/overtime';

export type OvertimeImportQueryType = {
	id?: string;
	employee: string; // employee email
	type: OvertimeChoices;
	date: string;
	hours: number;
	reason: string;
	status: LeaveStatus;
	created_by?: string;
	approved_by?: string;
	updated_at?: string;
	created_at?: string;
};

export type GetAllOvertimeResponseType = SuccessResponseType<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: OvertimeType[];
}>;

export type CreateOvertimeQueryType = OvertimeCreateType;

export type CreateOvertimeErrorResponseType =
	ValidatorErrorType<CreateOvertimeQueryType>;
