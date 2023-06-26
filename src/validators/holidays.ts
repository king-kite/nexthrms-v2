import { InferType, date, object, string } from 'yup';

export const createHolidaySchema = object({
	name: string().required().label('Name'),
	date: date().required().label('Date'),
});

export type CreateHolidayType = InferType<typeof createHolidaySchema>;
