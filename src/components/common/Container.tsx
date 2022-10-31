import { Alert, Loader } from "@king-kite/react-kit";
import Link from "next/link";
import Error from "next/error";
import { useRouter } from "next/router";
import { Dispatch, FC, ReactNode, SetStateAction, useEffect } from "react";
import { BiRefresh } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa";

import { DEFAULT_PAGINATION_SIZE } from "../../config";
import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from "../../store/contexts";
import { AlertModal, Pagination } from "./index";
import { LoadingPage } from "../../utils";

type IconProps = {
	children: ReactNode;
	className: string;
	link?: string;
	onClick?: () => void;
};

const IconContainer: FC<IconProps> = ({
	className,
	children,
	link,
	onClick,
}) => {
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
	children: ReactNode;
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
	paginate?: {
		loading: boolean;
		totalItems: number;
		offset: number;
		setOffset: Dispatch<SetStateAction<number>>;
	};
};

const Container: FC<ContainerProps> = ({
	background = "bg-gray-50",
	children,
	error,
	heading,
	icon,
	disabledLoading,
	loading,
	paginate,
	refresh,
	title,
}) => {
	const alert = useAlertContext();

	const { logout } = useAuthContext();

	const { open, showLoader, ...alertModalValues } = useAlertModalContext();

	useEffect(() => {
		// Does not really matter though
		// The axios authRedirectInstance will redirect to login page
		// on a 401 error status code
		if (error && error.statusCode === 401) logout();
	}, [logout, error]);

	return (
		<>
			<div className="relative w-full">
				{heading && (
					<div className="bg-gray-400 flex items-center justify-between w-full">
						<div className={`${icon ? "flex items-center" : ""} w-full`}>
							{icon && (
								<IconContainer
									link={typeof icon === "object" ? icon?.link : undefined}
									onClick={typeof icon === "object" ? icon?.onClick : undefined}
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
											? "animate-spin"
											: "animate-none duration-500 transform transition-colors"
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
					{loading ? (
						<LoadingPage />
					) : error ? (
						<Error
							statusCode={error.statusCode || 500}
							title={
								error.title ||
								"A server error occurred! Please try again later."
							}
						/>
					) : (
						<div className="px-2 relative md:px-3 lg:px-4">
							<div
								className={
									(alert.visible
										? "translate-y-0"
										: "-translate-y-full") +
									" absolute duration-1000 left-0 px-2 py-1 top-0 transition transform w-full z-[500] md:px-3 lg:px-4"
								}
							>
								<Alert
									message={alert.message}
									onClose={alert.close}
									type={alert.type}
									rounded={alert.rounded}
									visible={alert.visible}
								/>
							</div>
							<div className="py-1 md:mt-2 lg:mt-4">{children}</div>
						</div>
					)}
					{paginate && paginate.totalItems > 0 && (
						<div className="pt-2 pb-5">
							<Pagination
								disabled={paginate.loading || false}
								onChange={(pageNo: number) => {
									const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
									paginate.offset !== value &&
										paginate.setOffset(value * DEFAULT_PAGINATION_SIZE);
								}}
								pageSize={DEFAULT_PAGINATION_SIZE}
								totalItems={paginate.totalItems || 0}
							/>
						</div>
					)}
				</div>
			</div>
			<AlertModal {...alertModalValues} />
			{disabledLoading === true && (
				<div
					className="fixed flex items-center justify-center h-full main-container-width top-0 z-[50]"
					style={{ background: "rgba(0, 0, 0, 0.6)" }}
				>
					<Loader size={6} type="dotted" width="sm" />
				</div>
			)}
		</>
	);
};

export default Container;
