export * from './extended';

export type ResponseType = {
	message: string;
	status: 'error' | 'redirect' | 'success';
};

export type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
	from?: Date;
	to?: Date;
};

export type UserObjPermType = {
	delete: boolean;
	edit: boolean;
	view: boolean;
};

export interface SuccessResponseType<DataType = unknown> extends ResponseType {
	data: DataType;
}

export interface ErrorResponseType<ErrorType = unknown> extends ResponseType {
	error?: ErrorType;
}

export interface RedirectResponseType extends ResponseType {
	redirect?: {
		url: string;
	};
}

export type BaseResponseType<DataType = unknown, ErrorType = unknown> =
	| SuccessResponseType<DataType>
	| ErrorResponseType<ErrorType>
	| RedirectResponseType;

export type PaginatedResponseType<DataType = unknown> = SuccessResponseType<{
	result: DataType;
	total: number;
}>;

export type ValidatorErrorType<T> = {
	[K in keyof T]?: T[K] extends Date | number
		? string
		: T[K] extends object
		? ValidatorErrorType<T[K]>
		: string;
};

// export type ValidatorErrorType<T> = {
// 	[K in keyof T]?: T[K] extends object ? ValidatorErrorType<T[K]> : string;
// };
