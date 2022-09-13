import { Alert, Button, Input } from '@king-kite/react-kit';
import Image from 'next/image';
import React from 'react';
import { FaCheckCircle, FaLock } from 'react-icons/fa';

import { LOGO_IMAGE } from '../../../config';

function PasswordConfirm({
	errors,
	onSubmit,
	loading,
	removeError,
}: {
	errors?: {
		message?: string;
		password1?: string;
		password2?: string;
	};
	loading: boolean;
	onSubmit: (form: { password1: string; password2: string }) => void;
	removeError: (name: string) => void;
}) {
	const password1Ref = React.useRef<HTMLInputElement>(null);
	const password2Ref = React.useRef<HTMLInputElement>(null);

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
							Enter your new password
						</h2>
					</div>
					{errors?.message && (
						<div className="mt-2">
							<Alert
								onClose={() => {
									removeError('message');
								}}
								message={errors.message}
								type="danger"
							/>
						</div>
					)}
					<form
						className="mt-4"
						method="POST"
						onSubmit={(e) => {
							e.preventDefault();
							onSubmit({
								password1: password1Ref.current?.value || '',
								password2: password2Ref.current?.value || '',
							});
						}}
					>
						<div className="rounded-md shadow-sm -space-y-px">
							<div className="mb-4">
								<Input
									bg={errors?.password1 ? 'bg-red-100' : undefined}
									bdr="border"
									bdrColor="border-gray-300"
									color="text-gray-800"
									disabled={loading}
									error={errors?.password1}
									label="New Password"
									icon={FaLock}
									id="password1"
									name="password1"
									onChange={() => removeError('password1')}
									placeholder="New Password"
									placeholderColor="placeholder-gray-500"
									padding="px-3 py-2"
									ref={password1Ref}
									required
									rounded="rounded-md"
									textSize="text-sm md:text-base"
									type="password"
								/>
							</div>
							<div className="mb-4 pt-2">
								<Input
									bg={errors?.password2 ? 'bg-red-100' : undefined}
									bdr="border"
									bdrColor="border-gray-300"
									color="text-gray-800"
									disabled={loading}
									error={errors?.password2}
									label="Confirm Password"
									icon={FaLock}
									id="password2"
									onChange={() => removeError('password2')}
									minLength={6}
									maxLength={30}
									name="password2"
									placeholder="Confirm Password"
									placeholderColor="placeholder-gray-500"
									padding="px-3 py-2"
									ref={password2Ref}
									required
									rounded="rounded-md"
									textSize="text-sm md:text-base"
									type="password"
								/>
							</div>
						</div>

						<div className="mt-3 pt-3">
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
								title={loading ? 'Resetting...' : 'Reset'}
								titleSize="text-sm md:text-base"
							/>
						</div>
					</form>
				</div>
			</div>

			<div className="bg-transparent hidden items-center w-full lg:flex">
				<div className="bg-transparent max-w-2xl mx-auto px-10 py-6">
					<h1 className="font-extrabold my-6 text-5xl text-center text-white tracking-wide">
						Enter your new Password
					</h1>
					<p className="leading-8 max-w-lg mx-auto my-6 text-base text-center text-gray-100 tracking-wide">
						Your old password will be overwritten with the new password.
					</p>
				</div>
			</div>
		</div>
	);
}

export default PasswordConfirm;
