import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getUsers } from '../../../db';
import { getUserObjects } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { GetUsersResponseType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { validateParams } from '../../../validators';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	// let data: GetUsersResponseType['data'] = {
	let data;

	const hasViewPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.VIEW]);

	// if the user has model permissions
	if (hasViewPerm) {
		const params = validateParams(req.query);
		data = await getUsers({ ...params });
	} else {
		// if the user has any view object level permissions
		const userObjects = await getUserObjects({
			modelName: 'users',
			permission: 'VIEW',
			userId: req.user.id,
		});

		if (userObjects.length > 0) {
			const params = validateParams(req.query);
			data = await getUsers({
				...params,
				where: {
					id: {
						in: userObjects.map((obj) => obj.objectId),
					},
				},
			});
		}
	}

	if (!data)
		data = {
			active: 0,
			inactive: 0,
			on_leave: 0,
			employees: 0,
			clients: 0,
			total: 0,
			result: [],
		};

	const users = data.result.map((user) => {
		return {
			id: user.id,
			email: user.email,
			first_name: user.firstName,
			last_name: user.lastName,
			dob: user.profile?.dob || null,
			gender: user.profile?.gender || null,
			address: user.profile?.address || null,
			phone: user.profile?.phone || null,
			state: user.profile?.state || null,
			city: user.profile?.city || null,
			employee_id: user.employee?.id || null,
			client_id: user.client?.id || null,
			is_active: user.isActive,
			is_admin: user.isAdmin,
			is_email_verified: user.isEmailVerified,
			is_superuser: user.isSuperUser,
			updated_at: user.updatedAt,
			date_joined: user.createdAt,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(users);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Users'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Email Address', key: 'email', width: 10 },
			{ header: 'First Name', key: 'first_name', width: 10 },
			{ header: 'Last Name', key: 'last_name', width: 10 },
			{ header: 'Date of Birth', key: 'dob', width: 10 },
			{ header: 'Gender', key: 'gender', width: 10 },
			{ header: 'Address', key: 'address', width: 10 },
			{ header: 'Phone', key: 'phone', width: 10 },
			{ header: 'State', key: 'state', width: 10 },
			{ header: 'City', key: 'city', width: 10 },
			{ header: 'Employee ID', key: 'employee_id', width: 10 },
			{ header: 'Client ID', key: 'client_id', width: 10 },
			{ header: 'Is Active', key: 'is_active', width: 10 },
			{ header: 'Is Admin', key: 'is_admin', width: 10 },
			{ header: 'Is Email Verified', key: 'is_email_verified', width: 10 },
			{ header: 'Is Super User', key: 'is_superuser', width: 10 },
			{ header: 'Last Update', key: 'updated_at', width: 10 },
			{ header: 'Date Joined', key: 'date_joined', width: 10 },
		];

		worksheet.addRows(users);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
