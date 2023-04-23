import fs from 'fs';

function getRowData(raw: string) {
	const splitRow = raw.split('');
	const data: string[] = [];
	let newValue = '';

	splitRow.forEach((row, index) => {
		const quotes = newValue.startsWith('"');
		// empty value
		if (newValue === ',') {
			data.push('');
			newValue = '';
		}
		// does not start with a '"', most probably not a string
		if (!quotes) {
			if (row !== ',') newValue += row;
			else {
				data.push(newValue);
				newValue = '';
			}
		} else {
			// starts with a '"', most probably a string
			// if current item is a ',' and the previous item is a '"', thats a value
			if (row === ',' && splitRow[index - 1] === '"') {
				data.push(newValue);
				newValue = '';
			} else newValue += row;
		}
		// the last item
		if (index === splitRow.length - 1) {
			data.push(newValue);
			newValue = '';
		}
	});
	return data.map((item) => {
		// Remove the first and the last '" if available
		const quotes = item.startsWith('"') && item.endsWith('"');
		if (!quotes) return item.trim();
		return item.slice(1, item.length - 1).trim();
	});
}

export default function csvToJson<DataType = any>(
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
					// const info = data.toString().split('\r');
					const info = data.toString().split('\n');

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
								// Remove the first and the last '" if available
								const quotes = item.startsWith('"') && item.endsWith('"');
								if (!quotes) return item.trim();
								return item.slice(1, item.length - 1).trim();
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
								const data =
									invalidHeaders.length > 1
										? `Some columns are invalid. '${invalidHeaders.join(
												','
										  )}' are not valid columns.`
										: `A column is invalid. ${invalidHeaders.join(
												','
										  )} is not valid column.`;
								reject({
									status: 400,
									data,
								});
							}
						}

						// Next Get the rows and the fields in them
						const rows = info.reduce((acc: string[][], row, index) => {
							if (index === 0) return acc; //ignore the header row
							if (row === '' && index === info.length - 1) return acc; // empty last line
							const data = getRowData(row);
							return [...acc, data];
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
