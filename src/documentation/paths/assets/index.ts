import * as routes from "../../../config/server";

// import employeesExport from './exportEmployees'
// import employee from './employee'; // Single Employee
import assets from './assets'

const paths = {
	[routes.ASSETS_URL]: assets,
	// [routes.EMPLOYEE_URL("{id}")]: employee,
	// [routes.EMPLOYEES_EXPORT_URL]: employeesExport,
};

export default paths;
