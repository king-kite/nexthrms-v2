import { Prisma } from '@prisma/client';

import permissions from '../../../config/permissions';
import prisma from '../../../db/client';
import {
	departmentSelectQuery as selectQuery,
	getDepartments,
} from '../../../db/queries/departments';
import {
	addObjectPermissions,
	getRecords,
	getUserObjects,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { GetDepartmentsResponseType, DepartmentType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { multipleDeleteSchema } from '../../../validators';
import { createDepartmentSchema } from '../../../validators/departments';

export default admin()
	.get(async (req, res) => {
		const result = await getRecords<GetDepartmentsResponseType['data']>({
			model: 'departments',
			perm: 'department',
			placeholder: {
				total: 0,
				result: [],
			},
			query: req.query,
			user: req.user,
			getData(params) {
				return getDepartments(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.department.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const valid = await createDepartmentSchema.validate({ ...req.body });

		let data: Prisma.DepartmentCreateInput = { name: valid.name };

		if (valid.hod !== null && valid.hod !== undefined) {
			data = { ...data, hod: { connect: { id: valid.hod } } };
		}

		const department = (await prisma.department.create({
			data,
			select: selectQuery,
		})) as unknown as DepartmentType;

		await addObjectPermissions({
			model: 'departments',
			objectId: department.id,
			users: [req.user.id],
		});

		// Get the departments hod if available
		if (department.hod) {
			await updateObjectPermissions({
				model: 'departments',
				permissions: ['VIEW', 'EDIT'],
				objectId: department.id,
				users: [department.hod.user.id],
			});
		}

		return res.status(201).json({
			status: 'success',
			message: 'Department created successfully',
			data: department,
		});
	})
	.delete(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.department.DELETE,
			]);

		const valid = await multipleDeleteSchema.validate(
			{
				...req.body,
			},
			{
				abortEarly: false,
			}
		);

		if (!hasPerm) {
			const userObjects = await getUserObjects({
				modelName: 'departments',
				userId: req.user.id,
				permission: 'DELETE',
			});
			const everyId = userObjects.every((obj) =>
				valid.values.includes(obj.objectId)
			);
			if (!everyId)
				return res.status(403).json({
					status: 'error',
					message:
						'Sorry, you are not authorized to delete some of the departments requested.',
				});
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.department.deleteMany({
			where: {
				id: {
					in: valid.values,
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Deleted departments successfully',
		});
	});
