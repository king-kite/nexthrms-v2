import { Alert, Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import React from 'react';
import {
  FaCheckCircle,
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
  FaPlus,
  FaSearch,
} from 'react-icons/fa';

import Container from '../../components/common/container';
import JobTable from '../../components/jobs/table';
import {
  DEFAULT_PAGINATION_SIZE,
  JOBS_EXPORT_URL,
  JOBS_IMPORT_URL,
  permissions,
  samples,
} from '../../config';
import { useAlertContext, useAlertModalContext, useAuthContext } from '../../store/contexts';
import { useGetJobsQuery } from '../../store/queries/jobs';
import { JobType } from '../../types';
import { hasModelPermission } from '../../utils';

const DynamicExportForm = dynamic<any>(
  () => import('../../components/common/export-form').then((mod) => mod.default),
  {
    loading: () => (
      <p className="text-center text-gray-500 text-sm md:text-base">Loading Form...</p>
    ),
    ssr: false,
  }
);
const DynamicImportForm = dynamic<any>(
  () => import('../../components/common/import-form').then((mod) => mod.default),
  {
    loading: () => (
      <p className="text-center text-gray-500 text-sm md:text-base">Loading Form...</p>
    ),
    ssr: false,
  }
);
const DynamicForm = dynamic<any>(
  () => import('../../components/jobs/form').then((mod) => mod.default),
  {
    loading: () => (
      <p className="text-center text-gray-500 text-sm md:text-base">Loading Form...</p>
    ),
    ssr: false,
  }
);
const DynamicModal = dynamic<any>(
  () => import('../../components/common/modal').then((mod) => mod.default),
  {
    ssr: false,
  }
);

const DynamicTablePagination = dynamic<any>(
  () => import('../../components/common/table/pagination').then((mod) => mod.default),
  {
    ssr: false,
  }
);

const Jobs = ({
  jobs,
}: {
  jobs: {
    total: number;
    result: JobType[];
  };
}) => {
  const [bulkForm, setBulkForm] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editJob, setEditJob] = React.useState<JobType>();

  const { open } = useAlertContext();
  const { open: openModal } = useAlertModalContext();
  const { data: authData } = useAuthContext();

  const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
  const [offset, setOffset] = React.useState(0);
  const [nameSearch, setNameSearch] = React.useState('');

  const searchRef = React.useRef<HTMLInputElement>(null);
  const paginateRef = React.useRef<{
    changePage: (num: number) => void;
  } | null>(null);

  const [canCreate, canExport, canView, canEdit] = React.useMemo(() => {
    if (!authData) return [false, false, false, false];
    const canCreate =
      authData.isSuperUser || hasModelPermission(authData.permissions, [permissions.job.CREATE]);
    const canExport =
      authData.isSuperUser || hasModelPermission(authData.permissions, [permissions.job.EXPORT]);
    const canView =
      authData.isSuperUser ||
      hasModelPermission(authData.permissions, [permissions.job.VIEW]) ||
      !!authData.objPermissions.find(
        (perm) => perm.modelName === 'jobs' && perm.permission === 'VIEW'
      );
    const canEdit =
      authData.isSuperUser || hasModelPermission(authData.permissions, [permissions.job.EDIT]);
    return [canCreate, canExport, canView, canEdit];
  }, [authData]);

  const { data, isFetching, refetch } = useGetJobsQuery(
    {
      limit,
      offset,
      search: nameSearch,
      onError(error) {
        open({
          type: 'danger',
          message: error.message,
        });
      },
    },
    {
      initialData() {
        return jobs;
      },
    }
  );

  return (
    <Container
      heading="Jobs"
      refresh={{
        loading: isFetching,
        onClick: refetch,
      }}
      error={!canCreate && !canView ? { statusCode: 403 } : undefined}
    >
      <div className="flex flex-wrap items-center mb-2 py-2 w-full lg:pb-0">
        <form
          className="flex items-center mb-3 w-full md:mb-0 md:w-1/2 lg:mb-0 lg:w-2/5"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchRef.current?.value) {
              // change the page to 1
              paginateRef.current?.changePage(1);
              setNameSearch(searchRef.current?.value);
            }
          }}
        >
          <InputButton
            buttonProps={{
              caps: true,
              disabled: isFetching,
              iconLeft: FaSearch,
              title: 'Search',
              type: 'submit',
            }}
            inputProps={{
              disabled: isFetching,
              icon: FaSearch,
              onChange: ({ target: { value } }) => {
                if (value === '') {
                  // change the page to 1
                  paginateRef.current?.changePage(1);
                  setNameSearch('');
                }
              },
              placeholder: 'Search Job By Name e.g. accountant',
              rounded: 'rounded-l-lg',
              type: 'search',
            }}
            ref={searchRef}
          />
        </form>
        {canCreate && (
          <>
            <div className="my-3 w-full sm:pr-1 sm:w-1/3 md:w-1/4 md:my-0 md:px-3 lg:pl-2 lg:pr-0 lg:w-1/5">
              <Button
                onClick={() => {
                  setEditJob(undefined);
                  setBulkForm(false);
                  setModalVisible(true);
                }}
                iconRight={FaPlus}
                rounded="rounded-lg"
                title="Add Job"
              />
            </div>
            <div className="my-3 w-full sm:px-2 sm:w-1/3 md:w-1/4 md:px-0 md:my-0 lg:px-2 lg:w-1/5">
              <Button
                bold="normal"
                caps
                onClick={() => {
                  setBulkForm(true);
                  setEditJob(undefined);
                  setModalVisible(true);
                }}
                iconRight={FaCloudUploadAlt}
                rounded="rounded-lg"
                title="Bulk Import"
              />
            </div>
          </>
        )}
        {canExport && (
          <div className="my-3 w-full sm:pl-1 sm:w-1/3 md:mb-0 md:mt-5 md:pl-0 md:w-1/4 lg:my-0 lg:w-1/5">
            <ButtonDropdown
              component={() => (
                <DynamicExportForm
                  all={JOBS_EXPORT_URL}
                  filtered={`&offset=${offset}&limit=${limit}&search=${nameSearch}`}
                />
              )}
              props={{
                caps: true,
                iconLeft: FaCloudDownloadAlt,
                margin: 'lg:mr-6',
                padding: 'px-3 py-2 md:px-6',
                rounded: 'rounded-xl',
                title: 'export',
              }}
            />
          </div>
        )}
      </div>
      <div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
        <JobTable
          jobs={data?.result || []}
          offset={offset}
          updateJob={
            !canEdit
              ? undefined
              : (job: JobType) => {
                  setEditJob(job);
                  setModalVisible(true);
                }
          }
        />
        {data && data?.total > 0 && (
          <DynamicTablePagination
            disabled={isFetching}
            totalItems={data.total}
            handleRef={{ ref: paginateRef }}
            onChange={(pageNo: number) => {
              const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
              offset !== value && setOffset(value * limit);
            }}
            onSizeChange={(size: number) => setLimit(size)}
            pageSize={limit}
          />
        )}
      </div>

      {(canCreate || canEdit) && (
        <DynamicModal
          close={() => {
            setModalVisible(false);
            setEditJob(undefined);
          }}
          component={
            !modalVisible ? (
              <Alert type="info" message="Loading..." />
            ) : bulkForm ? (
              <DynamicImportForm
                onSuccess={(data: any) => {
                  open({
                    type: 'success',
                    message: data.message,
                  });
                  setModalVisible(false);
                  setBulkForm(false);
                }}
                requirements={[
                  {
                    required: false,
                    title: 'id',
                    value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
                  },
                  {
                    title: 'name',
                    value: 'steel binder',
                  },
                  {
                    required: false,
                    title: 'updated_at',
                    value: '2023-03-26T21:49:51.090Z',
                  },
                  {
                    required: false,
                    title: 'created_at',
                    value: '2023-03-26T21:49:51.090Z',
                  },
                ]}
                sample={samples.jobs}
                url={JOBS_IMPORT_URL}
              />
            ) : (
              <DynamicForm
                data={editJob}
                editMode={!!editJob}
                onSuccess={() => {
                  setEditJob(undefined);
                  setModalVisible(false);
                  openModal({
                    closeOnButtonClick: true,
                    color: 'success',
                    decisions: [
                      {
                        color: 'success',
                        title: 'OK',
                      },
                    ],
                    icon: FaCheckCircle,
                    header: 'Job Saved',
                    message: 'Job Saved Successfully.',
                  });
                }}
              />
            )
          }
          description={
            editJob
              ? 'Fill in the form below to update a job'
              : 'Fill in the form below to add a job'
          }
          keepVisible
          title={editJob ? 'Update Job' : 'Add Job'}
          visible={modalVisible}
        />
      )}
    </Container>
  );
};

export default Jobs;
