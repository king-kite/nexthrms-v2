export const assetHeaders = [
	'id',
	'asset_id',
	'condition',
	'description',
	'model',
	'manufacturer',
	'name',
	'purchase_date',
	'purchase_from',
	'serial_no',
	'status',
	'supplier',
	'warranty',
	'value',
	'user',
	'updated_at',
	'created_at',
];

export const clientHeaders = [
	'id',
	'company',
	'position',
	'contact_id',
	'updated_at',
	'created_at',
];

export const departmentHeaders = ['id', 'name', 'updated_at', 'created_at'];

export const employeeHeaders = [
	'id',
	'department',
	'job',
	'user_id',
	'supervisors',
	'date_employed',
	'updated_at',
	'created_at',
];

export const groupHeaders = [
	'id',
	'name',
	'description',
	'active',
	'permissions',
];

export const jobHeaders = ['id', 'name', 'updated_at', 'created_at'];

export const projectHeaders = [
	'id',
	'client_id',
	'name',
	'description',
	'completed',
	'start_date',
	'end_date',
	'initial_cost',
	'rate',
	'priority',
	'updated_at',
	'created_at',
];

export const projectFileHeaders = [
	'id',
	'name',
	'file',
	'size',
	'storage_info_keys',
	'storage_info_values',
	'type',
	'project_id',
	'uploaded_by',
	'created_at',
	'updated_at',
];

export const projectTeamHeaders = [
	'id',
	'is_leader',
	'employee_id',
	'project_id',
	'created_at',
	'updated_at',
];

export const projectTaskHeaders = [
	'project_id',
	'id',
	'name',
	'description',
	'completed',
	'priority',
	'due_date',
	'updated_at',
	'created_at',
];

export const projectTaskFollowerHeaders = [
	'id',
	'is_leader',
	'member_id',
	'task_id',
	'created_at',
	'updated_at',
];

export const userHeaders = [
	'id',
	'email',
	'first_name',
	'last_name',
	'dob',
	'gender',
	'image',
	'address',
	'city',
	'state',
	'phone',
	'is_active',
	'is_admin',
	'is_superuser',
	'email_verified',
	'permissions',
	'groups',
	'updated_at',
	'created_at',
];
