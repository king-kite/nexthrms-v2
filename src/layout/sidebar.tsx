import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
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
import { LinkType, PropsType } from './types';
import * as routes from '../config/routes';
import { DEFAULT_IMAGE, LOGOUT_URL, permissions } from '../config';
import { useAlertModalContext, useAuthContext } from '../store/contexts';
import { axiosInstance, hasModelPermission } from '../utils';

const sidebarStyle =
	'absolute bg-primary-500 duration-1000 h-full overflow-y-auto transform top-16 w-3/4 z-50 sm:top-14 md:px-2 md:w-1/3 lg:fixed lg:px-0 lg:py-6 lg:top-0 lg:translate-x-0 lg:w-1/6 xl:py-7';

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
					title: 'dashboard',
					links: [
						{
							icon: FaThLarge,
							title: 'dashboard',
							href: routes.HOME_PAGE_URL,
						},
					],
					permissions: [],
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
									permissions: [
										permissions.employee.VIEW,
										permissions.employee.CREATE,
									],
									// check if the user has view employees obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'employees' &&
											perm.permission === 'VIEW'
									),
								},
								{
									icon: FaSuitcaseRolling,
									title: 'leaves',
									href: routes.LEAVES_PAGE_URL,
									permissions: [
										permissions.leave.VIEW,
										permissions.leave.CREATE,
									],
									// Not placing oject permission check here since this
									// will only fetch the employee's leave, same thing for
									// attendance, overtime
								},
								{
									admin: true,
									icon: FaSuitcase,
									title: 'leaves (admin)',
									href: routes.ADMIN_LEAVES_PAGE_URL,
									permissions: [
										permissions.leave.VIEW,
										permissions.leave.CREATE,
									],
									// check if the user has view leaves obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'leaves' && perm.permission === 'VIEW'
									),
								},
								{
									icon: FaClock,
									title: 'attendance',
									href: routes.ATTENDANCE_PAGE_URL,
									permissions: [permissions.attendance.VIEW],
								},
								{
									admin: true,
									icon: FaClipboardList,
									title: 'attendance (admin)',
									href: routes.ATTENDANCE_ADMIN_PAGE_URL,
									permissions: [
										permissions.attendance.VIEW,
										permissions.attendance.CREATE,
									],
									// check if the user has view attendance obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'attendance' &&
											perm.permission === 'VIEW'
									),
								},
								{
									icon: FaWarehouse,
									title: 'departments',
									href: routes.DEPARTMENTS_PAGE_URL,
									permissions: [
										permissions.department.VIEW,
										permissions.department.CREATE,
									],
									// check if the user has view departments obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'departments' &&
											perm.permission === 'VIEW'
									),
								},
								{
									icon: FaCalendarAlt,
									title: 'holiday',
									href: routes.HOLIDAYS_PAGE_URL,
									permissions: [
										permissions.holiday.VIEW,
										permissions.holiday.CREATE,
									],
									// check if the user has view holidays obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'holiday' && perm.permission === 'VIEW'
									),
								},
								{
									icon: FaClock,
									title: 'overtime',
									href: routes.OVERTIME_PAGE_URL,
									permissions: [
										permissions.overtime.VIEW,
										permissions.overtime.CREATE,
									],
								},
								{
									admin: true,
									icon: FaUserClock,
									title: 'overtime (admin)',
									href: routes.ADMIN_OVERTIME_PAGE_URL,
									permissions: [
										permissions.overtime.VIEW,
										permissions.overtime.CREATE,
									],
									// check if the user has view overtime obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'overtime' &&
											perm.permission === 'VIEW'
									),
								},
							],
						},
						{
							icon: FaHandshake,
							title: 'clients',
							href: routes.CLIENTS_PAGE_URL,
							permissions: [permissions.client.VIEW, permissions.client.CREATE],
							// check if the user has view clients obj permission
							objPerm: !!data?.objPermissions.find(
								(perm) =>
									perm.modelName === 'clients' && perm.permission === 'VIEW'
							),
						},
						{
							icon: FaProjectDiagram,
							title: 'projects',
							href: routes.PROJECTS_PAGE_URL,
							permissions: [
								permissions.project.VIEW,
								permissions.project.CREATE,
							],
							// check if the user has view projects obj permission
							objPerm: !!data?.objPermissions.find(
								(perm) =>
									perm.modelName === 'projects' && perm.permission === 'VIEW'
							),
						},
					],
					permissions: [
						permissions.attendance.VIEW,
						permissions.attendance.CREATE,
						permissions.client.VIEW,
						permissions.client.CREATE,
						permissions.department.VIEW,
						permissions.department.CREATE,
						permissions.employee.VIEW,
						permissions.employee.CREATE,
						permissions.holiday.VIEW,
						permissions.holiday.CREATE,
						permissions.leave.VIEW,
						permissions.leave.CREATE,
						permissions.overtime.VIEW,
						permissions.overtime.CREATE,
						permissions.project.VIEW,
						permissions.project.CREATE,
					],
				},
				{
					title: 'administration',
					links: [
						{
							admin: true,
							icon: FaArchive,
							title: 'assets',
							href: routes.ASSETS_PAGE_URL,
							permissions: [permissions.asset.VIEW, permissions.asset.CREATE],
							// check if the user has view assets obj permission
							objPerm: !!data?.objPermissions.find(
								(perm) =>
									perm.modelName === 'assets' && perm.permission === 'VIEW'
							),
						},
						{
							admin: true,
							icon: FaFileArchive,
							title: 'API documentation',
							href: routes.DOCS_PAGE_URL,
							permissions: [permissions.apidoc.VIEW],
						},
						{
							admin: true,
							icon: FaRProject,
							title: 'jobs',
							href: routes.JOBS_PAGE_URL,
							permissions: [permissions.job.VIEW, permissions.job.CREATE],
							// check if the user has view jobs obj permission
							objPerm: !!data?.objPermissions.find(
								(perm) =>
									perm.modelName === 'jobs' && perm.permission === 'VIEW'
							),
						},
						{
							admin: true,
							icon: FaUsersCog,
							title: 'users',
							links: [
								{
									icon: FaPeopleArrows,
									title: 'all users',
									href: routes.USERS_PAGE_URL,
									permissions: [permissions.user.VIEW, permissions.user.CREATE],
									// check if the user has view users obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'users' && perm.permission === 'VIEW'
									),
								},
								{
									icon: FaUserShield,
									title: 'groups',
									href: routes.GROUPS_PAGE_URL,
									permissions: [
										permissions.group.VIEW,
										permissions.group.CREATE,
									],
									// check if the user has view leaves obj permission
									objPerm: !!data?.objPermissions.find(
										(perm) =>
											perm.modelName === 'groups' && perm.permission === 'VIEW'
									),
								},
								{
									icon: FaLock,
									title: 'permissions',
									href: routes.PERMISSIONS_PAGE_URL,
									permissions: [permissions.permission.VIEW],
								},
							],
						},
					],
					permissions: [
						permissions.asset.VIEW,
						permissions.group.VIEW,
						permissions.job.VIEW,
						permissions.permission.VIEW,
						permissions.user.VIEW,
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
					permissions: [],
				},
			],
			[isLoading, signOut, data]
		);

		const protectedLinkCategories = React.useMemo(() => {
			// if data is undefined return links that have empty permissions
			if (!data) return links.filter((link) => link.permissions.length <= 0);

			let protectedCategories = links.filter((link) => {
				// Check for empty permissions
				if (link.permissions.length <= 0) return link;
				// isSuperUser
				if (data.isSuperUser) return link;
				// isAdmin. Check if the link requires admin access only
				if (link.admin && !data.isAdmin) return false;
				const hasPerm = hasModelPermission(data.permissions, link.permissions);
				if (hasPerm) return link;
				// Check for object permissions
				const hasObjPerm = link.links.find((item) => item.objPerm === true);
				if (hasObjPerm) return link;
			});
			return protectedCategories;
		}, [data, links]);

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
								{data ? data.fullName : 'Anonymous'}
							</p>
							<span className="capitalize italic text-gray-300 text-tiny tracking-white md:text-xs">
								{data.employee?.job?.name || 'user'}
							</span>
						</>
					)}
				</div>
				<div className="mt-3">
					{protectedLinkCategories.map(({ links, title }, index) => (
						<div className="mb-2" key={index}>
							<h6 className="font-bold mb-2 px-2 text-sm text-gray-400 tracking-widest uppercase md:text-lg lg:text-base">
								{title}
							</h6>

							{links.map(
								(
									{
										admin = false,
										href,
										onClick,
										objPerm,
										permissions = [],
										...props
									},
									index
								) => {
									// if the auth data hasn't loaded yet
									if (!data) return <></>;

									if ('links' in props) {
										const { links = [], ...linkProps } = props;
										// Filter links to see which one the user's has permissions for
										const filteredLinks = links.filter(
											({
												permissions = [],
												admin = false,
												links: linkItems = [],
											}) => {
												// Check if the link has permissions
												if (permissions.length > 0) {
													// Check if the link needs admin rights
													if (admin && !data.isAdmin && !data.isSuperUser)
														return false;

													// Check if the user doesn't have permission
													const hasPerm = hasModelPermission(
														data.permissions,
														permissions
													);

													// Check if the user doesn't have object permission
													const hasObjPerm = linkItems.find(
														(item) => item.objPerm === true
													);

													// and is not a super user
													if (!hasPerm && !hasObjPerm && !data.isSuperUser)
														return false;
												}
												return true;
											}
										);
										return filteredLinks.length <= 0 ? (
											<></>
										) : (
											<ListLink
												onClick={() => {
													if (onClick) onClick();
													setVisible(false);
												}}
												links={filteredLinks}
												key={index}
												{...linkProps}
											/>
										);
									} else {
										// Check if the link has permissions
										if (permissions.length > 0) {
											// Check if the link needs admin rights
											if (admin && !data.isAdmin && !data.isSuperUser)
												return <></>;

											// Check if the user doesn't have permission
											// and is not a super user
											const hasPerm = hasModelPermission(
												data.permissions,
												permissions
											);

											// also check the objPerm
											if (!hasPerm && !objPerm && !data.isSuperUser)
												return <></>;
										}
										return (
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
									}
								}
							)}
						</div>
					))}
				</div>
			</nav>
		);
	}
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
