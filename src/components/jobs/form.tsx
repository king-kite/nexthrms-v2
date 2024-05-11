import { Alert, Button, Input, Select, Textarea } from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useGetDepartmentsQuery } from '../../store/queries/departments';
import { useCreateJobMutation, useEditJobMutation } from '../../store/queries/jobs';
import { handleAxiosErrors, handleYupErrors } from '../../validators';
import { createJobSchema } from '../../validators/jobs';

import type { JobCreateErrorType, JobCreateType, JobType } from '../../types';
import { getStringedDate, toCapitalize } from '../../utils';

type ErrorType = JobCreateErrorType & {
  message?: string;
};

type FormProps = {
  data?: JobType; // initialState
  editMode?: boolean;
  onSuccess: () => void;
};
enum JobTypeOptions {
  'Full Time' = 'FULL_TIME',
  'Part Time' = 'PART_TIME',
  'Internship' = 'INTERNSHIP',
  'Temporary' = 'TEMPORARY',
  'Other' = 'OTHER',
}

function handleDataError(err: unknown): string | undefined {
  if (err) {
    const error = handleAxiosErrors(err);
    if (error) return error?.message;
  }
  return undefined;
}

function Form({ data, editMode, onSuccess }: FormProps) {
  const [depLimit, setDepLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
  const [errors, setErrors] = React.useState<ErrorType>();
  // defaultValue doesn't re-render after these department, employees, and jobs
  // are loading. Use state instead
  const [form, setForm] = React.useState({
    departmentId: data?.department?.id || '',
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  const changeFormErrors = React.useCallback(
    (name: keyof ErrorType, value: string = '') => {
      if (value)
        setErrors((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      else if (!value && errors && errors['name'] !== '') {
        // Remove error if present
        setErrors((prevState) => ({
          ...prevState,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  const departments = useGetDepartmentsQuery({
    limit: depLimit,
    offset: 0,
    search: '',
  });

  const departmentsError = handleDataError(departments.error);

  const { mutate: createJob, isLoading: createLoading } = useCreateJobMutation(
    { onSuccess },
    {
      onError(error) {
        const err = handleAxiosErrors<{
          name: string;
        }>(error);
        if (err) {
          changeFormErrors('message', err.message || 'An error occurred. Unable to create job.');
        }
      },
    }
  );

  const { mutate: editJob, isLoading: editLoading } = useEditJobMutation(
    { onSuccess },
    {
      onError(error) {
        const err = handleAxiosErrors<{
          name: string;
        }>(error);
        if (err) {
          changeFormErrors('message', err.message || 'An error occurred. Unable to create job.');
        }
      },
    }
  );

  const loading = React.useMemo(() => createLoading || editLoading, [editLoading, createLoading]);

  const handleFormChange = React.useCallback(
    (name: keyof JobCreateType, value: string | number) => {
      setForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      changeFormErrors(name);
    },
    [changeFormErrors]
  );

  const handleSubmit = React.useCallback(
    async (form: JobCreateType) => {
      setErrors(undefined);
      try {
        const input = await createJobSchema.validate(form, {
          abortEarly: false,
        });
        if (data && editMode) {
          editJob({ id: data.id, data: input });
        } else {
          createJob(input);
        }
      } catch (error) {
        const err = handleYupErrors<{
          name?: string;
        }>(error);
        if (err) setErrors((prevState) => ({ ...prevState, ...err }));
      }
    },
    [createJob, editJob, data, editMode]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (formRef.current) {
          const input: JobCreateType = {
            name: formRef.current.jobName.value,
            description: formRef.current.description.value,
            startDate: formRef.current.startDate.value || null,
            endDate: formRef.current.endDate.value || null,
            location: formRef.current.location.value,
            type: formRef.current.type.value,
            departmentId: form.departmentId,
          };
          handleSubmit(input);
        }
      }}
      className="p-4"
      ref={formRef}
    >
      {errors?.message && (
        <div className="pb-4 w-full">
          <Alert
            type="danger"
            message={errors?.message}
            onClose={() => {
              changeFormErrors('message');
            }}
          />
        </div>
      )}
      <div className="gap-2 grid grid-cols-1 items-end md:grid-cols-2 md:gap-4 lg:gap-6">
        <div className="w-full">
          <Input
            bg={errors?.name ? 'bg-red-100' : undefined}
            color="text-gray-800"
            disabled={loading}
            defaultValue={data?.name}
            error={errors?.name}
            label="Title"
            name="jobName"
            onChange={() => {
              changeFormErrors('name');
            }}
            placeholder="Enter Job Title"
            rounded="rounded-md"
          />
        </div>
        <div className="w-full">
          <Select
            btn={{
              caps: true,
              disabled:
                departments.isFetching ||
                (departments.data && departments.data.result.length >= departments.data.total),
              onClick: () => {
                if (departments.data && departments.data.total > departments.data.result.length) {
                  setDepLimit((prevState) => prevState + DEFAULT_PAGINATION_SIZE);
                }
              },
              title: departments.isFetching
                ? 'loading...'
                : departments.data && departments.data.result.length >= departments.data.total
                ? 'loaded all'
                : 'load more',
            }}
            disabled={departments.isLoading || loading}
            error={departmentsError || errors?.departmentId}
            label="Department"
            name="departmentId"
            onChange={({ target: { value } }) => handleFormChange('departmentId', value)}
            placeholder="Select Department"
            options={
              departments.data
                ? departments.data.result.map((department) => ({
                    title: toCapitalize(department.name),
                    value: department.id,
                  }))
                : []
            }
            required={false}
            value={form.departmentId}
          />
        </div>
        <div className="w-full">
          <Select
            defaultValue={data?.type}
            disabled={loading}
            error={errors?.type}
            label="Job Type"
            name="type"
            onChange={() => {
              changeFormErrors('name');
            }}
            placeholder="Select Job Type"
            options={Object.entries(JobTypeOptions).map((field) => {
              return {
                title: field[0],
                value: field[1],
              };
            })}
          />
        </div>
        <div className="w-full">
          <Input
            bg={errors?.location ? 'bg-red-100' : undefined}
            color="text-gray-800"
            disabled={loading}
            defaultValue={data?.location || undefined}
            error={errors?.location}
            label="Location"
            name="location"
            onChange={() => {
              changeFormErrors('location');
            }}
            placeholder="Enter Job Location"
            rounded="rounded-md"
            required={false}
          />
        </div>
        <div className="w-full">
          <Input
            defaultValue={data?.startDate ? getStringedDate(data.startDate) : undefined}
            disabled={loading}
            error={errors?.startDate}
            label="Start Date"
            name="startDate"
            onChange={() => changeFormErrors('startDate')}
            placeholder="Start Date"
            required={false}
            type="date"
          />
        </div>
        <div className="w-full">
          <Input
            defaultValue={data?.endDate ? getStringedDate(data.endDate) : undefined}
            disabled={loading}
            error={errors?.endDate}
            label="End Date"
            name="endDate"
            onChange={() => changeFormErrors('endDate')}
            placeholder="End Date"
            required={false}
            type="date"
          />
        </div>
        <div className="w-full md:col-span-2">
          <Textarea
            defaultValue={data?.description || undefined}
            disabled={loading}
            error={errors?.description}
            label="Description"
            name="description"
            onChange={() => changeFormErrors('description')}
            placeholder="Description"
            required={false}
          />
        </div>
      </div>
      <div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <Button
            caps
            disabled={createLoading || editLoading}
            loader
            loading={createLoading || editLoading}
            title="save"
            type="submit"
          />
        </div>
      </div>
    </form>
  );
}

Form.defaultProps = {
  editMode: false,
};

export default Form;
