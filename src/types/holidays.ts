import { PaginatedResponseType, ValidatorErrorType } from './base';
import { CreateHolidayType } from '../validators/holidays';

export type HolidayType = {
	id: string;
	date: Date | string;
	name: string;
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type HolidayCreateType = CreateHolidayType;

export type HolidayCreateErrorType = ValidatorErrorType<HolidayCreateType>;

export type GetHolidaysResponseType = PaginatedResponseType<HolidayType[]>;
