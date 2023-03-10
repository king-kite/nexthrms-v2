import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions as perms } from '../../../config';
import { getPermissions } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { PermissionType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [perms.permission.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const placeholder: {
		total: number;
		result: PermissionType[];
	} = {
		total: 0,
		result: [],
	};

	const result = await getRecords<{
		total: number;
		result: PermissionType[];
	}>({
		model: 'permissions',
		perm: 'permission',
		query: req.query,
		user: req.user,
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getPermissions(params);
		},
	});

	const data = result ? result.data : placeholder;

	const permissions = data.result.map((permission) => {
		return {
			id: permission.id,
			name: permission.name,
			codename: permission.codename,
			description: permission.description || null,
			category: permission.category ? permission.category.name : null,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(permissions);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="permissions.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Permissions'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Code Name', key: 'codename', width: 10 },
			{ header: 'Description', key: 'description', width: 10 },
			{ header: 'Category', key: 'category', width: 10 },
		];

		worksheet.addRows(permissions);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="permissions.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
