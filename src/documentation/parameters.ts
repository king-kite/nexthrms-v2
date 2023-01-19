const parameters: {
  in: string;
  name: string;
  required?: boolean;
  schema: {
    type: string;
    default?: any;
    format?: any;
  }
}[] = [
	{
		in: 'query',
		name: 'limit',
		schema: {
			type: 'number',
			default: 10,
		},
	},
	{
		in: 'query',
		name: 'offset',
		schema: {
			type: 'number',
			default: 0,
		},
	},
	{
		in: 'query',
		name: 'from',
		schema: {
			type: 'string',
			format: 'date-time',
		},
	},
	{
		in: 'query',
		name: 'to',
		schema: {
			type: 'string',
			format: 'date-time',
      default: new Date().toLocaleDateString('en-Ca')
		},
	},
];

export const parametersWithSearch = [
	...parameters,
	{
		in: 'query',
		name: 'search',
		required: false,
		schema: {
			type: 'string',
		},
	},
];

export const exportDataParameters = [
	...parameters,
	{
		in: 'query',
		name: 'type',
		schema: {
			type: "'csv' | 'excel'",
			default: 'csv',
		},
	},
];

export default parameters;
