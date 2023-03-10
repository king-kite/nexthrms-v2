import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getEmployees } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { GetEmployeesResponseType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.employee.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const placeholder: GetEmployeesResponseType['data'] = {
		total: 0,
		result: [],
	};

	const result = await getRecords<GetEmployeesResponseType['data']>({
		model: 'employees',
		perm: 'employee',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getEmployees(params);
		},
	});

	const data = result ? result.data : placeholder;

	const employees = data.result.map((emp) => {
		return {
			id: emp.id,
			email: emp.user.email,
			first_name: emp.user.firstName,
			last_name: emp.user.lastName,
			dob: emp.user.profile?.dob || null,
			gender: emp.user.profile?.gender || null,
			address: emp.user.profile?.address || null,
			phone: emp.user.profile?.phone || null,
			state: emp.user.profile?.state || null,
			city: emp.user.profile?.city || null,
			department: emp.department?.name || null,
			job: emp.job?.name || null,
			supervisor: emp.supervisor
				? emp.supervisor.user.firstName + ' ' + emp.supervisor.user.lastName
				: null,
			supervisor_email: emp.supervisor ? emp.supervisor.user.email : null,
			is_active: emp.user.isActive,
			date_employed: emp.dateEmployed,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(employees);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="employees.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Employees'); // New Worksheet

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
			{ header: 'Department', key: 'department', width: 10 },
			{ header: 'Job', key: 'job', width: 10 },
			{ header: 'Supervisor', key: 'supervisor', width: 10 },
			{ header: 'Supervisor Email', key: 'supervisor_email', width: 10 },
			{ header: 'Is Active', key: 'is_active', width: 10 },
			{ header: 'Date Employed', key: 'date_employed', width: 10 },
		];

		worksheet.addRows(employees);

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
			'attachment; filename="employees.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
