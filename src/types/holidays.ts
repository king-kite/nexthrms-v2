import { PaginatedResponseType } from './base';

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

export type GetHolidaysResponseType = PaginatedResponseType<HolidayType[]>;
