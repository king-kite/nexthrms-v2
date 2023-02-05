import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { forwardRef } from 'react';
import { IconType } from 'react-icons';
import {
	FaArchive,
	FaCalendarAlt,
	FaClipboardList,
	FaClock,
	FaFileArchive,
	FaHandshake,
	FaLock,
	FaPeopleArrows,
	FaProjectDiagram,
	FaRProject,
	FaSignOutAlt,
	FaSuitcase,
	FaSuitcaseRolling,
	FaThLarge,
	FaTimesCircle,
	FaUsers,
	FaUsersCog,
	FaUserClock,
	FaUserFriends,
	FaUserTie,
	FaWarehouse,
} from 'react-icons/fa';

import { SimpleLink, ListLink } from './link';
import * as routes from '../config/routes';
import { DEFAULT_IMAGE, LOGOUT_URL } from '../config';
import { useAlertModalContext, useAuthContext } from '../store/contexts';
import { axiosInstance } from '../utils';

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
		const { open } = useAlertModalContext();
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

		type LinkItemType = {
			disabled?: boolean;
			href?: string;
			icon: IconType;
			links?: LinkItemType[];
			onClick?: () => void;
			title: string;
		};

		type LinkType = {
			links: LinkItemType[];
			title: string;
		};

		const links: LinkType[] = [
			{
				title: 'dashboard',
				links: [
					{
						icon: FaThLarge,
						title: 'dashboard',
						href: routes.HOME_PAGE_URL,
					},
				],
			},
			{
				title: 'employees',
				links: [
					{
						icon: FaUsers,
						title: 'employees',
						links: [
							{
								icon: FaUserFriends,
								title: 'all employees',
								href: routes.EMPLOYEES_PAGE_URL,
							},
							{
								icon: FaSuitcaseRolling,
								title: 'leaves',
								href: routes.LEAVES_PAGE_URL,
							},
							{
								icon: FaSuitcase,
								title: 'leaves (admin)',
								href: routes.ADMIN_LEAVES_PAGE_URL,
							},
							{
								icon: FaClock,
								title: 'attendance',
								href: routes.ATTENDANCE_PAGE_URL,
							},
							{
								icon: FaClipboardList,
								title: 'attendance (admin)',
								href: routes.ATTENDANCE_ADMIN_PAGE_URL,
							},
							{
								icon: FaWarehouse,
								title: 'departments',
								href: routes.DEPARTMENTS_PAGE_URL,
							},
							{
								icon: FaCalendarAlt,
								title: 'holidays',
								href: routes.HOLIDAYS_PAGE_URL,
							},
							{
								icon: FaClock,
								title: 'overtime',
								href: routes.OVERTIME_PAGE_URL,
							},
							{
								icon: FaUserClock,
								title: 'overtime (admin)',
								href: routes.ADMIN_OVERTIME_PAGE_URL,
							},
						],
					},
					{
						icon: FaHandshake,
						title: 'clients',
						href: routes.CLIENTS_PAGE_URL,
					},
					{
						icon: FaProjectDiagram,
						title: 'projects',
						href: routes.PROJECTS_PAGE_URL,
					},
				],
			},
			{
				title: 'administration',
				links: [
					{
						icon: FaArchive,
						title: 'assets',
						href: routes.ASSETS_PAGE_URL,
					},
					{
						icon: FaFileArchive,
						title: 'API documentation',
						href: routes.DOCS_PAGE_URL,
					},
					{
						icon: FaRProject,
						title: 'jobs',
						href: routes.JOBS_PAGE_URL,
					},
					{
						icon: FaUsersCog,
						title: 'users',
						links: [
							{
								icon: FaPeopleArrows,
								title: 'all users',
								href: routes.USERS_PAGE_URL,
							},
							{
								icon: FaLock,
								title: 'permissions',
								href: routes.PERMISSIONS_PAGE_URL,
							},
						],
					},
				],
			},
			{
				title: 'personal',
				links: [
					{
						icon: FaUserTie,
						title: 'profile',
						href: routes.PROFILE_PAGE_URL,
					},
					{
						disabled: isLoading,
						icon: FaSignOutAlt,
						onClick: !isLoading ? signOut : undefined,
						title: 'Sign out',
					},
				],
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
					{links.map(({ links, title }, index) => (
						<div className="mb-2" key={index}>
							<h6 className="font-bold mb-2 px-2 text-sm text-gray-400 tracking-widest uppercase md:text-lg lg:text-base">
								{title}
							</h6>

							{links.map(({ href, onClick, ...props }, index) => {
								return 'links' in props ? (
									<ListLink
										onClick={() => {
											if (onClick) onClick();
											setVisible(false);
										}}
										links={links}
										key={index}
										{...props}
									/>
								) : (
									<SimpleLink
										href={href || '#'}
										onClick={() => {
											if (onClick) onClick();
											setVisible(false);
										}}
										key={index}
										{...props}
									/>
								);
							})}
						</div>
					))}
				</div>
			</nav>
		);
	}
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
