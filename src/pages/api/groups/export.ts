import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getGroups } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { GroupType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.group.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const placeholder: {
		total: number;
		result: GroupType[];
	} = {
		total: 0,
		result: [],
	};

	const result = await getRecords<{
		total: number;
		result: GroupType[];
	}>({
		model: 'groups',
		perm: 'group',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getGroups(params);
		},
	});

	const data = result ? result.data : placeholder;

	const groups = data.result.map((group) => {
		return {
			id: group.id,
			name: group.name,
			permissions: group.permissions.map((perm) => perm.codename).join(','),
			users: group.users.map((user) => user.id).join(','),
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(groups);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="groups.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Groups'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Permissions', key: 'permissions', width: 10 },
			{ header: 'Users', key: 'users', width: 10 },
		];

		worksheet.addRows(groups);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader('Content-Disposition', 'attachment; filename="groups.xlsx"');

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
