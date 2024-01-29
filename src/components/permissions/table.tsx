import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaUserShield } from 'react-icons/fa';

import { permissions as perms, PERMISSION_OBJECT_PERMISSIONS_PAGE_URL } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { PermissionType } from '../../types';
import { hasModelPermission, toCapitalize } from '../../utils';

const getRows = (data: PermissionType[], getObjPermLink?: (id: string) => string): TableRowType[] =>
  data.map((permission) => {
    const actions: {
      color: string;
      icon: IconType;
      link?: string;
    }[] = [];
    if (getObjPermLink) {
      actions.push({
        color: 'info',
        icon: FaUserShield,
        link: getObjPermLink(permission.id),
      });
    }
    return {
      id: permission.id,
      rows: [
        { value: toCapitalize(permission.name) || '---' },
        {
          value: permission.category ? toCapitalize(permission.category.name) : '---',
        },
        { value: permission.description },
        {
          type: 'actions',
          value: actions,
        },
      ],
    };
  });

type TableType = {
  offset?: number;
  permissions: PermissionType[];
};

const PermissionTable = ({ offset = 0, permissions = [] }: TableType) => {
  const { data: authData } = useAuthContext();

  const canViewObjectPermissions = React.useMemo(
    () =>
      authData
        ? authData.isSuperUser ||
          (authData.isAdmin &&
            hasModelPermission(authData.permissions, [perms.permissionobject.VIEW]))
        : false,
    [authData]
  );

  const heads = React.useMemo(() => {
    const data: TableHeadType = [
      { value: 'name' },
      { value: 'category' },
      { value: 'description' },
    ];
    if (canViewObjectPermissions) data.push({ type: 'actions', value: 'actions' });
    return data;
  }, [canViewObjectPermissions]);

  const { offset: deferredOffset, permissions: deferredValue } = React.useDeferredValue({
    permissions,
    offset,
  });
  const rows = React.useMemo(
    () =>
      getRows(
        deferredValue,
        canViewObjectPermissions ? PERMISSION_OBJECT_PERMISSIONS_PAGE_URL : undefined
      ),
    [deferredValue, canViewObjectPermissions]
  );

  return (
    <Table
      heads={heads}
      rows={rows}
      sn={deferredOffset}
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

export default PermissionTable;
