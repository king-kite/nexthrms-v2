import { InfoComp } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

import Container from '../../components/common/container';
import InfoTopBar from '../../components/common/info-topbar';
import { DEFAULT_IMAGE } from '../../config/static';
import { useGetLeaveQuery } from '../../store/queries/leaves';
import type { LeaveType } from '../../types';
import { getDate, getNoOfDays, serializeLeave, getMediaUrl } from '../../utils';

const DynamicDetailActions = dynamic<any>(
  () => import('../../components/leaves/detail-actions').then((mod) => mod.default),
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

const Detail = ({ admin = false, leave }: { admin?: boolean; leave: LeaveType }) => {
  const router = useRouter();

  const id = React.useMemo(() => router.query.id as string, [router]);
  const detailActionsRef = React.useRef<{
    refreshPerm: () => void;
  }>(null);

  const {
    data: leaveData,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useGetLeaveQuery(
    { id, admin },
    {
      initialData() {
        return leave;
      },
    }
  );

  const data = React.useMemo(() => {
    if (leaveData) return serializeLeave(leaveData);
    return undefined;
  }, [leaveData]);
  return (
    <Container
      heading={admin ? 'Leave Information (Admin)' : 'Leave Information'}
      error={
        error
          ? {
              statusCode: (error as any).response?.status || (error as any).status || 500,
              title: (error as any)?.response?.data?.message || (error as any).message,
            }
          : undefined
      }
      icon
      refresh={{
        loading: isFetching,
        onClick: () => {
          if (detailActionsRef.current?.refreshPerm) detailActionsRef.current.refreshPerm();
          refetch();
        },
      }}
      loading={isLoading}
    >
      {data && (
        <>
          <InfoTopBar
            email={data.employee.user.email}
            full_name={data.employee.user.firstName + ' ' + data.employee.user.lastName}
            image={
              data.employee.user.profile?.image
                ? getMediaUrl(data.employee.user.profile.image)
                : DEFAULT_IMAGE
            }
            actions={
              <DynamicDetailActions
                admin={admin}
                data={data}
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
                  title: 'First Name',
                  value: data.employee.user.firstName,
                },
                {
                  title: 'Last Name',
                  value: data.employee.user.lastName,
                },
                { title: 'E-mail', value: data.employee.user.email },
                {
                  title: 'Department',
                  value: data.employee.department?.name || '------',
                },
                { title: 'Job', value: data.employee.job?.name || '------' },
              ]}
              title="employee information"
            />

            <InfoComp
              infos={[
                {
                  title: 'Type of Leave',
                  value: data.type,
                },
                {
                  options: {
                    bg:
                      data.status === 'APPROVED'
                        ? 'success'
                        : data.status === 'DENIED'
                        ? 'error'
                        : data.expired
                        ? 'info'
                        : 'warning',
                  },
                  title: 'Status',
                  value: data.status === 'PENDING' && data.expired ? 'EXPIRED' : data.status,
                  type: 'badge',
                },
                {
                  title: 'Start Date',
                  value: getDate(data.startDate, true) as string,
                },
                {
                  title: 'Resumption',
                  value: getDate(data.endDate, true) as string,
                },
                {
                  title: 'Number Of Days',
                  value: getNoOfDays(data.startDate, data.endDate),
                },
                { title: 'Reason For Leave', value: data.reason },
                {
                  title: 'Last Updated',
                  value: getDate(data.updatedAt, true) as string,
                },
                {
                  title: 'Date Requested',
                  value: getDate(data.createdAt, true) as string,
                },
              ]}
              title="leave information"
            />

            {data.createdBy && (
              <InfoComp
                infos={[
                  {
                    title: 'Profile Image',
                    type: 'image',
                    component: () => (
                      <div className="h-[75px] relative rounded-full w-[75px]">
                        <Image
                          className="h-full rounded-full w-full"
                          layout="fill"
                          src={
                            data.createdBy?.user.profile?.image
                              ? getMediaUrl(data.createdBy.user.profile.image)
                              : DEFAULT_IMAGE
                          }
                          alt={data.createdBy ? data.createdBy.user.firstName : 'user'}
                        />
                      </div>
                    ),
                  },
                  {
                    title: 'First Name',
                    value: data.createdBy.user.firstName,
                  },
                  {
                    title: 'Last Name',
                    value: data.createdBy.user.lastName,
                  },
                  {
                    title: 'Email',
                    value: data.createdBy.user.email,
                  },
                  {
                    title: 'Department',
                    value: data.createdBy.department?.name || '-------',
                  },
                  {
                    title: 'Job',
                    value: data.createdBy.job?.name || '-------',
                  },
                ]}
                title="Created By"
              />
            )}

            {data.approvedBy && (
              <InfoComp
                infos={[
                  {
                    title: 'Profile Image',
                    type: 'image',
                    component: () => (
                      <div className="h-[75px] relative rounded-full w-[75px]">
                        <Image
                          className="h-full rounded-full w-full"
                          layout="fill"
                          src={
                            data.approvedBy?.user.profile?.image
                              ? getMediaUrl(data.approvedBy.user.profile.image)
                              : DEFAULT_IMAGE
                          }
                          alt={data.approvedBy ? data.approvedBy.user.firstName : 'user'}
                        />
                      </div>
                    ),
                  },
                  {
                    title: 'First Name',
                    value: data.approvedBy.user.firstName,
                  },
                  {
                    title: 'Last Name',
                    value: data.approvedBy.user.lastName,
                  },
                  {
                    title: 'Email',
                    value: data.approvedBy.user.email,
                  },
                  {
                    title: 'Department',
                    value: data.approvedBy.department?.name || '-------',
                  },
                  {
                    title: 'Job',
                    value: data.approvedBy.job?.name || '-------',
                  },
                ]}
                title="Approved/Denied By"
              />
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default Detail;
