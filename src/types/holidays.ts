import { PaginatedResponseType } from './base';

export type HolidayType = {
	id: string;
	date: Date | string;
	name: string;
};

export type GetHolidaysResponseType = PaginatedResponseType<HolidayType[]>;
