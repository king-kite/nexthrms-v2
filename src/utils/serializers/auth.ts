import { AuthDataType, RequestUserType } from '../../types';

export function serializeUserData(
	user: Omit<RequestUserType, 'checkPassword'>
): AuthDataType {
	let data: AuthDataType = {
		firstName: user.firstName,
		lastName: user.lastName,
		fullName: user.firstName + " " + user.lastName,
		email: user.email,
		profile: user.profile
			? {
					image: user.profile.image,
			  }
			: null,
		employee: null,
	};
	if (user.employee) {
		data.employee = {
			id: user.employee.id,
		};
		if (user.employee.job) {
			data.employee.job = {
				name: user.employee.job.name,
			};
		}
	}
	return data;
}
