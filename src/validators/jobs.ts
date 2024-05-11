import { date, object, string } from 'yup';

import type { InferType } from 'yup';

export const createJobSchema = object({
  name: string().required().label('Name'),
  description: string().nullable().optional().label('Description'),
  startDate: date().nullable().optional().label('Start Date'),
  endDate: date().nullable().optional().label('End Date'),
  location: string().nullable().optional().label('Location'),
  type: string()
    .required()
    .oneOf(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'TEMPORARY', 'OTHER'])
    .label('Job Type'),
  departmentId: string().nullable().optional().label('Department ID'),
});

export type CreateJobType = InferType<typeof createJobSchema>;
