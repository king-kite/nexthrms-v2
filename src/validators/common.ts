import { array, mixed, object, string } from 'yup';

const imageFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const imageFileTypeRegexs = [/^image\/(jpeg|jpg|png|gif)$/];

// Custom validation function to validate file type using regex
function validateFileTypeRegex(file: any, supportedTypesRegex: RegExp[]) {
	if (!file) return false;
	return supportedTypesRegex.some((regex) => regex.test(file.type));
}

// Custom validation function to validate file type
function validateFileType(file: any, supportedTypes: string[]) {
	if (!file) return false;
	return supportedTypes.includes(file.type);
}

// Custom validation function to validate file size
function validateFileSize(file: any, maxSize: number) {
	if (!file) return false;
	return file.size <= maxSize;
}

export function imageFileSchema(
	options: {
		size?: number;
		presets?: {
			regex?: boolean;
			types?: boolean;
		};
		type?: {
			regex?: RegExp[];
			types?: string[];
		};
	} = {}
) {
	let fileSchema = mixed();
	// Validate size if provided;
	if (options.size)
		fileSchema = fileSchema.test('Size', 'File size is too large', (value) =>
			validateFileSize(value, options.size || 0)
		); // 10MB

	// Validate file type using regex if provided
	if (options.presets?.regex && options.type?.regex)
		throw new Error(
			'Either use a preset for regex or provide an array for the regex type; Not both'
		);
	// Use preset: No need to pass in array
	else if (options.presets?.regex)
		fileSchema = fileSchema.test('Type', 'Unsupported file type', (value) =>
			validateFileTypeRegex(value, imageFileTypeRegexs)
		);
	else if (options.type?.regex && Array.isArray(options.type.regex))
		fileSchema = fileSchema.test('Type', 'Unsupported file type', (value) =>
			validateFileTypeRegex(value, options.type?.regex || [])
		);

	// Validate file type using the type array if provided
	if (options.presets?.types && options.type?.types)
		throw new Error(
			'Either use a preset for file types or provide an array for the file types; Not both'
		);
	// Use preset: No need to pass in array
	else if (options.presets?.types)
		fileSchema = fileSchema.test('Type', 'Unsupported file type', (value) =>
			validateFileType(value, imageFileTypes)
		);
	else if (options.type?.types && Array.isArray(options.type.types))
		fileSchema = fileSchema.test('Type', 'Unsupported file type', (value) =>
			validateFileType(value, options.type?.types || [])
		);

	return fileSchema;
}

export function fileSchema(options?: {
	size?: number;
	type?: {
		regex?: RegExp[];
		types?: string[];
	};
}) {
	let fileSchema = mixed();
	if (options?.size)
		fileSchema = fileSchema.test('Size', 'File size is too large', (value) =>
			validateFileSize(value, options.size || 0)
		); // 10MB
	if (options?.type) {
		if (options?.type?.types)
			fileSchema = fileSchema.test('Type', 'Unsupported file type', (value) =>
				validateFileType(value, options.type?.types || [])
			);
		else if (options?.type?.regex)
			fileSchema = fileSchema.test('Type', 'Unsupported file type', (value) =>
				validateFileTypeRegex(value, options.type?.regex || [])
			);
	}
	return fileSchema;
}

export const multipleDeleteSchema = object({
	values: array().of(string().uuid().required()).required(),
});

export const multipleEmailSchema = object({
	emails: array().of(string().email().required()).required().label('Emails'),
});

export const uuidSchema = string().uuid().required().label('id');
