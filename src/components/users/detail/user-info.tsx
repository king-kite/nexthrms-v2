import { InfoComp } from 'kite-react-tailwind';

import { UserType } from '../../../types';
import { getDate, toCapitalize } from '../../../utils';

function UserInfo({ user }: { user: UserType }) {
	return (
		<div className="mt-4">
			<InfoComp
				bg="bg-gray-50"
				oddBgColor="bg-gray-50"
				evenBgColor="bg-white"
				oddBorderColor="bg-gray-50"
				evenBorderColor="bg-white"
				infos={[
					{
						title: 'First Name',
						value: toCapitalize(user.firstName || ''),
					},
					{
						title: 'Last Name',
						value: toCapitalize(user.lastName || ''),
					},
					{ title: 'E-mail', value: user.email || '' },
					{
						title: 'Birthday',
						value: user.profile?.dob
							? (getDate(user.profile?.dob, true) as string)
							: '---',
					},
					{
						title: 'Gender',
						value: toCapitalize(user.profile?.gender || ''),
					},
					{
						title: 'Status',
						value:
							user.employee?.leaves.length && user.employee?.leaves.length > 0
								? 'ON LEAVE'
								: user.isActive
								? 'ACTIVE'
								: 'INACTIVE',
						type: 'badge',
						options: {
							bg:
								user.employee?.leaves.length && user.employee?.leaves.length > 0
									? 'warning'
									: user.isActive
									? 'green'
									: 'danger',
						},
					},
				]}
				title="personal information"
			/>

			<InfoComp
				bg="bg-gray-50"
				oddBgColor="bg-gray-50"
				evenBgColor="bg-white"
				oddBorderColor="bg-gray-50"
				evenBorderColor="bg-white"
				infos={[
					{ title: 'E-mail', value: user.email || '' },
					{ title: 'Mobile', value: user.profile?.phone || '' },
					{ title: 'Address', value: user.profile?.address || '' },
					{
						title: 'State',
						value: toCapitalize(user.profile?.state || ''),
					},
					{
						title: 'City',
						value: toCapitalize(user.profile?.city || ''),
					},
				]}
				title="contact information"
			/>

			<InfoComp
				bg="bg-gray-50"
				oddBgColor="bg-gray-50"
				evenBgColor="bg-white"
				oddBorderColor="bg-gray-50"
				evenBorderColor="bg-white"
				infos={[
					{
						title: 'Is Email Verified?',
						value: user.isEmailVerified ? 'YES' : 'NO',
						type: 'badge',
						options: {
							bg: user.isEmailVerified ? 'green' : 'danger',
						},
					},
					{
						title: 'Is Admin User?',
						value: user.isAdmin ? 'YES' : 'NO',
						type: 'badge',
						options: {
							bg: user.isAdmin ? 'green' : 'danger',
						},
					},
					{
						title: 'Is Super User?',
						value: user.isSuperUser ? 'YES' : 'NO',
						type: 'badge',
						options: {
							bg: user.isSuperUser ? 'green' : 'danger',
						},
					},
					{
						options: {
							bg:
								user.employee && user.client
									? 'secondary'
									: user.client
									? 'pacify'
									: 'danger',
							color:
								user.employee && !user.client ? 'bg-purple-600' : undefined,
						},
						title: 'Role',
						type: 'badge',
						value:
							user.employee && user.client
								? 'CLIENT & EMPLOYEE'
								: user.client
								? 'CLIENT'
								: user.employee
								? 'EMPLOYEE'
								: 'USER',
					},
					{
						title: 'Last Update',
						value: user.updatedAt
							? (getDate(user.updatedAt, true) as string)
							: '---',
					},
					{
						title: 'Date Joined',
						value: user.createdAt
							? (getDate(user.createdAt, true) as string)
							: '---',
					},
				]}
				title="Additional information"
			/>
		</div>
	);
}

export default UserInfo;
