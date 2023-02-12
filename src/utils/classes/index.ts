export class NextApiErrorMessage extends Error {
	message: string = '';
	status: number = 500;

	constructor(
		status: number = 500,
		message: string = 'A server error occurred1 Please try again later.'
	) {
		super(message);
		this.status = status;
	}
}
