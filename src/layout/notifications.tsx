import dynamic from 'next/dynamic';
import React from 'react';

import useFadeIn from '../hooks/useFadeIn';
import useOutClick from '../hooks/useOutClick';
import { useAlertContext } from '../store/contexts/alert';
import {
	useDeleteNotificationMutation,
	useGetNotificationsQuery,
	useMarkNotificationMutation,
} from '../store/queries/notifications';
import { NotificationType } from '../types';
import { downloadFile, getStringDateTime } from '../utils';

const FaCheckCircle = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaCheckCircle),
	{
		ssr: false,
	}
);

const FaClock = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaClock),
	{
		ssr: false,
	}
);

const FaRegBell = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaRegBell),
	{
		ssr: false,
	}
);

const FaSuitcase = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaSuitcase),
	{
		ssr: false,
	}
);

const FaTimes = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaTimes),
	{
		ssr: false,
	}
);

interface NotificationPropsType extends NotificationType {
	setCount: (count: number) => void;
	modalVisible: boolean;
}

const Button = dynamic<any>(
	() => import('kite-react-tailwind').then((mod) => mod.Button),
	{
		ssr: false,
	}
);

const Notification = ({
	id,
	createdAt: date,
	read,
	title,
	message,
	messageId,
	modalVisible,
	type,
	setCount,
}: NotificationPropsType) => {
	const { open } = useAlertContext();
	const { ref, visible } = useFadeIn<HTMLDivElement>(true);

	const [exportLoading, setExportLoading] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const { mutate: deleteNote } = useDeleteNotificationMutation({
		onMutate(total) {
			setCount(total);
		},
		onError(message) {
			open({
				type: 'danger',
				message,
			});
		},
	});

	const { mutate: markNote } = useMarkNotificationMutation({
		onMutate(total) {
			setCount(total);
		},
		onError(message) {
			open({
				type: 'danger',
				message,
			});
		},
	});

	const colors = React.useMemo(() => {
		let background = 'bg-gray-100';
		let btn = 'bg-gray-500 hover:bg-gray-700';
		let border = 'border-gray-300';
		let title = 'text-gray-700';
		let text = 'text-gray-500';

		if (!read) {
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
			} else if (type === 'DOWNLOAD') {
				background = 'bg-indigo-50';
				btn = 'bg-indigo-500 hover:bg-indigo-700';
				border = 'border-indigo-300';
				title = 'text-indigo-700';
				text = 'text-indigo-600';
			}
		}

		return {
			background,
			border,
			btn,
			title,
			text,
		};
	}, [read, type]);

	const Icon =
		type === 'SUCCESS'
			? FaCheckCircle
			: type === 'ERROR'
			? FaTimes
			: type === 'LEAVE'
			? FaSuitcase
			: FaClock;

	const _date = new Date(date);

	React.useEffect(() => {
		if (visible && modalVisible && read === false && !timeoutRef.current) {
			// Remove the notification after 10 seconds
			timeoutRef.current = setTimeout(() => {
				markNote(id);
			}, 10000);
		}
		// return () => {
		// 	if (timeout) clearTimeout(timeout);
		// };
	}, [id, markNote, modalVisible, read, visible]);

	return (
		<div ref={ref} className={`${colors.background} flex relative w-full`}>
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
				{messageId && type === 'DOWNLOAD' && (
					<div className="py-1 w-[5rem]">
						<Button
							bg={colors.btn}
							disabled={exportLoading}
							loader
							loading={exportLoading}
							onClick={async () => {
								const result = await downloadFile({
									url: messageId,
									setLoading: setExportLoading,
								});
								if (result?.status !== 200) {
									open({
										type: 'danger',
										message: 'An error occurred. Unable to download file!',
									});
								}
							}}
							padding="p-2"
							title="Download"
							titleSize="text-xs"
						/>
					</div>
				)}
				<p className={`italic ${colors.text} text-xs`}>
					{getStringDateTime(_date)}
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

	const { data, isLoading } = useGetNotificationsQuery(
		{
			onError(error) {
				open({ type: 'danger', message: error.message });
			},
		},
		{
			onSuccess(data) {
				setCount(data.result.filter((note) => note.read === false).length);
			},
			refetchInterval: 1000 * 10, // 10 seconds,
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
						<Notification
							setCount={setCount}
							modalVisible={visible}
							{...note}
						/>
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

function TopbarNotifications() {
	const { buttonRef, ref, setVisible, visible } = useOutClick<
		HTMLUListElement,
		HTMLDivElement
	>();

	const [count, setCount] = React.useState(0);

	return (
		<>
			<div
				ref={buttonRef}
				onClick={() => setVisible(!visible)}
				className="cursor-pointer duration-500 flex items-center justify-center min-h-[30px] min-w-[30px] mx-4 relative transition transform hover:scale-110"
			>
				<span>
					<FaRegBell className="h-5 w-5 text-gray-700" />
				</span>
				{count > 0 && (
					<span
						className={` ${
							count > 99
								? 'h-[1.2rem] right-[-6px] w-[1.2rem]'
								: count > 9
								? 'h-[1rem] right-0 w-[1rem]'
								: 'h-[0.9rem] right-0 w-[0.9rem]'
						} absolute bg-red-500 flex justify-center items-center rounded-full top-0 text-[9px] text-center text-gray-100`}
						// style={{ fontSize: '9px' }}
					>
						{count > 10 && (
							<span className="relative top-[0.5px]">
								{count > 99 ? '!' : count}
							</span>
						)}
					</span>
				)}
			</div>
			<Notifications setCount={setCount} visible={visible} ref={ref} />
		</>
	);
}

TopbarNotifications.displayName = 'TopbarNotifications';

export default TopbarNotifications;
