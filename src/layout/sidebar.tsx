import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PermissionModelChoices } from '@prisma/client';
import Image from 'next/image';
import Router from 'next/router';
import React from 'react';
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
	FaUserShield,
	FaUserTie,
	FaWarehouse,
} from 'react-icons/fa';

import { SimpleLink, ListLink } from './link';
import { LinkType, LinkItemType, PropsType } from './types';
import * as routes from '../config/routes';
import {
	DEFAULT_IMAGE,
	LOGIN_PAGE_URL,
	LOGOUT_URL,
	PermissionKeyType,
	permissions,
} from '../config';
import { useAlertModalContext, useAuthContext } from '../store/contexts';
import { AuthDataType } from '../types';
import { axiosInstance, hasModelPermission } from '../utils';

const sidebarStyle =
	'absolute bg-primary-500 duration-1000 h-full overflow-y-auto transform top-16 w-3/4 z-50 sm:top-14 md:px-2 md:w-1/3 lg:fixed lg:px-0 lg:py-6 lg:top-0 lg:translate-x-0 lg:w-1/6 xl:py-7';

// Check if the route should be visible
function checkRoute(
	data: AuthDataType | undefined,
	{
		admin = false,
		model: modelName,
		key,
	}: {
		admin: boolean; // admin user required
		model?: PermissionModelChoices;
		key: PermissionKeyType;
	}
): boolean {
	if (!data) return false;
	if (data.isSuperUser) return true;
	if (admin && !data.isAdmin) return false;

	// Check the user has view or create model permission
	const hasModelPerm = hasModelPermission(data.permissions, [
		permissions[key].VIEW,
		permissions[key].CREATE,
	]);
	if (hasModelPerm) return true;
	if (modelName) {
		// Check if the user has view object level permission
		const hasObjPerm = data.objPermissions.find(
			(perm) => perm.modelName === modelName && perm.permission === 'VIEW'
		);
		if (hasObjPerm) return true;
	}
	return false;
}

// Check that the user must be an employee to be visible
function checkEmployeeRoute(data: AuthDataType | undefined): boolean {
	if (!data) return false;
	if (data.isSuperUser) return true;
	if (data.employee) return true;
	return false;
}

// Filter through the links to verify single and list links
function checkLinkRoute(linkItem: LinkItemType) {
	// First check if it's a list link
	if (linkItem.links) {
		const links = linkItem.links.filter((link) => {
			if (checkLinkRoute(link)) return link;
		});
		return links.length > 0
			? { ...linkItem, links }
			: { ...linkItem, links: [] };
	} else {
		// Single link
		// Check if there is no showRoute function and return the accumulated items
		const canView = linkItem.showRoute ? linkItem.showRoute() : false;
		if (canView) return linkItem;
	}
}

const Sidebar = React.forwardRef<HTMLDivElement, PropsType>(
	({ setVisible, visible }, ref) => {
		const { open } = useAlertModalContext();
		const { data, logout } = useAuthContext();

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

		const links: LinkType[] = React.useMemo(
			() => [
				{
					title: 'apps',
					links: [
						{
							icon: FaThLarge,
							title: 'dashboard',
							href: routes.HOME_PAGE_URL,
							// Check the route required permission
							showRoute: () => true,
						},
						{
							icon: FaThLarge,
							title: 'file manager',
							href: routes.FILE_MANAGER_PAGE_URL,
							// Check the route required permission
							showRoute: () => true,
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
									pathnames: [routes.EMPLOYEE_PAGE_URL('[id]')],
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'employee',
											model: 'employees',
										}),
								},
								{
									icon: FaSuitcaseRolling,
									title: 'leaves',
									href: routes.LEAVES_PAGE_URL,
									pathnames: [routes.LEAVE_DETAIL_PAGE_URL('[id]')],
									// Must be an employee
									showRoute: () => checkEmployeeRoute(data),
								},
								{
									icon: FaSuitcase,
									title: 'leaves (admin)',
									pathnames: [routes.ADMIN_LEAVE_DETAIL_PAGE_URL('[id]')],
									href: routes.ADMIN_LEAVES_PAGE_URL,
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'leave',
											model: 'leaves',
										}),
								},
								{
									icon: FaClock,
									title: 'attendance',
									href: routes.ATTENDANCE_PAGE_URL,
									showRoute: () => checkEmployeeRoute(data),
								},
								{
									icon: FaClipboardList,
									title: 'attendance (admin)',
									href: routes.ATTENDANCE_ADMIN_PAGE_URL,
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'attendance',
											model: 'attendance',
										}),
								},
								{
									icon: FaWarehouse,
									title: 'departments',
									href: routes.DEPARTMENTS_PAGE_URL,
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'department',
											model: 'departments',
										}),
								},
								{
									icon: FaCalendarAlt,
									title: 'holiday',
									href: routes.HOLIDAYS_PAGE_URL,
									// Must be an employee
									showRoute: () => checkEmployeeRoute(data),
								},
								{
									icon: FaClock,
									title: 'overtime',
									href: routes.OVERTIME_PAGE_URL,
									pathnames: [routes.OVERTIME_DETAIL_PAGE_URL('[id]')],
									showRoute: () => checkEmployeeRoute(data),
								},
								{
									icon: FaUserClock,
									title: 'overtime (admin)',
									href: routes.ADMIN_OVERTIME_PAGE_URL,
									pathnames: [routes.ADMIN_OVERTIME_DETAIL_PAGE_URL('[id]')],
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'overtime',
											model: 'overtime',
										}),
								},
							],
						},
						{
							icon: FaHandshake,
							title: 'clients',
							href: routes.CLIENTS_PAGE_URL,
							pathnames: [routes.CLIENT_PAGE_URL('[id]')],
							showRoute: () =>
								checkRoute(data, {
									admin: true,
									key: 'client',
									model: 'clients',
								}),
						},
						{
							icon: FaProjectDiagram,
							title: 'projects',
							href: routes.PROJECTS_PAGE_URL,
							pathnames: [
								routes.PROJECT_PAGE_URL('[id]'),
								routes.PROJECT_TASKS_PAGE_URL('[id]'),
								routes.PROJECT_TASK_PAGE_URL('[id]', '[task_id]'),
								routes.PROJECT_TEAM_PAGE_URL('[id]'),
							],
							showRoute: () =>
								checkRoute(data, {
									admin: false,
									key: 'project',
									model: 'projects',
								}),
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
							showRoute: () =>
								checkRoute(data, {
									admin: true,
									key: 'asset',
									model: 'assets',
								}),
						},
						{
							icon: FaFileArchive,
							title: 'API documentation',
							href: routes.DOCS_PAGE_URL,
							showRoute: () =>
								checkRoute(data, {
									admin: true,
									key: 'apidoc',
								}),
						},
						{
							icon: FaRProject,
							title: 'jobs',
							href: routes.JOBS_PAGE_URL,
							showRoute: () =>
								checkRoute(data, {
									admin: true,
									key: 'job',
									model: 'jobs',
								}),
						},
						{
							icon: FaUsersCog,
							title: 'users',
							links: [
								{
									icon: FaPeopleArrows,
									title: 'all users',
									href: routes.USERS_PAGE_URL,
									pathnames: [routes.USER_PAGE_URL('[id]')],
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'user',
											model: 'users',
										}),
								},
								{
									icon: FaUserShield,
									title: 'groups',
									href: routes.GROUPS_PAGE_URL,
									pathnames: [routes.GROUP_PAGE_URL('[id]')],
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'group',
											model: 'groups',
										}),
								},
								{
									icon: FaLock,
									title: 'permissions',
									href: routes.PERMISSIONS_PAGE_URL,
									showRoute: () =>
										checkRoute(data, {
											admin: true,
											key: 'permission',
											model: 'permissions',
										}),
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
							showRoute: () => true,
						},
						{
							disabled: isLoading,
							icon: FaSignOutAlt,
							onClick: !isLoading ? signOut : undefined,
							showRoute: () => true,
							title: 'Sign out',
						},
					],
				},
			],
			[data, isLoading, signOut]
		);

		const validRoutes = React.useMemo(() => {
			const routes = links.reduce((acc: LinkType[], route) => {
				const showLinked = route.links.reduce(
					(accItems: LinkItemType[], linkItem) => {
						const items = checkLinkRoute(linkItem);
						if (!items) return accItems;

						// Check if it's a single link
						if (!items.links) return [...accItems, items];

						// Check if it's a list link and is not empty
						if (items.links && items.links.length > 0)
							return [...accItems, items];

						return accItems;
					},
					[]
				);
				return [...acc, { ...route, links: showLinked }];
			}, []);
			return routes.filter((route) => route.links.length > 0);
		}, [links]);

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
								src={data?.profile?.image?.url || DEFAULT_IMAGE}
								alt="user"
							/>
						</div>
					</div>
					{data && (
						<>
							<p className="capitalize italic mb-1 mt-2 text-white text-xs tracking-white md:text-sm">
								{data ? data.fullName : 'Anonymous'}
							</p>
							<span className="capitalize italic text-gray-300 text-tiny tracking-white md:text-xs">
								{data.employee?.job?.name || 'user'}
							</span>
						</>
					)}
				</div>
				<div className="mt-3">
					{validRoutes.map(({ links, title }, index) => (
						<div className="mb-2" key={index}>
							<h6 className="font-bold mb-2 px-2 select-none text-sm text-gray-400 tracking-widest uppercase md:text-lg lg:text-base">
								{title}
							</h6>
							{links.map(({ href, onClick, showRoute, ...props }, index) => {
								if (
									'links' in props &&
									props.links !== undefined &&
									props.links.length > 0
								)
									return (
										<ListLink
											onClick={() => {
												if (onClick) onClick();
												setVisible(false);
											}}
											links={props.links.map(({ showRoute, ...link }) => link)}
											key={index}
											{...props}
										/>
									);
								else if (!props.links)
									return (
										<SimpleLink
											href={href}
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
