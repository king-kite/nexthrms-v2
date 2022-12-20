import * as routes from "../../../config/server";

import employeesExport from './exportEmployees'
import employee from './employee'; // Single Employee
import employees from './employees'

const paths = {
	[routes.EMPLOYEES_URL]: employees,
	[routes.EMPLOYEE_URL("{id}")]: employee,
	[routes.EMPLOYEES_EXPORT_URL]: employeesExport,
};

export default paths;
