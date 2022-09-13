import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { forwardRef } from 'react';
import { FaClock, FaSuitcase, FaTimes } from 'react-icons/fa';

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

	const color =
		type === 'LEAVE'
			? 'text-red-600'
			: // : type === 'funding'
			// ? 'text-green-600'
			type === 'OVERTIME'
			? 'text-yellow-600'
			: 'text-gray-600';

	const Icon = type === 'LEAVE' ? FaSuitcase : FaClock;

	const _date = new Date(date);
	const minutes = _date.getMinutes().toString();
	const hours = _date.getHours();
	const _hour = hours > 12 ? hours - 12 : hours;
	const AM_PM = hours > 12 ? 'PM' : 'AM';

	return (
		<div className="flex relative w-full">
			<div className="border-r border-gray-300 flex items-start justify-center pt-2 px-3">
				<span className="flex items-center justify-center">
					<Icon className={`font-semibold ${color} text-sm`} />
				</span>
			</div>

			<div className="px-2 py-1 w-full">
				<p className="font-semibold text-gray-700 text-sm tracking-wide w-full md:text-base">
					{title}
				</p>
				<p className="inline-block text-gray-500 text-xs w-full md:text-sm">
					{message}
				</p>
				<p className="italic text-gray-500 text-xs">
					{_date.toDateString()},{' '}
					{`${_hour}:${minutes.length < 2 ? `0${minutes}` : minutes} ${AM_PM}`}
				</p>
			</div>

			<div className="flex items-start justify-center pt-2 px-3">
				<span
					onClick={() => deleteNote(id)}
					className="cursor-pointer duration-500 flex items-center justify-center transition transform hover:scale-110"
				>
					<FaTimes className="font-normal text-gray-500 text-sm" />
				</span>
			</div>
		</div>
	);
};

const Notifications = forwardRef<
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
			} absolute bg-white border-t border-2 border-gray-300 divide-y divide-gray-300 divide-opacity-75 grow-down max-h-[416px] max-w-xs overflow-y-auto rounded-b-lg right-0 top-[89px] shadow-lg w-full z-[100] sm:max-w-sm sm:top-[92px] md:top-[103px] lg:top-[111px]`}
		>
			{data && data.result.length > 0 ? (
				data.result.map((note, index) => (
					<li key={index} className="even:bg-gray-200">
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
