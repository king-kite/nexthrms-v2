import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { InfoComp } from 'kite-react-tailwind';
import { useState } from 'react';
import { FaCheckCircle, FaLock, FaUserEdit } from 'react-icons/fa';

import { ChangePasswordForm, UpdateForm } from '../../components/profile';
import { Container, InfoTopBar, Modal } from '../../components/common';
import { DEFAULT_IMAGE, LEAVES_PAGE_URL, PROFILE_URL } from '../../config';
import { useAlertContext } from '../../store/contexts';
import * as tags from '../../store/tagTypes';
import { getDate, toCapitalize } from '../../utils';
import { axiosInstance } from '../../utils/axios';
import { ProfileResponseType } from '../../types';

const Profile = ({ profile }: { profile: ProfileResponseType['data'] }) => {
	const [formType, setFormType] = useState<'profile' | 'password'>('profile');
	const [modalVisible, setModalVisible] = useState(false);

	const { open: showAlert } = useAlertContext();

	const { data, isLoading, isFetching, refetch } = useQuery(
		[tags.PROFILE],
		() =>
			axiosInstance(PROFILE_URL).then(
				(response: AxiosResponse<ProfileResponseType>) => response.data.data
			),
		{
			initialData() {
				return profile;
			},
		}
	);

	return (
		<Container
			heading="My Profile"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
		>
			<InfoTopBar
				email={data?.email}
				full_name={toCapitalize(`${data?.firstName} ${data?.lastName}`)}
				image={data?.profile?.image?.url || DEFAULT_IMAGE}
				actions={[
					{
						iconLeft: FaUserEdit,
						onClick: () => {
							formType !== 'profile' && setFormType('profile');
							setModalVisible(true);
						},
						title: 'Edit Profile',
					},
					{
						bg: 'bg-gray-600 hover:bg-gray-500',
						iconLeft: FaLock,
						onClick: () => {
							formType !== 'password' && setFormType('password');
							setModalVisible(true);
						},
						title: 'Change Password',
					},
					{
						bg: 'bg-yellow-600 hover:bg-yellow-500',
						iconLeft: FaCheckCircle,
						title: 'Request Leave',
						link: LEAVES_PAGE_URL,
					},
				]}
			/>
			<InfoComp
				infos={[
					{
						title: 'First Name',
						value: toCapitalize(data?.firstName) || '',
					},
					{
						title: 'Last Name',
						value: toCapitalize(data?.lastName) || '',
					},
					{ title: 'E-mail', value: data?.email || '' },
					{
						title: 'Birthday',
						value: data?.profile?.dob
							? (getDate(data.profile.dob, true) as string)
							: '',
					},
					{
						title: 'Gender',
						value: toCapitalize(data?.profile?.gender || ''),
					},
				]}
				title="Personal Information"
			/>
			<InfoComp
				infos={[
					{ title: 'E-mail', value: data?.email || '' },
					{ title: 'Mobile', value: data?.profile?.phone || '' },
					{ title: 'Address', value: data?.profile?.address || '' },
					{
						title: 'State',
						value: toCapitalize(data?.profile?.state || ''),
					},
					{ title: 'City', value: toCapitalize(data?.profile?.city || '') },
				]}
				title="contact information"
			/>
			{data?.employee && (
				<InfoComp
					infos={[
						{
							title: 'Job Title',
							value: toCapitalize(data.employee.job?.name) || '-------',
						},
						{
							title: 'Department',
							value: toCapitalize(data.employee.department?.name) || '-------',
						},
						{
							title: 'Current Leave Date',
							value:
								data.employee.leaves.length > 0
									? `${(
											getDate(
												data.employee.leaves[data.employee.leaves.length - 1]
													.startDate
											) as Date
									  ).toDateString()} --- ${(
											getDate(
												data.employee.leaves[data.employee.leaves.length - 1]
													.endDate
											) as Date
									  ).toDateString()}`
									: '-------',
						},
						{
							title: 'Length Of Leave',
							value:
								data.employee.leaves.length > 0
									? (new Date(
											data.employee.leaves[
												data.employee.leaves.length - 1
											].endDate
									  ).getTime() -
											new Date(
												data.employee.leaves[
													data.employee.leaves.length - 1
												].startDate
											).getTime()) /
									  (24 * 60 * 60 * 1000)
									: '-------',
						},
						{
							title: 'Date Employed',
							value: (
								getDate(data.employee.dateEmployed) as Date
							).toDateString(),
						},
					]}
					title="Employee information"
				/>
			)}
			{data?.employee?.supervisors.map((supervisor, index) => (
				<InfoComp
					key={index}
					infos={[
						{
							title: 'Profile Image',
							type: 'image',
							value: {
								src: supervisor.user.profile?.image?.url || DEFAULT_IMAGE,
								alt: supervisor.user.firstName + ' ' + supervisor.user.lastName,
							},
						},
						{
							title: 'First Name',
							value: supervisor.user.firstName || '-------',
						},
						{
							title: 'Last Name',
							value: supervisor.user.lastName || '-------',
						},
						{
							title: 'Email',
							value: supervisor.user.email || '-------',
						},
						{
							title: 'Department',
							value: supervisor.user.employee.department?.name || '-------',
						},
					]}
					title={`Supervisor Information - ${supervisor.user.firstName} ${supervisor.user.lastName}`}
				/>
			))}

			{data?.employee?.department?.hod && (
				<InfoComp
					infos={[
						{
							title: 'Profile Image',
							type: 'image',
							value: {
								src:
									data.employee.department.hod.user.profile?.image?.url ||
									DEFAULT_IMAGE,
								alt:
									data.employee.department.hod.user.firstName +
									' ' +
									data.employee.department.hod.user.lastName,
							},
						},
						{
							title: 'First Name',
							value: data.employee.department.hod.user.firstName,
						},
						{
							title: 'Last Name',
							value: data.employee.department.hod.user.lastName,
						},
						{
							title: 'Email',
							value: data.employee.department.hod.user.email,
						},
					]}
					title="Head of Department Information"
				/>
			)}
			<Modal
				close={() => setModalVisible(false)}
				component={
					formType === 'profile' && data ? (
						<UpdateForm
							profile={data}
							onSuccess={() => {
								setModalVisible(false);
								showAlert({
									type: 'success',
									message: 'Profile was updated successfully!',
								});
							}}
						/>
					) : formType === 'password' ? (
						<ChangePasswordForm
							onSuccess={() => {
								setModalVisible(false);
								showAlert({
									type: 'success',
									message: 'Password was changed successfully!',
								});
							}}
						/>
					) : (
						<></>
					)
				}
				description={
					formType === 'password'
						? 'Fill in the form to change your password'
						: 'Fill in the form to update your profile'
				}
				keepVisible
				title={
					formType === 'password'
						? 'Change Password'
						: 'Update profile Information'
				}
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Profile;
