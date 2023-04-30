import React from 'react';

import { axiosInstance } from '../utils/axios';
import { handleAxiosErrors } from '../validators';

function useAxiosInstance<DataType = any, ErrorType = any>(
	url: string,
	{
		onSuccess,
		onError,
	}: {
		onSuccess?: (data: DataType) => void;
		onError?: (error: {
			status: number;
			message: string;
			data?: ErrorType;
		}) => void;
	}
) {
	const [data, setData] = React.useState<{
		status: string;
		message: string;
		data: DataType;
	}>();
	const [error, setError] = React.useState<{
		status: number;
		message: string;
		data?: ErrorType;
	}>();
	const [loading, setLoading] = React.useState(false);

	const fetch = React.useCallback(async () => {
		try {
			const response = await axiosInstance({
				url,
				method: 'get',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
			setData(response.data);
			if (onSuccess) onSuccess(response.data.data);
		} catch (err) {
			const errors = handleAxiosErrors(err) || {
				status: 500,
				message: (err as any).message,
			};
			setError(errors);
			if (onError) onError(errors);
		} finally {
			setLoading(false);
		}
	}, [url, onSuccess, onError]);

	return {
		data,
		error,
		loading,
	};
}

export default useAxiosInstance;
