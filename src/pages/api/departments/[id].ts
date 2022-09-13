import { Prisma } from '@prisma/client';

import { prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { createDepartmentSchema } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const department = await prisma.department.findUnique({
			where: {
				id: req.query.id as string,
			},
			select: selectQuery,
		});
		if (!department) {
			return res.status(404).json({
				status: 'error',
				message: 'Department with specified ID was not found!',
			});
		}
		return res.status(200).json({
			status: 'success',
			message: 'Fetched department successfully',
			data: department,
		});
	})
	.put(async (req, res) => {
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

		const department = await prisma.department.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: selectQuery,
		});
		return res.status(200).json({
			status: 'success',
			message: 'Department updated successfully',
			data: department,
		});
	})
	.delete(async (req, res) => {
		await prisma.department.delete({ where: { id: req.query.id as string } });
		return res.status(200).json({
			status: 'success',
			message: 'Department deleted successfully',
		});
	});

const selectQuery = {
	id: true,
	name: true,
	hod: {
		select: {
			id: true,
			user: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
					profile: {
						select: {
							image: true,
						},
					},
					employee: {
						select: {
							job: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			},
		},
	},
	_count: {
		select: { employees: true },
	},
};
