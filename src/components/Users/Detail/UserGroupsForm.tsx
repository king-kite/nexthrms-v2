import { Alert, Button, Checkbox } from 'kite-react-tailwind';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

import { useGetGroupsQuery } from '../../../store/queries';
import { GroupType, UserGroupType } from '../../../types';
import { updateUserGroupsSchema, handleJoiErrors } from '../../../validators';

type ErrorType = {
	message?: string;
	groups?: string;
};

type FormProps = {
	initState?: UserGroupType[];
	errors?: ErrorType;
	resetErrors: () => void;
	loading: boolean;
	onSubmit: (form: { groups: string[] }) => void;
};

const Form: FC<FormProps> = ({
	initState,
	errors,
	resetErrors,
	loading,
	onSubmit,
}) => {
	const formStaleData = useMemo(
		() => ({
			groups: initState ? initState.map((group) => group.id) : [],
		}),
		[initState]
	);

	const [form, setForm] = useState(formStaleData);
	const [formErrors, setErrors] = useState<ErrorType>();

	const formRef = useRef<HTMLFormElement | null>(null);

	const { data: groups = { total: 0, result: [] }, isLoading: groupsLoading } =
		useGetGroupsQuery({});

	const handleSubmit = useCallback(
		async (input: { groups: string[] }) => {
			try {
				const valid: {
					groups: string[];
				} = await updateUserGroupsSchema.validateAsync({ ...input });
				onSubmit(valid);
			} catch (err) {
				const error = handleJoiErrors<{
					groups?: string;
				}>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					return {
						...prevState,
						message: "Unable to update user's groups. Please try again later.",
					};
				});
			}
		},
		[onSubmit]
	);

	const removeFormErrors = useCallback(
		(name: string) => {
			if (Object(formErrors)[name]) {
				setErrors((prevState) => ({
					...prevState,
					[name]: undefined,
				}));
			}
		},
		[formErrors]
	);

	const handleFormChange = useCallback(
		(name: string, value: string | string[]) => {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));
			removeFormErrors(name);
		},
		[removeFormErrors]
	);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					handleSubmit({
						groups: form.groups,
					});
				}
			}}
			className="p-4"
		>
			{(formErrors?.message || errors?.message) && (
				<div className="pb-4 w-full">
					<Alert
						type="danger"
						message={formErrors?.message || errors?.message}
						onClose={() => {
							if (errors?.message) resetErrors();
							else if (formErrors?.message) removeFormErrors('message');
						}}
					/>
				</div>
			)}
			<div className="w-full">
				{errors?.groups && (
					<p className="my-1 text-red-500 text-xs md:text-sm">
						{errors.groups}
					</p>
				)}

				{groupsLoading ? (
					<p className="mt-1 text-primary-500 text-xs md:text-sm">
						Loading groups...
					</p>
				) : groups.result.length > 0 ? (
					<div className="gap-4 grid grid-cols-1 md:grid-cols-2">
						{groups.result.map((group, index) => (
							<div key={index} className="w-full">
								<Checkbox
									checked={!!form.groups.find((id) => id === group.id)}
									label={group.name}
									labelColor="text-gray-500"
									labelSize="text-sm tracking-wider md:text-base"
									name={group.name}
									onChange={({ target: { checked } }) => {
										if (checked) {
											const exists = form.groups.find((id) => id === group.id);
											if (!exists) {
												handleFormChange('groups', [...form.groups, group.id]);
											}
										} else {
											const newGroups = form.groups.filter(
												(id) => id !== group.id
											);
											handleFormChange('groups', newGroups);
										}
									}}
									required={false}
									textSize="text-sm md:text-base"
								/>
							</div>
						))}
					</div>
				) : (
					<p className="mt-1 text-primary-500 text-xs md:text-sm">
						There are no groups.
					</p>
				)}
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={loading ? "Updating User's Group..." : "Update User's Group"}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

export default Form;
