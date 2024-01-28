import { InferType, array, boolean, date, mixed, object, string } from 'yup';

import { passwordOptions } from './auth';

export const changeUserPasswordSchema = object({
  email: string().email().required().label('Email'),
  password1: passwordOptions.required().label('New Password'),
  password2: string().required().label('Confirm Password'),
});

export const createGroupSchema = object({
  name: string().required().label('Name'),
  description: string().nullable().optional().label('Description'),
  active: boolean().optional().label('Active'),
  permissions: array().of(string()).optional().label('Permissions'),
  users: array().of(string()).optional().label('Users'),
});

export const createPermissionSchema = object({
  codename: string().required().label('Code Name'),
  description: string().nullable().optional().label('Description'),
  categoryId: string().nullable().optional().label('Category'),
  name: string().required().label('Name'),
});

export const createPermissionCategorySchema = object({
  name: string().required().label('Name'),
});

export const createUserSchema = object({
  email: string().email().required().label('Email Address'),
  firstName: string().required().label('First Name'),
  lastName: string().required().label('Last Name'),
  createdAt: date().required().label('Date Joined'),
  isAdmin: boolean().optional().label('Is Admin'),
  isActive: boolean().optional().label('Is Active'),
  isSuperUser: boolean().optional().label('Is Super User'),
  isEmailVerified: boolean().optional().label('Is Email Verified'),
  profile: object({
    image: mixed().nullable().optional().label('Image'), // File
    phone: string().required().label('Phone Number'),
    gender: string().oneOf(['MALE', 'FEMALE']).required().label('Gender'),
    address: string().required().label('Address'),
    state: string().required().label('State'),
    city: string().required().label('City'),
    dob: date().required().label('Date of Birth'),
  })
    .required()
    .label('Profile'),
  employee: object({
    department: string().required().label('Department'),
    job: string().required().label('Job'),
    supervisors: array().of(string().required()).optional().label('Supervisors'),
    dateEmployed: date().nullable().optional().label('Date Employed'),
  })
    .nullable()
    .optional()
    .label('Employee'),
  client: object({
    company: string().required().label('Company'),
    position: string().required().label('Position'),
  })
    .nullable()
    .optional()
    .label('Client'),
});

export const updateUserGroupsSchema = object({
  groups: array().of(string().required()).required().label('Groups'),
});

export const updateUserPermissionsSchema = object({
  permissions: array().of(string().required()).required().label('Permissions'),
});

export const objectPermissionSchema = object({
  groups: array().of(string().required()).nullable().optional().label('Groups'),
  users: array().of(string().required()).nullable().optional().label('Users'),
});

export type CreateGroupType = InferType<typeof createGroupSchema>;
export type CreatePermissionType = InferType<typeof createPermissionSchema>;
export type CreatePermissionCategoryType = InferType<typeof createPermissionCategorySchema>;
export type CreateUserType = InferType<typeof createUserSchema>;

export { passwordOptions };
