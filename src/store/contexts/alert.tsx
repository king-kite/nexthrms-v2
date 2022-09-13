import { AlertType } from '@king-kite/react-kit';
import React from 'react';

const initialState = {
	message: undefined,
	type: 'info' as const,
	visible: false,
};

export interface AlertContextType extends AlertType {
	open: (e: AlertType) => void;
	close: () => void;
}

export const AlertContext = React.createContext<AlertContextType | null>(null);

export function useAlertContext() {
	return React.useContext(AlertContext) as AlertContextType;
}

function AlertContextProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = React.useState<AlertType>(initialState);

	const close = React.useCallback(() => {
		setState(initialState);
	}, []);

	const open = React.useCallback((payload: AlertType) => {
		setState((prevState) => ({
			...prevState,
			message: payload.message || 'An error occurred when displaying alerts.',
			type: payload.type || 'info',
			visible: true,
		}));
		if (typeof window !== undefined) {
			window.scrollTo(0, 0);
		}
	}, []);

	return (
		<AlertContext.Provider
			value={{
				...state,
				open,
				close,
			}}
		>
			{children}
		</AlertContext.Provider>
	);
}

export default AlertContextProvider;
