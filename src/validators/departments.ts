import { InferType, object, string } from 'yup';

export const createDepartmentSchema = object({
  name: string().required().label('Name'),
  hod: string().nullable().label('Head Of Department'),
});

export type CreateDepartmentType = InferType<typeof createDepartmentSchema>;
