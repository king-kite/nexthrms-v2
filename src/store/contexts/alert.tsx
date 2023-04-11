import { AlertType } from 'kite-react-tailwind';
import React from 'react';

export interface AlertMessageType extends AlertType {
	id?: number | string;
	message?: string;
	padding?: string;
	type?: AlertType['type'];
	visible?: boolean;
}

const initialState: AlertMessageType[] = [];

export type AlertContextType = {
	alerts: AlertMessageType[];
	open: (e: AlertMessageType) => void;
	close: (id?: string | number) => void;
};

export const AlertContext = React.createContext<AlertContextType | null>(null);

export function useAlertContext() {
	return React.useContext(AlertContext) as AlertContextType;
}

function AlertContextProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = React.useState<AlertMessageType[]>(initialState);

	const close = React.useCallback((id?: string | number) => {
		if (id) {
			setState((prevState) => prevState.filter((item) => item.id !== id));
		} else {
			//  remove the last item
			setState((prevState) => {
				const newState = [...prevState];
				newState.pop();
				return newState;
			});
		}
	}, []);

	const open = React.useCallback(
		(payload: AlertMessageType, options?: { scroll: boolean }) => {
			setState((prevState) => [
				...prevState,
				{
					...payload,
					id: new Date().getTime() + prevState.length,
					message:
						payload.message || 'An error occurred when displaying alerts.',
					visible: true,
				},
			]);
			if (typeof window !== undefined && options?.scroll) {
				window.scrollTo(0, 0);
			}
		},
		[]
	);

	return (
		<AlertContext.Provider
			value={{
				alerts: state,
				open,
				close,
			}}
		>
			{children}
		</AlertContext.Provider>
	);
}

export default AlertContextProvider;
