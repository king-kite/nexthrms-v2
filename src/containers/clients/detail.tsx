import { InfoComp } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import Container from '../../components/common/container';
import InfoTopBar from '../../components/common/info-topbar';
import { DEFAULT_IMAGE } from '../../config/static';
import { useGetClientQuery } from '../../store/queries/clients';
import { ClientType, UserObjPermType } from '../../types';
import { getDate, toCapitalize } from '../../utils';

const DynamicDetailActions = dynamic<any>(
	() =>
		import('../../components/clients/detail-actions').then(
			(mod) => mod.default
		),
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

const ClientDetail = ({
	client,
	objPerm,
	objUserPerm,
}: {
	client: ClientType;
	objPerm: UserObjPermType;
	objUserPerm: UserObjPermType;
}) => {
	const router = useRouter();
	const id = React.useMemo(() => router.query.id as string, [router]);
	const detailActionsRef = React.useRef<{
		refreshPerm: () => void;
		refreshUserPerm: () => void;
	}>(null);

	const { data, error, isLoading, isFetching, refetch } = useGetClientQuery(
		{ id },
		{
			initialData() {
				return client;
			},
		}
	);

	return (
		<Container
			heading="Client Information"
			error={
				error
					? {
							statusCode:
								(error as any).response?.status || (error as any).status || 500,
							title:
								(error as any)?.response?.data?.message ||
								(error as any).message,
					  }
					: undefined
			}
			refresh={{
				onClick: () => {
					if (detailActionsRef.current?.refreshPerm)
						detailActionsRef.current.refreshPerm();
					if (detailActionsRef.current?.refreshUserPerm)
						detailActionsRef.current.refreshUserPerm();
					refetch();
				},
				loading: isFetching,
			}}
			title={data ? data.company.toUpperCase() : undefined}
			icon
			loading={isLoading}
		>
			{data && (
				<>
					<InfoTopBar
						email={data?.contact.email}
						full_name={toCapitalize(
							`${data?.contact.firstName} ${data?.contact.lastName}`
						)}
						image={data?.contact.profile?.image?.url || DEFAULT_IMAGE}
						actions={
							<DynamicDetailActions
								data={data}
								objPerm={objPerm}
								objUserPerm={objUserPerm}
								forwardedRef={{
									ref: detailActionsRef,
								}}
							/>
						}
					/>

					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'Company',
									value: data?.company?.toUpperCase() || '',
								},
								{ title: 'Position', value: data?.position || '' },
								{
									title: 'Status',
									type: 'badge',
									value: data.contact.isActive ? 'Active' : 'Inactive',
									options: {
										bg: data.contact.isActive ? 'success' : 'error',
										icon: data.contact.isActive ? FaCheckCircle : FaTimesCircle,
									},
								},
							]}
							title="client information"
						/>
					</div>
					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'First Name',
									value: toCapitalize(data?.contact.firstName) || '',
								},
								{
									title: 'Last Name',
									value: toCapitalize(data?.contact.lastName) || '',
								},
								{ title: 'E-mail', value: data?.contact.email || '' },
								{
									title: 'Birthday',
									value: data?.contact.profile?.dob
										? (getDate(data.contact.profile.dob, true) as string)
										: '',
								},
								{
									title: 'Gender',
									value: toCapitalize(data?.contact?.profile?.gender) || '',
								},
							]}
							title="contact person information"
						/>
					</div>
					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'Phone',
									value: data?.contact.profile?.phone || '',
								},
								{
									title: 'Address',
									value: data?.contact.profile?.address || '',
								},
								{
									title: 'State',
									value: toCapitalize(data?.contact.profile?.state || ''),
								},
								{
									title: 'City',
									value: toCapitalize(data?.contact.profile?.city || ''),
								},
							]}
							title="contact & support information"
						/>
					</div>
				</>
			)}
		</Container>
	);
};

export default ClientDetail;
