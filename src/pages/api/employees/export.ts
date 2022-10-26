import excelJS from 'exceljs';

import { getEmployees } from '../../../db';
import { auth } from '../../../middlewares';
import { EmployeeType } from '../../../types';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getEmployees({ ...params });

	if (req.query.type === 'csv') {
		return res.status(200).json({
			status: 'success',
			message: 'Fetched Employees data in CSV Format',
		});
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

		const employees = data.result.map((employee) => {
			const emp = employee as EmployeeType;
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

/*

data.result.forEach((employee) => {
			const emp = employee as EmployeeType;
			worksheet.addRow({
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
			});
		});
*/
