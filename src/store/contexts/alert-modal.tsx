import React from 'react';

import { ModalProps as AlertModalType } from '../../components/common/alert-modal';

const initialState: AlertModalType = {
	loading: false,
	visible: false,
	message: '',
};

export interface AlertModalContextType extends AlertModalType {
	open: (e: AlertModalType) => void;
	close: () => void;
	showLoader: (e?: boolean) => void;
}

export const AlertModalContext =
	React.createContext<AlertModalContextType | null>(null);

export function useAlertModalContext() {
	return React.useContext(AlertModalContext) as AlertModalContextType;
}

function AlertModalContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [state, setState] = React.useState(initialState);

	const close = React.useCallback(() => {
		setState(initialState);
	}, []);

	const open = React.useCallback((payload: AlertModalType) => {
		setState((prevState) => ({
			...prevState,
			...payload,
			message: payload.message || 'An error occurred when displaying message.',
			color: payload.color || 'info',
			loading: false,
			visible: true,
		}));
	}, []);

	const showLoader = React.useCallback((loading: boolean = true) => {
		setState((prevState) => ({ ...prevState, loading }));
	}, []);

	return (
		<AlertModalContext.Provider
			value={{
				...state,
				open,
				close,
				showLoader,
			}}
		>
			{children}
		</AlertModalContext.Provider>
	);
}

export default AlertModalContextProvider;
