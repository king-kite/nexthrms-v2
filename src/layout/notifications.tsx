import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';
import { FaCheckCircle, FaClock, FaSuitcase, FaTimes } from 'react-icons/fa';

import { NOTIFICATIONS_URL, NOTIFICATION_URL } from '../config';
import { useAlertContext } from '../store/contexts';
import * as tags from '../store/tagTypes';
import { GetNotificationResponseType, NotificationType } from '../types';
import { axiosInstance } from '../utils';
import { isResponseWithMessage } from '../validators';

interface NotificationPropsType extends NotificationType {
	setCount: (count: number) => void;
}

const Notification = ({
	id,
	createdAt: date,
	title,
	message,
	type,
	setCount,
}: NotificationPropsType) => {
	const { open } = useAlertContext();

	const queryClient = useQueryClient();

	const { mutate: deleteNote } = useMutation(
		(noteId: string) => axiosInstance.delete(NOTIFICATION_URL(noteId)),
		{
			onMutate: async (noteId) => {
				// cancel any ongoing get notifications query
				await queryClient.cancelQueries([tags.NOTIFICATIONS]);

				// store the prvious noitifications data
				const previousData:
					| { total: number; result: NotificationType[] }
					| undefined = queryClient.getQueryData([tags.NOTIFICATIONS]);

				// update the query data
				queryClient.setQueryData<
					{ total: number; result: NotificationType[] } | undefined
				>([tags.NOTIFICATIONS], (oldQueryData) => {
					if (oldQueryData) {
						const total = oldQueryData.total - 1;
						const result = oldQueryData.result.filter(
							(note) => note.id !== noteId
						);
						setCount(total);
						return { total, result };
					}
					return previousData;
				});
				return { previousData };
			},
			onSettled(noteId, err, variables, context) {
				if (err) {
					if (context)
						queryClient.setQueryData(
							[tags.NOTIFICATIONS],
							context.previousData
						);
					open({
						type: 'danger',
						message:
							(err as any).message ||
							'An error occurred. Unable to delete notification.',
					});
				} else queryClient.invalidateQueries([tags.NOTIFICATIONS]);
			},
		}
	);

	const colors = React.useMemo(() => {
		let background = 'bg-gray-100';
		let border = 'border-gray-300';
		let title = 'text-gray-700';
		let text = 'text-gray-500';

		if (type === 'ERROR') {
			background = 'bg-red-50';
			border = 'border-red-300';
			title = 'text-red-700';
			text = 'text-red-600';
		} else if (type === 'SUCCESS') {
			background = 'bg-green-50';
			border = 'border-green-300';
			title = 'text-green-700';
			text = 'text-green-600';
		}

		return {
			background,
			border,
			title,
			text,
		};
	}, [type]);

	const Icon =
		type === 'SUCCESS'
			? FaCheckCircle
			: type === 'ERROR'
			? FaTimes
			: type === 'LEAVE'
			? FaSuitcase
			: FaClock;

	const _date = new Date(date);
	const minutes = _date.getMinutes().toString();
	const hours = _date.getHours();
	const _hour = hours > 12 ? hours - 12 : hours;
	const AM_PM = hours > 12 ? 'PM' : 'AM';

	return (
		<div className={`${colors.background} flex relative w-full`}>
			<div
				className={`border-b border-r ${colors.border} flex items-start justify-center pt-2 px-3`}
			>
				<span className="flex items-center justify-center">
					<Icon className={`font-semibold ${colors.text} text-sm`} />
				</span>
			</div>

			<div className={`${colors.border} border-b px-2 py-1 w-full`}>
				<p
					className={`font-semibold ${colors.title} text-sm tracking-wide w-full md:text-base`}
				>
					{title}
				</p>
				<p className={`inline-block ${colors.text} text-xs w-full md:text-sm`}>
					{message}
				</p>
				<p className={`italic ${colors.text} text-xs`}>
					{_date.toDateString()},{' '}
					{`${_hour}:${minutes.length < 2 ? `0${minutes}` : minutes} ${AM_PM}`}
				</p>
			</div>

			<div
				className={`${colors.border} border-b flex items-start justify-center pt-2 px-3`}
			>
				<span
					onClick={() => deleteNote(id)}
					className="cursor-pointer duration-500 flex items-center justify-center transition transform hover:scale-110"
				>
					<FaTimes className={`font-normal ${colors.text} text-sm`} />
				</span>
			</div>
		</div>
	);
};

const Notifications = React.forwardRef<
	HTMLUListElement,
	{
		setCount: (e: number) => void;
		visible: boolean;
	}
>(({ setCount, visible }, ref) => {
	const { open } = useAlertContext();

	const { data, isLoading } = useQuery(
		[tags.NOTIFICATIONS],
		() =>
			axiosInstance(NOTIFICATIONS_URL).then(
				(response: AxiosResponse<GetNotificationResponseType>) =>
					response.data.data
			),
		{
			refetchInterval: 1000 * 10, // 10 seconds,
			onSuccess(data) {
				setCount(data.result.filter((note) => note.read === false).length);
			},
			onError(error) {
				if (isResponseWithMessage(error)) {
					open({ type: 'danger', message: error.message });
				}
			},
		}
	);

	return (
		<ul
			ref={ref}
			className={`${
				visible ? 'block' : 'hidden'
			} absolute bg-white border-t border-2 border-gray-300 divide-y divide-gray-300 divide-opacity-75 grow-down max-h-[416px] max-w-xs overflow-y-auto rounded-b-lg right-0 top-[63px] shadow-lg w-full z-[100] sm:max-w-sm sm:top-[66px] md:top-[74px] lg:top-[82px]`}
		>
			{data && data.result.length > 0 ? (
				data.result.map((note, index) => (
					<li key={index}>
						<Notification setCount={setCount} {...note} />
					</li>
				))
			) : (
				<li>
					<div className="px-2 py-1 w-full">
						<p className="font-semibold text-center text-gray-700 text-sm tracking-wide md:text-base">
							{isLoading ? 'Loading Notifications...' : 'No New Notification'}
						</p>
					</div>
				</li>
			)}
		</ul>
	);
});

Notifications.displayName = 'Notifications';

export default Notifications;
