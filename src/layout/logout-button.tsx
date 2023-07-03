import { useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Router from 'next/router';

import { SimpleLink } from './link';
import { LOGIN_PAGE_URL } from '../config/routes';
import { LOGOUT_URL } from '../config/server';
import { useAlertModalContext, useAuthContext } from '../store/contexts';
import axiosInstance from '../utils/axios/authRedirectInstance';

const FaSignOutAlt = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaSignOutAlt),
	{
		ssr: false,
	}
);

const FaTimesCircle: any = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaTimesCircle),
	{
		ssr: false,
	}
);

type LogoutButtonType = { closeSidebar: () => void };

function LogoutButton({ closeSidebar }: LogoutButtonType) {
	const { open } = useAlertModalContext();
	const { logout } = useAuthContext();

	const queryClient = useQueryClient();

	const { mutate: signOut, isLoading } = useMutation(
		() => axiosInstance.post(LOGOUT_URL, {}),
		{
			onSuccess() {
				logout();
				Router.push(LOGIN_PAGE_URL);
				queryClient.clear();
			},
			onError() {
				open({
					color: 'danger',
					decisions: [
						{
							color: 'danger',
							disabled: isLoading,
							onClick: () => signOut(),
							title: 'Retry',
						},
					],
					header: 'Logout Error',
					Icon: FaTimesCircle,
					message: 'An error occurred when trying to sign out',
				});
			},
		}
	);
	return (
		<SimpleLink
			onClick={() => {
				signOut();
				closeSidebar;
			}}
			disabled={isLoading}
			icon={FaSignOutAlt}
			title="Sign out"
		/>
	);
}

export default LogoutButton;
