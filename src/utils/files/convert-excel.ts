import excelJS from 'exceljs';
import fs from 'fs';

export default function excelToJson<DataType = any>(
	filepath: string,
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
			fs.readFile(filepath, (err, file) => {
				if (err) {
					reject({
						status: 500,
						data: err,
					});
				} else {
					const workbook = new excelJS.Workbook();
					workbook.xlsx.load(file).then((data) => {
						const worksheet = data.getWorksheet(1);
						if (!worksheet)
							reject({
								status: 404,
								data: 'Invalid excel file format. No Worksheet was found.',
							});

						const headerRow = worksheet.getRow(1);
						if (!headerRow || headerRow.cellCount <= 0)
							reject({
								status: 404,
								data: 'Invalid excel file row format. The header must be the first row.',
							});

						const headers: string[] = [];
						// Get the headers/keys
						headerRow.eachCell((cell, columnNumber) => {
							if (!cell.value || cell.value === undefined)
								reject({
									status: 400,
									data: `Error at row 1 in column ${columnNumber}. Please provide a valid column value.`,
								});
							else {
								headers.push(cell.value.toString().trim());
							}
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

						const contentRows = worksheet.getRows(2, worksheet.rowCount - 1);
						if (!contentRows) {
							reject({
								status: 400,
								data: 'Invalid excel file. No content data found.',
							});
						}

						const rows =
							contentRows?.reduce((acc: string[][], contentRow, index) => {
								const row: any[] = [];
								contentRow.eachCell((cell, columnNumber) => {
									if (cell.value === undefined && !options.replaceEmpty)
										reject({
											status: 400,
											data: `Error at row ${index} in column ${columnNumber}. Please provide a valid column value.`,
										});
									else
										row.push(
											cell.value === undefined
												? options.replaceEmpty
												: cell.value
										);
								});
								return [...acc, row];
							}, []) || [];

						// const rows = workRows.reduce((acc: string[][], row, index) => {
						// 	if (index === 0) return acc;
						// 	const data = row.cells.map((cell) => cell.value);
						// 	return [...acc, data];
						// }, []);

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
									field[key] = currentField;
									return field;
								},
								{}
							);
							return JSON.parse(JSON.stringify(obj));
						});
						resolve(result);
					});
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
