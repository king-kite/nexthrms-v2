import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaCheckCircle, FaExclamationCircle, FaPen, FaTrash, FaUserShield } from 'react-icons/fa';

import { permissions, DEPARTMENT_OBJECT_PERMISSIONS_PAGE_URL } from '../../config';
import { useAlertContext, useAlertModalContext, useAuthContext } from '../../store/contexts';
import {
  useDeleteDepartmentMutation,
  useDeleteDepartmentsMutation,
} from '../../store/queries/departments';
import { DepartmentType } from '../../types/departments';
import { hasModelPermission, toCapitalize } from '../../utils';

const getRows = (
  data: DepartmentType[],
  disableAction: boolean,
  canViewPermissions: boolean,
  updateDep?: (data: { id: string; name: string; hod: string | null }) => void,
  deleteDep?: (id: string) => void
): TableRowType[] =>
  data.map((department) => {
    const actions: {
      color: string;
      disabled?: boolean;
      icon: IconType;
      link?: string;
      onClick?: () => void;
    }[] = [];
    if (updateDep)
      actions.push({
        color: 'primary',
        disabled: disableAction,
        icon: FaPen,
        onClick: () =>
          updateDep({
            id: department.id,
            name: toCapitalize(department.name),
            hod: department.hod ? department.hod.id : null,
          }),
      });
    if (deleteDep)
      actions.push({
        color: 'danger',
        disabled: disableAction,
        icon: FaTrash,
        onClick: () => deleteDep(department.id),
      });

    if (canViewPermissions)
      actions.push({
        color: 'info',
        icon: FaUserShield,
        link: DEPARTMENT_OBJECT_PERMISSIONS_PAGE_URL(department.id),
      });

    return {
      id: department.id,
      rows: [
        { value: department.name },
        {
          value: department.hod
            ? department.hod.user.firstName + ' ' + department.hod.user.lastName
            : '---',
        },
        { value: department._count.employees },
        {
          type: 'actions',
          value: actions,
        },
      ],
    };
  });

type TableType = {
  departments: DepartmentType[];
  offset?: number;
  updateDep?: (data: { id: string; name: string; hod: string | null }) => void;
};

const heads: TableHeadType = [
  { value: 'name' },
  { value: 'head of department' },
  { value: 'no. of employees' },
  { type: 'actions', value: 'edit' },
];

const DepartmentTable = ({ departments = [], offset = 0, updateDep }: TableType) => {
  const { open: openAlert } = useAlertContext();
  const { data: authData } = useAuthContext();
  const { close: closeModal, open: openModal, showLoader } = useAlertModalContext();

  const [canDelete, canViewPermissions] = React.useMemo(() => {
    if (!authData) return [false, false];
    const canDelete =
      authData.isSuperUser ||
      hasModelPermission(authData.permissions, [permissions.department.DELETE]);
    const canViewPermission =
      authData.isSuperUser ||
      hasModelPermission(authData.permissions, [permissions.permissionobject.VIEW]);
    return [canDelete, canViewPermission];
  }, [authData]);

  const { mutate: deleteDepartment, isLoading: depLoading } = useDeleteDepartmentMutation({
    onSuccess() {
      openModal({
        color: 'success',
        decisions: [
          {
            color: 'success',
            title: 'OK',
            onClick: closeModal,
          },
        ],
        icon: FaCheckCircle,
        header: 'Department Deleted',
        message: 'Department Deleted Successfully.',
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

  const { mutate: deleteDepartments, isLoading: depsLoading } = useDeleteDepartmentsMutation({
    onSuccess() {
      openModal({
        color: 'success',
        decisions: [
          {
            color: 'success',
            title: 'OK',
            onClick: closeModal,
          },
        ],
        icon: FaCheckCircle,
        header: 'Departments Deleted',
        message: 'Departments were deleted successfully!',
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
            disabled: depLoading,
            onClick: closeModal,
            title: 'Cancel',
          },
          {
            color: 'danger',
            disabled: depLoading,
            onClick: () => {
              showLoader();
              deleteDepartment(id);
            },
            title: 'Confirm',
          },
        ],
        icon: FaExclamationCircle,
        header: 'Delete Department?',
        message: 'Do you want to delete this Department?.',
      });
    },
    [canDelete, closeModal, depLoading, openModal, deleteDepartment, showLoader]
  );

  const handleDeleteMultiple = React.useCallback(
    (ids: string[]) => {
      if (ids.length > 0) {
        openModal({
          color: 'danger',
          closeOnButtonClick: false,
          decisions: [
            {
              color: 'info',
              disabled: depsLoading,
              onClick: closeModal,
              title: 'Cancel',
            },
            {
              color: 'danger',
              disabled: depsLoading,
              onClick: () => {
                showLoader();
                deleteDepartments(ids);
              },
              title: 'Confirm',
            },
          ],
          icon: FaExclamationCircle,
          header: 'Delete selected departments?',
          message: 'Do you want to delete selected departments?.',
        });
      }
    },
    [closeModal, depsLoading, openModal, deleteDepartments, showLoader]
  );

  const { offset: deferredOffset, departments: deferredValue } = React.useDeferredValue({
    departments,
    offset,
  });
  const rows = React.useMemo(
    () =>
      getRows(
        deferredValue,
        depLoading,
        canViewPermissions,
        updateDep,
        canDelete ? handleDelete : undefined
      ),
    [deferredValue, updateDep, canViewPermissions, handleDelete, canDelete, depLoading]
  );

  return (
    <Table
      heads={heads}
      rows={rows}
      tick={canDelete}
      sn={deferredOffset}
      actions={
        canDelete
          ? {
              actions: [
                {
                  title: 'Delete departments',
                  value: 'del_dep',
                  onSubmit: handleDeleteMultiple,
                },
              ],
            }
          : undefined
      }
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

export default DepartmentTable;
