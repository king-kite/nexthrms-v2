import React from 'react';

type DownloadFileType = {
	url: string;
	name?: string;
	setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default async function downloadFile({
	url,
	name,
	setLoading,
}: DownloadFileType) {
	setLoading && setLoading(true);
	try {
		const response = await fetch(url, { method: 'GET' });
		const data = await response.blob();

		if (response.status === 200 && data) {
			let downloadName = name || '';
			if (!name || name === '') {
				const slash = url.split('/');
				downloadName = slash[slash.length - 1];
			}
			const downloadUrl = window.URL.createObjectURL(new Blob([data]));
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.setAttribute('download', downloadName);
			document.body.appendChild(link);
			link.click();
			return {
				status: 200,
				data: 'Downloading...',
			};
		}
	} catch (err: any) {
		return {
			status: err ? err?.response?.status : 500,
			data: err
				? err?.response?.data || err?.message
				: 'A server error occurred!',
		};
	} finally {
		setLoading && setLoading(false);
	}
}
