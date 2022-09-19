import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { forwardRef } from 'react';
import {
	FaCalendarAlt,
	FaSignOutAlt,
	FaSuitcase,
	FaTimesCircle,
	FaThLarge,
	FaWarehouse,
	FaUsers,
	FaProjectDiagram,
	FaRProject,
	FaHandshake,
	FaUserFriends,
	FaSuitcaseRolling,
	FaUserTie,
	FaClock,
	FaUserClock,
} from 'react-icons/fa';
import * as routes from '../config/routes';
import { DEFAULT_IMAGE, LOGOUT_URL } from '../config';
import { useAppDispatch } from '../hooks';
import { useAuthContext } from '../store/contexts';
import { open } from '../store/features/alert-modal-slice';
import { axiosInstance } from '../utils';
import { SimpleLink, ListLink } from './Link';

const sidebarStyle =
	'absolute bg-primary-500 duration-1000 h-full overflow-y-auto transform top-16 w-3/4 z-50 sm:top-14 md:px-2 md:w-1/3 lg:fixed lg:px-0 lg:py-6 lg:top-0 lg:translate-x-0 lg:w-1/6 xl:py-7';

type PropsType = {
	setVisible: (e: boolean) => void;
	visible: boolean;
};

function getName(
	name1: string | null,
	name2: string | null,
	email: string
): string {
	if (name1 && name2) return name1 + ' ' + name2;
	if (name1) return name1;
	if (name2) return name2;
	return email;
}

const Sidebar = forwardRef<HTMLDivElement, PropsType>(
	({ setVisible, visible }, ref) => {
		const dispatch = useAppDispatch();

		const { data, logout } = useAuthContext();

		const queryClient = useQueryClient();

		const { mutate: signOut, isLoading } = useMutation(
			() => axiosInstance.post(LOGOUT_URL, {}),
			{
				onSuccess() {
					logout();
					queryClient.clear();
				},
				onError() {
					dispatch(
						open({
							color: 'danger',
							decisions: [
								{
									color: 'danger',
									disabled: isLoading,
									onClick: signOut,
									title: 'Retry',
								},
							],
							header: 'Logout Error',
							Icon: FaTimesCircle,
							message: 'An error occurred when trying to sign out',
						})
					);
				},
			}
		);

		const links = [
			{
				admin: false,
				Icon: FaThLarge,
				title: 'dashboard',
				href: routes.HOME_PAGE_URL,
			},
			{
				Icon: FaUsers,
				title: 'employees',
				links: [
					{
						admin: true,
						Icon: FaUserFriends,
						title: 'all employees',
						href: routes.EMPLOYEES_PAGE_URL,
					},
					{
						admin: false,
						Icon: FaSuitcaseRolling,
						title: 'leaves',
						href: routes.LEAVES_PAGE_URL,
					},
					{
						admin: true,
						Icon: FaSuitcase,
						title: 'leaves (admin)',
						href: routes.ADMIN_LEAVES_PAGE_URL,
					},
					{
						Icon: FaUserClock,
						title: 'attendance',
						href: routes.ATTENDANCE_PAGE_URL,
					},
					{
						admin: true,
						Icon: FaWarehouse,
						title: 'departments',
						href: routes.DEPARTMENTS_PAGE_URL,
					},
					{
						admin: true,
						Icon: FaCalendarAlt,
						title: 'holidays',
						href: routes.HOLIDAYS_PAGE_URL,
					},
					{
						admin: false,
						Icon: FaClock,
						title: 'overtime',
						href: routes.OVERTIME_PAGE_URL,
					},
					{
						admin: true,
						Icon: FaUserClock,
						title: 'overtime (admin)',
						href: routes.ADMIN_OVERTIME_PAGE_URL,
					},
				],
			},
			{
				admin: false,
				Icon: FaHandshake,
				title: 'clients',
				href: routes.CLIENTS_PAGE_URL,
			},
			{
				admin: true,
				Icon: FaProjectDiagram,
				title: 'projects',
				href: routes.PROJECTS_PAGE_URL,
			},
			{
				admin: true,
				Icon: FaRProject,
				title: 'jobs',
				href: routes.JOBS_PAGE_URL,
			},
			{
				admin: false,
				Icon: FaUserTie,
				title: 'profile',
				href: routes.PROFILE_PAGE_URL,
			},
		];

		return (
			<nav
				ref={ref}
				className={`${
					visible ? 'translate-x-0' : '-translate-x-full'
				} ${sidebarStyle}`}
			>
				<div className="flex flex-col items-center my-4 lg:mt-2">
					<div className="flex items-center justify-center mx-1 rounded-full">
						<div className="h-[75px] relative rounded-full w-[75px]">
							<Image
								className="h-full rounded-full w-full"
								layout="fill"
								src={data?.profile?.image || DEFAULT_IMAGE}
								alt="user"
							/>
						</div>
					</div>
					{data && (
						<>
							<p className="capitalize italic mb-1 mt-2 text-white text-xs tracking-white md:text-sm">
								{data
									? getName(data.firstName, data.lastName, data.email)
									: 'Anonymous'}
							</p>
							<span className="capitalize italic text-gray-300 text-tiny tracking-white md:text-xs">
								{data.employee?.job?.name || 'user'}
							</span>
						</>
					)}
				</div>
				<div className="mt-3">
					{links?.map(({ admin, href, ...props }, index) => {
						return 'links' in props ? (
							<ListLink
								onClick={() => setVisible(false)}
								links={links}
								key={index}
								{...props}
							/>
						) : (
							<SimpleLink
								href={href || '#'}
								onClick={() => setVisible(false)}
								key={index}
								{...props}
							/>
						);
					})}
					<div
						onClick={() => {
							if (!isLoading) signOut();
							setVisible(false);
						}}
						className="my-1 lg:my-0"
					>
						<div
							className={`${
								isLoading
									? 'bg-gray-700 cursor-not-allowed'
									: 'cursor-pointer hover:bg-primary-300'
							} capitalize flex justify-between items-center px-5 py-3 tracking-wide text-gray-100 text-sm lg:px-3 xl:pl-4`}
						>
							<div className="flex items-center">
								<span>
									<FaSignOutAlt className="text-gray-100 text-xs md:text-sm" />
								</span>
								<span className="mx-2">logout</span>
							</div>
							<div />
						</div>
					</div>
				</div>
			</nav>
		);
	}
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
