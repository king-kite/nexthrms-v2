import React from 'react';

import { axiosInstance } from '../utils/axios';
import { handleAxiosErrors } from '../validators';

function useAxiosInstance<DataType = any, ErrorType = any>({
	onSettled,
	onSuccess,
	onError,
}: {
	onSuccess?: (data: {
		status: string;
		message: string;
		data?: DataType;
	}) => void;
	onError?: (error: {
		status: number;
		message: string;
		data?: ErrorType;
	}) => void;
	onSettled?: (response: {
		status: 'success' | 'error';
		message: string;
		data?: DataType | ErrorType;
	}) => void;
}) {
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

	const execute = React.useCallback(
		async (url: string) => {
			try {
				setLoading(true);
				const response = await axiosInstance({
					url,
					method: 'get',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
				});
				setData(response.data);
				if (onSuccess) onSuccess(response.data);
				if (onSettled)
					onSettled({
						...response.data,
						status: 'success',
					});
			} catch (err) {
				const errors = handleAxiosErrors(err) || {
					status: 500,
					message: (err as any).message,
				};
				setError(errors);
				if (onError) onError(errors);
				if (onSettled)
					onSettled({
						...errors,
						status: 'error',
					});
			} finally {
				setLoading(false);
			}
		},
		[onSettled, onSuccess, onError]
	);

	return {
		data,
		error,
		loading,
		execute,
	};
}

export default useAxiosInstance;
