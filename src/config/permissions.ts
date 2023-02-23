function makePermissions(name: string): {
	CREATE: string;
	DELETE: string;
	EDIT: string;
	VIEW: string;
	EXPORT: string;
} {
	return {
		CREATE: `can_create_${name}`.toLowerCase(),
		DELETE: `can_delete_${name}`.toLowerCase(),
		EDIT: `can_edit_${name}`.toLowerCase(),
		VIEW: `can_view_${name}`.toLowerCase(),
		EXPORT: `can_export_${name}`.toLowerCase(),
	};
}

export const apidoc = {
	VIEW: 'can_view_api_documentation',
};
export const asset = makePermissions('asset');
export const attendance = makePermissions('attendance');
// export const attendanceAdmin = makePermissions('attendanceAdmin');
export const client = makePermissions('client');
export const department = makePermissions('department');
export const employee = makePermissions('employee');
export const group = makePermissions('group');
export const holiday = makePermissions('holiday');
export const job = makePermissions('job');
export const leave = makePermissions('leave');
// export const leaveAdmin = makePermissions('admin_leave');
// export const notification = makePermissions('notification');
export const overtime = makePermissions('overtime');
// export const overtimeAdmin = makePermissions('admin_overtime');
export const permission = makePermissions('permission');
export const permissioncategory = makePermissions('permissioncategory');
export const permissionobject = makePermissions('permissionobject');
// export const profile = makePermissions('profile');
export const project = makePermissions('project');
export const projectfile = makePermissions('projectfile');
export const projectteam = makePermissions('projectteam');
export const projecttask = makePermissions('projecttask');
export const projecttaskfollower = makePermissions('projecttaskfollower');
export const user = makePermissions('user');
