import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../../config';
import { getPermissionCategories } from '../../../../db';
import { getRecords } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { PermissionCategoryType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.permissioncategory.EXPORT,
		]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const placeholder: {
		total: number;
		result: PermissionCategoryType[];
	} = {
		total: 0,
		result: [],
	};

	const result = await getRecords<{
		total: number;
		result: PermissionCategoryType[];
	}>({
		model: 'permission_categories',
		perm: 'permissioncategory',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getPermissionCategories(params);
		},
	});

	const data = result ? result.data : placeholder;

	const categories = data.result.map((cat) => {
		const category = cat as PermissionCategoryType;
		return {
			id: category.id,
			name: category.name,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(categories);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="permission categories.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Permission Categories'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
		];

		worksheet.addRows(categories);

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
			'attachment; filename="permission categories.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
