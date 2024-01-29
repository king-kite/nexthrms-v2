import { InfoComp } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

import Container from '../../components/common/container';
import InfoTopBar from '../../components/common/info-topbar';
import { DEFAULT_IMAGE } from '../../config/static';
import { useGetEmployeeQuery } from '../../store/queries/employees';
import { EmployeeType } from '../../types';
import { getDate, toCapitalize, getMediaUrl } from '../../utils';

const DynamicDetailActions = dynamic<any>(
  () => import('../../components/employees/detail/detail-actions').then((mod) => mod.default),
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

const Employee = ({ employee }: { employee: EmployeeType }) => {
  const router = useRouter();
  const id = React.useMemo(() => router.query.id as string, [router]);
  const detailActionsRef = React.useRef<{
    refreshPerm: () => void;
    refreshUserPerm: () => void;
  }>(null);

  const { data, error, isLoading, isFetching, refetch } = useGetEmployeeQuery(
    {
      id,
    },
    {
      initialData() {
        return employee;
      },
    }
  );

  return (
    <Container
      heading="Employee Information"
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
          if (detailActionsRef.current?.refreshUserPerm) detailActionsRef.current.refreshUserPerm();
          refetch();
        },
      }}
      loading={isLoading}
      title={data ? data.user.firstName + ' ' + data.user.lastName : undefined}
    >
      {data && (
        <>
          <InfoTopBar
            email={data?.user.email}
            full_name={toCapitalize(data.user.firstName + ' ' + data.user.lastName)}
            image={data.user.profile?.image ? getMediaUrl(data.user.profile.image) : DEFAULT_IMAGE}
            actions={
              <DynamicDetailActions
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
                  value: toCapitalize(data.user.firstName || ''),
                },
                {
                  title: 'Last Name',
                  value: toCapitalize(data.user.lastName || ''),
                },
                { title: 'E-mail', value: data.user.email || '' },
                {
                  title: 'Birthday',
                  value: data.user.profile?.dob
                    ? (getDate(data.user.profile?.dob, true) as string)
                    : '---',
                },
                {
                  title: 'Gender',
                  value: toCapitalize(data.user.profile?.gender || ''),
                },
                {
                  title: 'Status',
                  value:
                    data.leaves.length > 0
                      ? 'ON LEAVE'
                      : data.user.isActive
                      ? 'ACTIVE'
                      : 'INACTIVE',
                  type: 'badge',
                  options: {
                    bg:
                      data.leaves.length > 0
                        ? 'warning'
                        : data.user.isActive
                        ? 'success'
                        : 'danger',
                  },
                },
              ]}
              title="personal information"
            />

            <InfoComp
              infos={[
                { title: 'E-mail', value: data.user.email || '' },
                { title: 'Mobile', value: data.user.profile?.phone || '' },
                { title: 'Address', value: data.user.profile?.address || '' },
                {
                  title: 'State',
                  value: toCapitalize(data.user.profile?.state || ''),
                },
                {
                  title: 'City',
                  value: toCapitalize(data.user.profile?.city || ''),
                },
              ]}
              title="contact information"
            />

            <InfoComp
              infos={[
                {
                  title: 'Job Title',
                  value: data.job ? toCapitalize(data.job.name) : '------',
                },
                {
                  title: 'Department',
                  value: data?.department ? toCapitalize(data.department.name) : '-------',
                },
                {
                  title: 'Current Leave Date',
                  value:
                    data.leaves.length > 0
                      ? `${(
                          getDate(data.leaves[data.leaves.length - 1].startDate) as Date
                        ).toDateString()} --- ${(
                          getDate(data.leaves[data.leaves.length - 1].endDate) as Date
                        ).toDateString()}`
                      : '-------',
                },
                {
                  title: 'Length Of Leave',
                  value:
                    data.leaves.length > 0
                      ? (new Date(data.leaves[data.leaves.length - 1].endDate).getTime() -
                          new Date(data.leaves[data.leaves.length - 1].startDate).getTime()) /
                        (24 * 60 * 60 * 1000)
                      : '-------',
                },
                {
                  title: 'Date Employed',
                  value: data?.dateEmployed ? (getDate(data.dateEmployed, true) as string) : '----',
                },
              ]}
              title="Additional information"
            />

            {data?.supervisors.map((supervisor, index) => (
              <InfoComp
                key={index}
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
                            supervisor.user.profile?.image
                              ? getMediaUrl(supervisor.user.profile.image)
                              : DEFAULT_IMAGE
                          }
                          alt={supervisor.user.firstName}
                        />
                      </div>
                    ),
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
                    value: supervisor.department?.name || '-------',
                  },
                ]}
                title={`Supervisor Information -> ${supervisor.user.firstName} ${supervisor.user.lastName}`}
              />
            ))}

            {data?.department?.hod && (
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
                            data.department?.hod?.user.profile?.image
                              ? getMediaUrl(data.department?.hod?.user.profile.image)
                              : DEFAULT_IMAGE
                          }
                          alt={data.department?.hod ? data.department?.hod?.user.firstName : 'user'}
                        />
                      </div>
                    ),
                  },
                  {
                    title: 'First Name',
                    value: data.department.hod.user.firstName,
                  },
                  {
                    title: 'Last Name',
                    value: data.department.hod.user.lastName,
                  },
                  {
                    title: 'Email',
                    value: data.department.hod.user.email,
                  },
                ]}
                title="Head of Department Information"
              />
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default Employee;
