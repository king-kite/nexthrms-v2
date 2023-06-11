import { Alert } from 'kite-react-tailwind';
import React from 'react';

import { AlertMessageType, useAlertContext } from '../../store/contexts/alert';

function AlertMessage(props: AlertMessageType) {
	const { close } = useAlertContext();

	React.useEffect(() => {
		let timeout = setTimeout(() => {
			close();
		}, 10 * 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [close]);

	return (
		<div className="alert-animation px-3 py-1 w-full sm:px-4 md:px-7 lg:px-8">
			<Alert
				message={props.message}
				onClose={() => {
					if (props.onClose) props.onClose();
					close(props.id);
				}}
				padding={props.padding}
				rounded={props.rounded}
				type={props.type}
				visible={props.visible}
			/>
		</div>
	);
}

AlertMessage.defaultProps = {
	message: 'Sorry, a client error occurred. Try again later, thank you!',
	padding: 'p-3 sm:px-4 md:px-6 md:py-5 lg:py-7',
	rounded: 'rounded-md',
	type: 'info',
	visible: true,
};

export default AlertMessage;
