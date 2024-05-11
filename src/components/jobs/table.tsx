import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaExclamationCircle, FaPen, FaTrash, FaUserShield } from 'react-icons/fa';

import { permissions, JOB_OBJECT_PERMISSIONS_PAGE_URL } from '../../config';
import { useAlertContext, useAlertModalContext, useAuthContext } from '../../store/contexts';
import { useDeleteJobMutation } from '../../store/queries/jobs';
import { JobType } from '../../types/jobs';
import { getStringedDate, hasModelPermission } from '../../utils';

enum JobTypeOptions {
  'Full Time' = 'FULL_TIME',
  'Part Time' = 'PART_TIME',
  'Internship' = 'INTERNSHIP',
  'Temporary' = 'TEMPORARY',
  'Other' = 'OTHER',
}
const heads: TableHeadType = [
  { value: 'name' },
  { value: 'department' },
  { value: 'start date' },
  { value: 'end date' },
  { value: 'job type' },
  { type: 'actions', value: 'edit' },
];

function getBadge(value: JobType['type']) {
  switch (value) {
    case JobTypeOptions['Full Time']:
      return {
        color: 'green',
        value: 'Full Time',
      };
    case JobTypeOptions['Part Time']:
      return {
        color: 'pacify',
        value: 'Part Time',
      };
    case JobTypeOptions['Internship']:
      return {
        color: 'warning',
        value: 'Internship',
      };
    case JobTypeOptions['Temporary']:
      return {
        color: 'danger',
        value: 'Temporary',
      };
    default:
      return {
        color: 'info',
        value: 'Other',
      };
  }
}

const getRows = (
  data: JobType[],
  disableAction: boolean,
  canViewPermissions: boolean,
  updateJob?: (job: JobType) => void,
  deleteJob?: (id: string) => void
): TableRowType[] =>
  data.map((job) => {
    const actions: {
      color: string;
      disabled?: boolean;
      icon: IconType;
      link?: string;
      onClick?: () => void;
    }[] = [];
    if (updateJob)
      actions.push({
        color: 'primary',
        disabled: disableAction,
        icon: FaPen,
        onClick: () => updateJob(job),
      });
    if (deleteJob)
      actions.push({
        color: 'danger',
        disabled: disableAction,
        icon: FaTrash,
        onClick: () => deleteJob(job.id),
      });

    if (canViewPermissions)
      actions.push({
        color: 'info',
        icon: FaUserShield,
        link: JOB_OBJECT_PERMISSIONS_PAGE_URL(job.id),
      });

    const badge = getBadge(job.type);

    return {
      id: job.id,
      rows: [
        { value: job.name },
        { value: job.department?.name || '---' },
        {
          value: job.startDate ? getStringedDate(job.startDate) : '---',
        },
        {
          value: job.endDate ? getStringedDate(job.endDate) : '---',
        },
        {
          options: {
            bg: badge.color,
          },
          type: 'badge',
          value: badge.value,
        },
        {
          type: 'actions',
          value: actions,
        },
      ],
    };
  });

type TableType = {
  jobs: JobType[];
  offset?: number;
  updateJob?: (job: JobType) => void;
};

const JobTable = ({ jobs = [], offset = 0, updateJob }: TableType) => {
  const { open: openAlert } = useAlertContext();
  const { data: authData } = useAuthContext();
  const { close: closeModal, open: openModal, showLoader } = useAlertModalContext();

  const [canDelete, canViewPermissions] = React.useMemo(() => {
    if (!authData) return [false, false];
    const canDelete =
      authData.isSuperUser || hasModelPermission(authData.permissions, [permissions.job.DELETE]);
    const canViewPermission =
      authData.isSuperUser ||
      hasModelPermission(authData.permissions, [permissions.permissionobject.VIEW]);
    return [canDelete, canViewPermission];
  }, [authData]);

  const { mutate: deleteJob, isLoading } = useDeleteJobMutation({
    onSuccess() {
      closeModal();
      openAlert({
        type: 'success',
        message: 'Job Deleted Successfully.',
      });
    },
    onError(error) {
      closeModal();
      openAlert({
        message: error.message,
        type: 'danger',
      });
    },
  });

  const handleDelete = React.useCallback(
    (id: string) => {
      if (!canDelete) return;
      openModal({
        closeOnButtonClick: false,
        color: 'danger',
        decisions: [
          {
            color: 'info',
            disabled: isLoading,
            onClick: closeModal,
            title: 'Cancel',
          },
          {
            color: 'danger',
            disabled: isLoading,
            onClick: () => {
              showLoader();
              deleteJob(id);
            },
            title: 'Confirm',
          },
        ],
        icon: FaExclamationCircle,
        header: 'Delete Job?',
        message: 'Do you want to delete this Job?.',
      });
    },
    [closeModal, canDelete, isLoading, openModal, showLoader, deleteJob]
  );

  const { jobs: deferredValue, offset: deferredOffset } = React.useDeferredValue({ jobs, offset });
  const rows = React.useMemo(
    () => getRows(deferredValue, isLoading, canViewPermissions, updateJob, handleDelete),
    [deferredValue, updateJob, canViewPermissions, handleDelete, isLoading]
  );

  return (
    <Table
      sn={deferredOffset}
      heads={heads}
      rows={rows}
      renderActionLinkAs={({ link, children, ...props }) => (
        <Link href={link}>
          <a {...props}>{children}</a>
        </Link>
      )}
      renderContainerLinkAs={(props) => (
        <Link href={props.link}>
          <a className={props.className}>{props.children}</a>
        </Link>
      )}
    />
  );
};

export default JobTable;
