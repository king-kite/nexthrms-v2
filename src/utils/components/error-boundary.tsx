import dynamic from 'next/dynamic';
import React from 'react';

// import { NODE_ENV } from '../../config'

interface Props {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ message: string }>;
}

interface State {
	hasError: boolean;
	message?: string;
}

const NextError = dynamic(
	() => import('next/error').then((mod) => mod.default),
	{
		loading: () => (
			<div className="flex items-center justify-center min-h-[100vh] w-full">
				<p className="text-gray-500 text-center text-sm md:text-base">
					Loading Error Page...
				</p>
			</div>
		),
		ssr: false,
	}
);

class ErrorBoundary extends React.Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(_: Error): State {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		// logErrorToMyService(error, errorInfo.componentStack);
		this.setState({ message: error.message });
		console.error('Uncaught Error: ', error, errorInfo);
	}

	render() {
		const message = this.state.message || 'Sorry.. An error occurred.';
		const Fallback = this.props.fallback;
		if (this.state.hasError) {
			return Fallback ? (
				<Fallback message={message} />
			) : (
				<NextError statusCode={500} title={message} />
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
