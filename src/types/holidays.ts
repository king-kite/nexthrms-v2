import { PaginatedResponseType, ValidatorErrorType } from './base';
import { CreateHolidayType } from '../validators/holidays';

export type HolidayType = {
	id: string;
	date: Date | string;
	name: string;
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type HolidayImportQueryType = {
	id: string;
	name: string;
	date: string;
	created_at?: string;
	updated_at?: string;
};

export type HolidayCreateType = CreateHolidayType;

export type HolidayCreateErrorType = ValidatorErrorType<HolidayCreateType>;

export type GetHolidaysResponseType = PaginatedResponseType<HolidayType[]>;
