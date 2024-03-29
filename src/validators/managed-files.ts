import { InferType, array, mixed, object, string } from 'yup';

export const managedFileCreateSchema = object({
  name: string().required().label('Name'),
  directory: string().nullable().optional().label('Directory'),
  file: mixed().nullable().optional().label('File'),
  type: string().oneOf(['file', 'folder']).required().label('Type'),
});

export const deleteManagedFilesSchema = object({
  folder: string().nullable().optional().label('Folder'),
  files: array().of(string().required()).nullable().optional().label('Files'),
});

export type CreateManagedFileType = InferType<typeof managedFileCreateSchema>;
export type DeleteManagedFilesType = InferType<typeof deleteManagedFilesSchema>;
