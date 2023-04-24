function getExportFiles(name: string) {
	return {
		csv: `${name}_csv.csv`,
		excel: `${name}_excel.xlsx`,
	};
}

export const ASSET_SAMPLES = getExportFiles('assets');
