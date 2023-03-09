import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions as perms } from '../../../config';
import { getPermissions } from '../../../db';
import { getUserObjects } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { validateParams } from '../../../validators';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [perms.permission.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	let data;

	const hasViewPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [perms.permission.VIEW]);

	if (hasViewPerm) {
		const params = validateParams(req.query);
		data = await getPermissions(params);
	} else {
		// if the user has any view object level permissions
		const userObjects = await getUserObjects({
			modelName: 'permissions',
			permission: 'VIEW',
			userId: req.user.id,
		});

		if (userObjects.length > 0) {
			const params = validateParams(req.query);
			data = await getPermissions({
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
			total: 0,
			result: [],
		};

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
