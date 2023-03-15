import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import {
	getDepartment,
	prisma,
	departmentSelectQuery as selectQuery,
} from '../../../db';
import {
	getRecord,
	getUserObjectPermissions,
	removeObjectPermissions,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { DepartmentType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { createDepartmentSchema } from '../../../validators';

export default admin()
	.get(async (req, res) => {
		const record = await getRecord({
			model: 'departments',
			perm: 'department',
			permission: 'VIEW',
			objectId: req.query.id as string,
			user: req.user,
			getData() {
				return getDepartment(req.query.id as string);
			},
		});
		if (!record) throw new NextApiErrorMessage(403);
		if (!record.data)
			return res.status(403).json({
				status: 'error',
				message: 'Department with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched department successfully',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.department.EDIT,
			]);

		if (!hasPerm) {
			const perm = await getUserObjectPermissions({
				modelName: 'departments',
				objectId: req.query.id as string,
				userId: req.user.id,
				permission: 'EDIT',
			});
			hasPerm = perm.edit;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const department = await getDepartment(req.query.id as string);

		const valid: {
			name: string;
			hod: string | null;
		} = await createDepartmentSchema.validateAsync({ ...req.body });

		let data: Prisma.DepartmentUpdateInput = { name: valid.name };

		if (valid.hod === undefined || valid.hod === null) {
			// i.e if valid.hod === null or not passed in
			data = { ...data, hod: { disconnect: true } };
		} else {
			data = { ...data, hod: { connect: { id: valid.hod } } };
		}

		const updated = (await prisma.department.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: selectQuery,
		})) as unknown as DepartmentType;

		// update permissions
		// The HOD was removed. Remove view and edit permissions
		if (department.hod && !updated.hod) {
			await removeObjectPermissions({
				model: 'departments',
				objectId: updated.id,
				users: [department.hod.user.id],
			});
		}

		// The HOD was changed. Add permission to new one, remove permission from old one
		if (department.hod && updated.hod && department.hod.id !== updated.hod.id) {
			await Promise.all([
				removeObjectPermissions({
					model: 'departments',
					objectId: department.id,
					users: [department.hod.user.id],
				}),
				updateObjectPermissions({
					model: 'departments',
					objectId: updated.id,
					users: [updated.hod.user.id],
					permissions: ['VIEW', 'EDIT'],
				}),
			]);
		}
		return res.status(200).json({
			status: 'success',
			message: 'Department updated successfully',
			data: updated,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.department.DELETE,
			]);

		if (!hasPerm) {
			const perm = await getUserObjectPermissions({
				modelName: 'departments',
				objectId: req.query.id as string,
				userId: req.user.id,
				permission: 'DELETE',
			});
			hasPerm = perm.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.department.delete({ where: { id: req.query.id as string } });

		return res.status(200).json({
			status: 'success',
			message: 'Department deleted successfully',
		});
	});
