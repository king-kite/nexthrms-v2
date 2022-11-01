import { Alert, Button, Input } from 'kite-react-tailwind';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';

import { LOGO_IMAGE, LOGIN_PAGE_URL, REGISTER_PAGE_URL } from '../../../config';

function VerifyEmail({
	errors,
	onSubmit,
	loading,
	successMessage,
	removeError,
	removeSuccessMessage,
}: {
	errors?: {
		email?: string;
		message?: string;
	};
	loading: boolean;
	successMessage?: string;
	onSubmit: (form: { email: string }) => void;
	removeError: (name: string) => void;
	removeSuccessMessage: () => void;
}) {
	const emailRef = React.useRef<HTMLInputElement>(null);

	return (
		<div className="bg-blue-image flex flex-row-reverse items-center h-full min-h-screen w-full">
			<div className="bg-transparent flex items-center justify-center min-h-full w-full">
				<div className="bg-gray-100 max-w-sm rounded-md px-4 py-8 w-full sm:px-6 lg:px-8">
					<div>
						<div className="h-[40px] relative w-[40px] md:h-[50px] md:w-[50px]">
							<Image
								className="h-full w-full"
								layout="fill"
								src={LOGO_IMAGE}
								alt="kite"
							/>
						</div>
						<h2 className="italic mt-3 text-center text-base tracking-tight font-bold sm:text-lg text-primary-500 md:text-xl lg:text-2xl">
							Verify your account
						</h2>
					</div>
					{(errors?.message || successMessage) && (
						<div className="mt-2">
							<Alert
								onClose={() => {
									removeError('message');
									removeSuccessMessage();
								}}
								message={errors?.message || successMessage}
								type={successMessage ? 'success' : 'danger'}
							/>
						</div>
					)}
					<form
						className="mt-4 space-y-6"
						method="POST"
						onSubmit={(e) => {
							e.preventDefault();
							onSubmit({
								email: emailRef.current?.value || '',
							});
						}}
					>
						<div className="rounded-md shadow-sm -space-y-px">
							<div className="mb-4">
								<Input
									autoComplete="email"
									bg={errors?.email ? 'bg-red-100' : undefined}
									bdr="border"
									bdrColor="border-gray-300"
									color="text-gray-800"
									disabled={loading}
									error={errors?.email}
									focus="focus:ring-primary-500 focus:border-primary-500 focus:z-10 focus:outline-none focus:shadow-outline"
									label="Email Address"
									icon={FaEnvelope}
									id="email"
									name="email"
									onChange={() => removeError('email')}
									placeholder="Email Address"
									placeholderColor="placeholder-gray-500"
									padding="px-3 py-2"
									ref={emailRef}
									required
									rounded="rounded-md"
									textSize="text-sm md:text-base"
									type="email"
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<Link href={LOGIN_PAGE_URL}>
								<a className="align-baseline capitalize cursor-pointer font-bold inline-block text-secondary-500 text-sm hover:text-secondary-300 hover:underline">
									Login
								</a>
							</Link>
							<Link href={REGISTER_PAGE_URL}>
								<a className="align-baseline capitalize cursor-pointer font-bold inline-block text-secondary-500 text-sm hover:text-secondary-300 hover:underline">
									Register
								</a>
							</Link>
						</div>

						<div>
							<Button
								bg="bg-primary-600 group hover:bg-primary-400"
								border="border border-transparent"
								bold="medium"
								caps
								color="text-white"
								disabled={loading}
								focus="focus:outline-none focus:shadow-outline"
								iconLeft={FaCheckCircle}
								padding="px-4 py-2"
								rounded="rounded-md"
								title={loading ? 'Sending...' : 'Verify'}
								titleSize="text-sm md:text-base"
							/>
						</div>
					</form>
				</div>
			</div>

			<div className="bg-transparent hidden items-center w-full lg:flex">
				<div className="bg-transparent max-w-2xl mx-auto px-10 py-6">
					<h1 className="font-extrabold my-6 text-5xl text-center text-white tracking-wide">
						Verify your Email Address
					</h1>
					<p className="leading-8 max-w-lg mx-auto my-6 text-base text-center text-gray-100 tracking-wide">
						Enter your registered email address. A verification token will then
						be sent to that email address. The verification token expires after
						24 hours.
					</p>
				</div>
			</div>
		</div>
	);
}

export default VerifyEmail;
