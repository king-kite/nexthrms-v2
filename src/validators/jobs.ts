import { InferType, object, string } from 'yup';

export const createJobSchema = object({
	name: string().required().label('Name'),
});

export type CreateJobType = InferType<typeof createJobSchema>;
