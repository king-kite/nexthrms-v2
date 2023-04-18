const message400 = 'Invalid data. Please try again!';
const message401 =
	'Authentication credentials were not provided. Please try again!';
const message404 = 'A requested resource was not foudn!';
const message500 = 'A server error occurred! Please try again later.';

export class NextApiErrorMessage extends Error {
	message: string;
	status: number = 500;

	constructor(status: number = 500, message?: string) {
		super(message);
		this.message = message
			? message
			: status === 400
			? message400
			: status === 401
			? message401
			: status === 404
			? message404
			: message500;
		this.status = status;
	}
}
