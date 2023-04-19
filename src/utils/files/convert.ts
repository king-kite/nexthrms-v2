import fs from 'fs';

export function csvToJson<DataType = any>(
	file: string,
	options: {
		columnLength?: number; // The expected number of the keys
		headers?: string[];
		replaceEmpty?: boolean;
		replaceEmptyValue?: any;
	} = {
		replaceEmpty: true,
		replaceEmptyValue: undefined,
	}
) {
	return new Promise<DataType[]>((resolve, reject) => {
		try {
			fs.readFile(file, (err, data) => {
				if (err) {
					reject({
						status: 500,
						data: err,
					});
				} else {
					// All the rows of the CSV will be converted to JSON objects which will be added to
					// result in an array
					const info = data.toString().split('\r');

					if (info.length <= 0) {
						reject({
							status: 404,
							data: 'The import file is empty',
						});
					} else {
						/**
						 * The first item in the info array i.e info[0] contains all the header columns
						 * so we'll store them in headers array.
						 * Note that the first item will be a string to trim the white spaces at the start and end
						 * and split the array using the ',' delimiter/separator.
						 *
						 * Example
						 * -------
						 * -> ['"id"','"email"','"first_name"','"last_name"','"dob"','"gender"'].
						 *
						 * remove the '"' at the start and end.
						 * An example of the result is below
						 * -> ['id','email','first_name','last_name','dob','gender'].
						 */
						const headers = info[0]
							.trim()
							.split(',')
							.map((item) => {
								// Remove the first and the last '"'
								const splitItem = item.split('"');
								const result = splitItem
									.filter((h, i) => i !== 0 && i !== splitItem.length - 1)
									.join('');
								return result;
							});

						const columnLength = options.headers
							? options.headers.length
							: options.columnLength;
						// check all keys are intact
						if (columnLength && headers.length !== columnLength) {
							reject({
								status: 400,
								data: `The number of columns is invalid. Expected a total of ${columnLength} column${
									columnLength > 1 ? 's' : ''
								}, found ${headers.length}.`,
							});
						}

						// if options.headers is passed in check only required keys are there
						if (options.headers) {
							const invalidHeaders: string[] = [];
							const requiredHeaders = headers.every((header) => {
								const found = options.headers?.find((item) => item === header);
								if (found) return true;
								invalidHeaders.push(header);
								return false;
							});

							if (!requiredHeaders) {
								reject({
									status: 400,
									data: `Some columns are invalid. ${invalidHeaders.join(
										','
									)} are not valid columns`,
								});
							}
						}

						/**
						 * Next the content.
						 * The items excluding the 0th index/first item contains the fields for each row
						 * Note that each row will be a string to trim the white spaces at the start and end
						 * and split the array using the ',' delimiter/separator
						 * and remove the '"' at the start and end. Check the header example above for a reference.
						 * Finally join each field into a single array to represent that specifir row
						 *
						 */

						const rows = info.reduce((acc: string[][], row, index) => {
							if (index === 0) return acc; // ignore the header row
							const rowContent = row
								.trim()
								.split(',')
								.map((field) => {
									// Remove the first and the last '"'
									const splitField = field.split('"');
									const fieldContent = splitField
										.filter((h, i) => i !== 0 && i !== splitField.length - 1)
										.join('');
									return fieldContent;
								});
							// Join the row into a single array
							return [...acc, rowContent];
						}, []);

						const result: DataType[] = rows.map((fields, index) => {
							if (headers.length !== fields.length) {
								reject({
									status: 400,
									data: `Error at row ${
										index + 1
									}. Number of columns is invalid. Expected a total of ${
										headers.length
									} column${headers.length > 1 ? 's' : ''}, found ${
										fields.length
									}.`,
								});
							}
							const obj: any = fields.reduce(
								(acc: any, currentField, index) => {
									const field: any = { ...acc };
									const key = headers[index];
									field[key] =
										(!currentField || currentField.trim() === '') &&
										options.replaceEmpty
											? options.replaceEmptyValue
											: currentField;
									return field;
								},
								{}
							);
							return JSON.parse(JSON.stringify(obj));
						});

						resolve(result);
					}
				}
			});
		} catch (error) {
			reject({
				status: 500,
				data: error,
			});
		}
	});
}
