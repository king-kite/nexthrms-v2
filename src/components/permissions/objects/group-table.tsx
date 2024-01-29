import { Button, Input, Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaCheckCircle, FaPen, FaTimesCircle, FaTrash, FaUserFriends } from 'react-icons/fa';

import { TablePagination } from '../../common';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import { useEditObjectPermissionMutation } from '../../../store/queries/permissions';
import type { PermissionModelChoices, ObjPermGroupType } from '../../../types';

const heads: TableHeadType = [
  { value: 'name' },
  { value: 'view' },
  { value: 'edit' },
  { value: 'delete' },
  { type: 'actions', value: 'actions' },
];

const getRows = (
  data: ObjPermGroupType[],
  removeGroup: (id: string) => void,
  onEdit: (group: ObjPermGroupType) => void
): TableRowType[] =>
  data.map((group) => ({
    id: group.id,
    rows: [
      { value: group.name },
      {
        options: {
          className: `${group.view ? 'text-green-600' : 'text-red-600'} text-sm md:text-base`,
        },
        type: 'icon',
        icon: group.view ? FaCheckCircle : FaTimesCircle,
      },
      {
        options: {
          className: `${group.edit ? 'text-green-600' : 'text-red-600'} text-sm md:text-base`,
        },
        type: 'icon',
        icon: group.edit ? FaCheckCircle : FaTimesCircle,
      },
      {
        options: {
          className: `${group.delete ? 'text-green-600' : 'text-red-600'} text-sm md:text-base`,
        },
        type: 'icon',
        icon: group.delete ? FaCheckCircle : FaTimesCircle,
      },
      {
        type: 'actions',
        value: [
          {
            color: 'primary',
            icon: FaPen,
            onClick: () => onEdit(group),
          },
          {
            color: 'danger',
            icon: FaTrash,
            onClick: () => removeGroup(group.id),
          },
        ],
      },
    ],
  }));

type TableType = {
  groups: ObjPermGroupType[];
  modelName: PermissionModelChoices;
  objectId: string;
  onEdit: (group: ObjPermGroupType) => void;
  openModal: () => void;
};

const GroupPermissionsTable = ({
  groups = [],
  modelName,
  objectId,
  onEdit,
  openModal,
}: TableType) => {
  const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
  const [offset, setOffset] = React.useState(0);
  const [search, setSearch] = React.useState('');

  const { open: showAlert } = useAlertContext();
  const { open: openAlertModal, close, showLoader } = useAlertModalContext();

  const { mutate } = useEditObjectPermissionMutation(
    { model: modelName, id: objectId },
    {
      onError(err) {
        showAlert({
          message: err.data?.groups || err.message,
          type: 'danger',
        });
      },
      onSuccess() {
        showAlert({
          message: 'Removed group successfully!',
          type: 'success',
        });
      },
    },
    {
      onSettled() {
        close();
      },
    }
  );

  const removeGroup = React.useCallback(
    (id: string) => {
      openAlertModal({
        closeOnButtonClick: false,
        header: 'Remove Group?',
        color: 'danger',
        message: 'Do you want to remove this group?',
        decisions: [
          {
            bg: 'bg-gray-600 hover:bg-gray-500',
            caps: true,
            onClick: close,
            title: 'cancel',
          },
          {
            bg: 'bg-red-600 hover:bg-red-500',
            caps: true,
            onClick: () => {
              showLoader();
              mutate([
                {
                  method: 'DELETE',
                  permission: 'DELETE',
                  form: { groups: [id] },
                },
                {
                  method: 'DELETE',
                  permission: 'EDIT',
                  form: { groups: [id] },
                },
                {
                  method: 'DELETE',
                  permission: 'VIEW',
                  form: { groups: [id] },
                },
              ]);
            },
            title: 'proceed',
          },
        ],
      });
    },
    [openAlertModal, close, mutate, showLoader]
  );

  const searchedGroups = React.useMemo(() => {
    let values = groups;
    const searchInput = search.trim().toLowerCase();
    if (searchInput.length >= 0) {
      values = groups.filter((group) => {
        const groupSearchVariable = group.name.toLowerCase();
        if (groupSearchVariable.includes(searchInput)) return group;
      });
      values = values.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        return aName < bName ? -1 : aName > bName ? 1 : 0;
      });
    }
    return values;
  }, [search, groups]);

  const paginatedGroups = React.useMemo(() => {
    const values = [...searchedGroups];
    return values.splice(offset, limit);
  }, [searchedGroups, limit, offset]);

  const deferredValue = React.useDeferredValue(paginatedGroups);
  const rows = React.useMemo(() => {
    return getRows(deferredValue, removeGroup, onEdit);
  }, [deferredValue, removeGroup, onEdit]);

  return (
    <div>
      <div className="flex flex-wrap items-end w-full md:justify-between">
        <div className="my-2 w-full sm:px-2 sm:w-2/3 md:pl-0 md:w-2/4">
          <Input
            bdrColor="border-gray-300"
            onChange={({ target: { value } }) => setSearch(value)}
            label="Search"
            placeholder="Search by name"
            rounded="rounded-lg"
            value={search}
          />
        </div>
        <div className="my-2 w-full sm:px-2 sm:w-1/3 md:pr-0 md:w-1/4">
          <Button
            iconLeft={FaUserFriends}
            onClick={openModal}
            rounded="rounded-xl"
            title="Add Groups"
          />
        </div>
      </div>
      <div className="mt-2 rounded-lg py-2 md:mt-1">
        <Table
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
        {searchedGroups.length > 0 && (
          <TablePagination
            disabled={false}
            totalItems={searchedGroups.length}
            onChange={(pageNo: number) => {
              const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
              offset !== value && setOffset(value * limit);
            }}
            onSizeChange={(size) => setLimit(size)}
            pageSize={limit}
          />
        )}
      </div>
    </div>
  );
};

export default GroupPermissionsTable;
