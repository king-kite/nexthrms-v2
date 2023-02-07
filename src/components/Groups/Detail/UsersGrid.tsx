import { PersonCard } from '../../common';
import { DEFAULT_IMAGE, USER_PAGE_URL } from '../../../config';
import { GroupUserType } from '../../../types';

function UsersGrid({ users }: { users: GroupUserType[] }) {
	return (
		<div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
			{users.map((user, index) => (
				<PersonCard
					key={index}
					// title="User"
					name={user.firstName + ' ' + user.lastName}
					// label={member.employee.job ? member.employee.job.name : '------'}
					image={{ src: user.profile?.image || DEFAULT_IMAGE }}
					actions={[
						{
							bg: 'bg-white hover:bg-blue-100',
							border: 'border border-primary-500 hover:border-primary-600',
							color: 'text-primary-500',
							link: USER_PAGE_URL(user.id),
							title: 'view profile',
						},
						// {
						// 	bg: 'bg-white hover:bg-red-100',
						// 	border: 'border border-red-500 hover:border-red-600',
						// 	color: 'text-red-500',
						// 	onClick: () =>
						// 		deleteMember({
						// 			id: member.id,
						// 			projectId: id,
						// 		}),
						// 	title: 'Remove',
						// },
					]}
				/>
			))}
		</div>
	);
}

export default UsersGrid;
