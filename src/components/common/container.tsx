import dynamic from 'next/dynamic';
import Link from 'next/link';
import Error from 'next/error';
import { useRouter } from 'next/router';
import React from 'react';
import { BiRefresh } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';

import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from '../../store/contexts';
import ErrorBoundary from '../../utils/components/error-boundary';

const DynamicAlertMessage = dynamic<any>(() => import('./alert-message'), {
	ssr: false,
});
const DynamicAlertModal = dynamic<any>(
	() => import('./alert-modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);
const DynamicLoadingPage = dynamic<any>(
	() => import('../../utils/components/LoadingPage').then((mod) => mod.default),
	{
		loading: () => (
			<div className="flex items-center justify-center min-h-[80vh] w-full">
				<p className="text-gray-500 text-center text-sm md:text-base">
					Loading...
				</p>
			</div>
		),
		ssr: false,
	}
);
const DynamicLoader = dynamic<any>(
	() => import('kite-react-tailwind').then((mod) => mod.Loader),
	{
		loading: () => (
			<p className="text-gray-500 text-center text-sm md:text-base">
				Loading...
			</p>
		),
		ssr: false,
	}
);

type IconProps = {
	children: React.ReactNode;
	className: string;
	link?: string;
	onClick?: () => void;
};

const IconContainer = ({ className, children, link, onClick }: IconProps) => {
	const { back } = useRouter();

	return link ? (
		<Link href={link}>
			<a className={className}>{children}</a>
		</Link>
	) : onClick ? (
		<span className={className} onClick={onClick}>
			{children}
		</span>
	) : (
		<span className={className} onClick={back}>
			{children}
		</span>
	);
};

type ContainerProps = {
	background?: string;
	children: React.ReactNode;
	heading: string;
	title?: number | string;
	icon?:
		| {
				link?: string;
				onClick?: () => void;
		  }
		| true;
	refresh?: {
		onClick: () => void;
		loading?: boolean;
	};
	disabledLoading?: boolean;
	error?: {
		statusCode?: number;
		title?: string;
	};
	loading?: boolean;
};

const Container = ({
	background = 'bg-gray-50',
	children,
	error,
	heading,
	icon,
	disabledLoading,
	loading,
	refresh,
	title,
}: ContainerProps) => {
	const { alerts } = useAlertContext();

	const { logout } = useAuthContext();

	const { open, showLoader, ...alertModalValues } = useAlertModalContext();

	React.useEffect(() => {
		// Does not really matter though
		// The axios authRedirectInstance will redirect to login page
		// on a 401 error status code
		if (error && error.statusCode === 401) logout();
	}, [logout, error]);

	if (loading) return <DynamicLoadingPage />;

	if (error)
		return (
			<Error
				statusCode={error.statusCode || 500}
				title={
					error.title || error.statusCode === 403
						? 'You are not authorized to view this page!'
						: 'A server error occurred! Please try again later.'
				}
			/>
		);

	return (
		<ErrorBoundary>
			<div className="relative w-full">
				{heading && (
					<div className="bg-gray-400 flex items-center justify-between w-full">
						<div className={`${icon ? 'flex items-center' : ''} w-full`}>
							{icon && (
								<IconContainer
									link={typeof icon === 'object' ? icon?.link : undefined}
									onClick={typeof icon === 'object' ? icon?.onClick : undefined}
									className="cursor-pointer duration-500 flex items-center justify-center ml-4 rounded-full text-primary-500 transform transition-colors hover:bg-gray-200"
								>
									<span className="block p-1">
										<FaArrowLeft className="text-xs md:text-sm" />
									</span>
								</IconContainer>
							)}
							<h5 className="capitalize font-bold mx-4 py-1 text-sm text-primary-500 tracking-wide md:text-base">
								{heading} {title && ` - ${title}`}
							</h5>
						</div>
						<div>
							{refresh && (
								<span
									onClick={refresh.onClick}
									className={`${
										refresh.loading
											? 'animate-spin'
											: 'animate-none duration-500 transform transition-colors'
									} cursor-pointer flex items-center justify-center mr-4 rounded-full text-primary-500 hover:bg-gray-200`}
								>
									<span className="block p-1">
										<BiRefresh className="text-sm md:text-base" />
									</span>
								</span>
							)}
						</div>
					</div>
				)}
				<div className={`p-2 md:p-4 ${background}`}>
					<div className="px-2 relative md:px-3 lg:px-4">
						{alerts.length > 0 && (
							<div className="bottom-[10%] fixed right-0 w-full z-[500] lg:ml-auto lg:w-[83%]">
								{alerts.map((alert, index) => (
									<DynamicAlertMessage {...alert} key={index} />
								))}
							</div>
						)}
						<div className="py-1 md:mt-2 lg:mt-3">{children}</div>
					</div>
				</div>
			</div>
			<DynamicAlertModal {...alertModalValues} />
			{disabledLoading === true && (
				<div
					className="fixed flex items-center justify-center h-full main-container-width top-0 z-[50]"
					style={{ background: 'rgba(0, 0, 0, 0.6)' }}
				>
					<DynamicLoader size={6} type="dotted" width="sm" />
				</div>
			)}
		</ErrorBoundary>
	);
};

export default Container;
