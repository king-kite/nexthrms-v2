import * as routes from "../../../config/server";

import employeesExport from './exportEmployees'
import employees from './employees'

const paths = {
	[routes.EMPLOYEES_URL]: employees,
	[routes.EMPLOYEES_EXPORT_URL]: employeesExport,
};

export default paths;
