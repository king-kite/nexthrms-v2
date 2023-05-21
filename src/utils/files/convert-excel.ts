import excelJS from 'exceljs';
import fs from 'fs';

import { exportPermissionHeaders as permissionHeaders } from '../../config';
import { ObjectPermissionImportType } from '../../types';

function getData<DataType>(
	worksheet: excelJS.Worksheet,
	{
		canBeEmpty = false,
		type = 'data',
		...options
	}: OptionsType & {
		canBeEmpty?: boolean;
		type?: 'data' | 'permission';
	}
): {
	data?: DataType[];
	error?: { status: number; data: string | unknown };
} {
	const headerRow = worksheet.getRow(1);
	if (!headerRow || headerRow.cellCount <= 0)
		return {
			error: {
				status: 404,
				data: `Invalid excel file row format. The ${type} headers must be on the first row.`,
			},
		};
	const headers: string[] = [];
	// Get the headers/keys
	headerRow.eachCell((cell, columnNumber) => {
		if (!cell.value || cell.value === undefined)
			return {
				error: {
					status: 400,
					data: `Error at row 1 in column ${columnNumber} on ${type} worksheet. Please provide a valid column value.`,
				},
			};
		else {
			headers.push(cell.value.toString().trim());
		}
	});

	const columnLength = options.headers
		? options.headers.length
		: options.columnLength;
	// check all keys are intact
	if (columnLength && headers.length !== columnLength)
		return {
			error: {
				status: 400,
				data: `The number of columns is invalid in the ${type} worksheet. Expected a total of ${columnLength} column${
					columnLength > 1 ? 's' : ''
				}, found ${headers.length}.`,
			},
		};

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
					  )}' are not valid columns in the ${type} worksheet.`
					: `A column is invalid. ${invalidHeaders.join(
							','
					  )} is not valid column.`;
			return {
				error: {
					status: 400,
					data,
				},
			};
		}
	}

	// Next Get the rows and the fields in them

	const contentRows = worksheet.getRows(2, worksheet.rowCount - 1);
	if (!contentRows && !canBeEmpty)
		return {
			error: {
				status: 400,
				data: `Invalid excel file. No content data found in the ${type} worksheet.`,
			},
		};

	const rows =
		contentRows?.reduce((acc: string[][], contentRow) => {
			const row: any[] = [];
			for (let i = 1; i <= contentRow.cellCount; i++) {
				// eachCell function seems to skip empty cells
				const cell = contentRow.getCell(i);
				row.push(
					cell
						? cell.value
						: options.replaceEmpty
						? options.replaceEmptyValue
						: undefined
				);
			}
			return [...acc, row];
		}, []) || [];

	const result: DataType[] = rows.map((fields, index) => {
		if (headers.length !== fields.length) {
			return {
				error: {
					status: 400,
					data: `Error at row ${
						index + 2
					}. Number of columns is invalid. Expected a total of ${
						headers.length
					} column${headers.length > 1 ? 's' : ''}, found ${fields.length}.`,
				},
			};
		}
		const obj: any = fields.reduce((acc: any, currentField, index) => {
			const field: any = { ...acc };
			const key = headers[index];
			field[key] = currentField;
			return field;
		}, {});
		return JSON.parse(JSON.stringify(obj));
	});

	return {
		data: result,
	};
}

type OptionsType = {
	columnLength?: number; // The expected number of the keys
	headers?: string[];
	replaceEmpty?: boolean;
	replaceEmptyValue?: any;
};

export default function excelToJson<DataType = any>(
	filepath: string,
	options: OptionsType = {
		replaceEmpty: true,
		replaceEmptyValue: undefined,
	}
) {
	return new Promise<{
		data: DataType[];
		permissions?: ObjectPermissionImportType[];
	}>((resolve, reject) => {
		try {
			fs.readFile(filepath, (err, file) => {
				if (err)
					return reject({
						status: 500,
						data: err,
					});
				else {
					const workbook = new excelJS.Workbook();
					workbook.xlsx.load(file).then((workbook) => {
						const worksheet = workbook.getWorksheet(1);
						if (!worksheet)
							return reject({
								status: 404,
								data: 'Invalid excel file format. No Worksheet was found.',
							});

						const { data = [], error } = getData<DataType>(worksheet, {
							type: 'data',
							...options,
						});
						if (error) return reject(error);
						else {
							// Check for permissions worksheet
							const worksheet = workbook.getWorksheet(2);
							if (!worksheet) {
								return resolve({ data });
							} else {
								const { data: permissions, error } =
									getData<ObjectPermissionImportType>(worksheet, {
										...options,
										canBeEmpty: true,
										type: 'permission',
										headers: permissionHeaders,
									});
								if (error) return reject(error);
								else return resolve({ data, permissions });
							}
						}
					});
				}
			});
		} catch (error) {
			return reject({
				status: 500,
				data: error,
			});
		}
	});
}
