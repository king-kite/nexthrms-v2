import { Button, ButtonType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaTimes } from 'react-icons/fa';

import { useAlertModalContext } from '../../../store/contexts';
import { UserGroupType } from '../../../types';

function GroupCards({
	actions,
	name = 'group',
	groups,
	removeGroup,
}: {
	actions?: ButtonType[];
	name?: string;
	groups: UserGroupType[];
	removeGroup?: (codename: string) => void;
}) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const removeSingleGroup = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Remove Group?',
				color: 'warning',
				message: `Do you want to remove this user from this ${name}?`,
				decisions: [
					{
						bg: 'bg-gray-600 hover:bg-gray-500',
						caps: true,
						onClick: close,
						title: 'no',
					},
					{
						bg: 'bg-yellow-600 hover:bg-yellow-500',
						caps: true,
						onClick: () => {
							if (removeGroup) {
								showLoader();
								removeGroup(id);
							}
						},
						title: 'yes',
					},
				],
			});
		},
		[openModal, close, removeGroup, name, showLoader]
	);

	return (
		<div className="gap-4 grid grid-cols-1 mb-5 md:gap-6 md:grid-cols-2">
			{groups.map((group, index) => (
				<div
					className="bg-gray-200 border border-gray-400 border-l-8 p-2 rounded-md lg:pl-4 lg:p-3"
					key={index}
				>
					<div className="flex items-center justify-between py-1 w-full">
						<h4 className="capitalize font-bold text-base text-gray-800 w-full md:text-lg">
							{group.name.toLowerCase()}
						</h4>
						{removeGroup && (
							<div
								onClick={() => removeSingleGroup(group.id)}
								className="cursor-pointer duration-500 mx-4 p-2 rounded-full text-gray-700 text-xs transform transition-all hover:bg-white hover:scale-110 hover:text-gray-600 md:text-sm"
							>
								<FaTimes className="text-xs sm:text-sm" />
							</div>
						)}
					</div>
					{group.description && (
						<p className="font-medium my-1 pr-2 text-gray-700 text-sm md:text-base">
							{group.description}
						</p>
					)}
					{actions && (
						<div className="flex flex-wrap my-1 p-4 w-full">
							{actions.map((action, index) => (
								<div key={index} className="my-2 w-1/2 sm:my-4 sm:px-4">
									<Button
										{...action}
										renderLinkAs={({ children, link, ...props }) => (
											<Link href={link}>
												<a {...props}>{children}</a>
											</Link>
										)}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export default GroupCards;
