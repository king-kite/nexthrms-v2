import { TabNavigator } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';

import Container from '../../components/common/container';
import InfoTopBar from '../../components/common/info-topbar';
import UserInfo from '../../components/users/detail/user-info';
import { DEFAULT_IMAGE } from '../../config/static';
import { useGetUserQuery } from '../../store/queries/users';
import type { UserType } from '../../types';
import toCapitalize from '../../utils/toCapitalize';

const DynamicDetailActions = dynamic<any>(
	() => import('../../components/users/detail/detail-actions').then((mod) => mod.default),
	{
		loading: () => (
			<div className="flex items-center justify-center p-4 w-full md:h-1/2 md:mt-auto md:pb-0 md:w-2/3">
				<p className="animate animate-pulse duration-300 text-center text-gray-800 text-sm transition transform">
					Loading Actions...
				</p>
			</div>
		),
		ssr: false,
	}
);

const DynamicGroups = dynamic<any>(
	() => import('../../components/users/detail/groups').then((mod) => mod.default),
	{
		loading: () => (
			<p className="p-2 text-center text-gray-500 text-sm md:text-base">Loading Groups...</p>
		),
		ssr: false,
	}
);
const DynamicPermissions = dynamic<any>(
	() => import('../../components/users/detail/permissions').then((mod) => mod.default),
	{
		loading: () => (
			<p className="p-2 text-center text-gray-500 text-sm md:text-base">Loading Permissions...</p>
		),
		ssr: false,
	}
);

const User = ({ user }: { user: UserType }) => {
	const router = useRouter();
	const id = React.useMemo(() => router.query.id as string, [router]);
	const detailActionsRef = React.useRef<{
		canEdit: boolean;
		refreshPerm: () => void;
		refreshClientPerm: () => void;
		refreshEmployeePerm: () => void;
	}>(null);
	const { data, error, isLoading, isFetching, refetch } = useGetUserQuery(
		{
			id,
		},
		{
			initialData() {
				return user;
			},
		}
	);

	return (
		<Container
			heading="User Information"
			icon
			error={
				error
					? {
							statusCode: (error as any).response?.status || (error as any).status || 500,
							title: (error as any)?.response?.data?.message || (error as any).message,
					  }
					: undefined
			}
			refresh={{
				loading: isFetching,
				onClick: () => {
					if (detailActionsRef.current?.refreshPerm) detailActionsRef.current.refreshPerm();
					if (detailActionsRef.current?.refreshClientPerm)
						detailActionsRef.current.refreshClientPerm();
					if (detailActionsRef.current?.refreshEmployeePerm)
						detailActionsRef.current.refreshEmployeePerm();
					refetch();
				},
			}}
			loading={isLoading}
			title={data ? data.firstName + ' ' + data.lastName : undefined}
		>
			{data && (
				<>
					<InfoTopBar
						email={data.email}
						full_name={toCapitalize(data.firstName + ' ' + data.lastName)}
						image={data.profile?.image?.url || DEFAULT_IMAGE}
						actions={
							<DynamicDetailActions
								data={data}
								forwardedRef={{
									ref: detailActionsRef,
								}}
							/>
						}
					/>

					<TabNavigator
						screens={[
							{
								component: <UserInfo user={data} />,
								description: "View all user's details and information",
								title: 'User Information',
							},
							{
								title: 'Permissions',
								description: 'View all permissions for this user.',
								component: (
									<DynamicPermissions canEditUser={detailActionsRef.current?.canEdit || false} />
								),
							},
							{
								title: 'Groups',
								description: 'View all groups associated with this user.',
								component: (
									<DynamicGroups canEditUser={detailActionsRef.current?.canEdit || false} />
								),
							},
						]}
					/>
				</>
			)}
		</Container>
	);
};

export default User;
