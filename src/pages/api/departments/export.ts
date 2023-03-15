import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getDepartments } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.department.EXPORT,
		]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	const placeholder = {
		total: 0,
		result: [],
	};

	const result = await getRecords({
		model: 'departments',
		perm: 'department',
		user: req.user,
		query: req.query,
		placeholder,
		getData(params) {
			return getDepartments(params);
		},
	});

	const data = result ? result.data : placeholder;

	const departments = data.result.map((department) => {
		return {
			id: department.id,
			name: department.name,
			hod_first_name: department.hod?.user.firstName,
			hod_last_name: department.hod?.user.lastName,
			hod_email: department.hod?.user.email,
			no_of_employees: department._count,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(departments);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="departments.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Departments'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'HOD First Name', key: 'hod_first_name', width: 10 },
			{ header: 'HOD Last Name', key: 'hod_last_name', width: 10 },
			{ header: 'HOD Email', key: 'hod_email', width: 10 },
			{ header: 'Number Of Employees', key: 'no_of_employees', width: 10 },
		];

		worksheet.addRows(departments);

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
			'attachment; filename="departments.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
