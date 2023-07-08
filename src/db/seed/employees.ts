import { PrismaClient, Prisma } from '@prisma/client';

import { anonymousUserEmail, getProfile, ProfileType } from './utils';
import logger from './utils/logger';
import { hashPassword as hash } from '../../utils/bcrypt';

async function getEmployee({
	firstName,
	lastName,
	email,
	password = 'Password?1234',
	isAdmin = false,
	isSuperUser = false,
	isEmailVerified = true,
	profile,
	profileInfo,
	job,
	department,
	supervisor, // supervisor email
}: {
	firstName: string;
	lastName: string;
	email: string;
	password?: string;
	isAdmin?: boolean;
	isSuperUser?: boolean;
	isEmailVerified?: boolean;
	job: string;
	profile?: Prisma.ProfileCreateNestedOneWithoutUserInput;
	profileInfo?: ProfileType;
	department: string;
	supervisor?: string;
}) {
	return {
		firstName,
		lastName,
		email,
		password: await hash(password),
		isAdmin,
		isSuperUser,
		isEmailVerified,
		profile: profile || {
			create: getProfile({
				...profileInfo,
			}),
		},
		employee: {
			create: {
				dateEmployed: new Date(),
				job: {
					connectOrCreate: {
						where: {
							name: job,
						},
						create: {
							name: job,
						},
					},
				},
				department: {
					connectOrCreate: {
						where: {
							name: department,
						},
						create: {
							name: department,
						},
					},
				},
			},
		},
		supervisor,
	};
}

async function main(prisma: PrismaClient) {
	// Delete the previous users
	logger.info('Removing Old Employees Data...');
	await prisma.user.deleteMany({
		where: {
			email: {
				notIn: [anonymousUserEmail],
			},
			AND: [
				{
					client: { is: null },
				},
				{
					employee: { isNot: null },
				},
			],
		},
	});
	logger.success('Removed Old Employees Successfully!');

	logger.info('Adding Employees...');

	// Loading Employees
	const employees = [
		await getEmployee({
			firstName: 'January',
			lastName: 'Doe',
			email: 'jandoe@kitehrms.com',
			isSuperUser: true,
			profileInfo: {
				dob: new Date(2001, 2, 14),
				nameAddress: "January Doe's",
			},
			job: 'CEO',
			department: 'Administration',
		}),
		await getEmployee({
			firstName: 'Febuary',
			lastName: 'Doe',
			email: 'febdoe@kitehrms.com',
			isAdmin: true,
			profileInfo: {
				gender: 'FEMALE',
				dob: new Date(2002, 5, 18),
				nameAddress: "Febuary Doe's",
			},
			job: 'Human Resources Manager',
			department: 'Human Resources',
		}),
		await getEmployee({
			firstName: 'March',
			lastName: 'Doe',
			email: 'marchdoe@kitehrms.com',
			isAdmin: true,
			profileInfo: {
				dob: new Date(2005, 5, 18),
				nameAddress: "March Doe's",
			},
			job: 'Health Representative',
			department: 'Health',
		}),
		await getEmployee({
			firstName: 'April',
			lastName: 'Doe',
			email: 'aprildoe@kitehrms.com',
			profileInfo: {
				dob: new Date(2006, 1, 24),
				gender: 'FEMALE',
				nameAddress: "April Doe's",
			},
			job: 'Health Personal',
			department: 'Health',
			supervisor: 'marchdoe@kitehrms.com',
		}),
		await getEmployee({
			firstName: 'May',
			lastName: 'Doe',
			email: 'maydoe@kitehrms.com',
			profileInfo: {
				gender: 'FEMALE',
				dob: new Date(2003, 11, 1),
				nameAddress: "May Doe's",
			},
			job: 'Human Resources Personal',
			department: 'Human Resources',
			supervisor: 'marchdoe@kitehrms.com',
		}),
		await getEmployee({
			firstName: 'June',
			lastName: 'Doe',
			email: 'junedoe@kitehrms.com',
			profileInfo: {
				dob: new Date(2003, 5, 17),
				nameAddress: "June Doe's",
				gender: 'FEMALE',
			},
			job: 'Human Resources Manager Assistant',
			department: 'Human Resources',
			supervisor: 'marchdoe@kitehrms.com',
		}),
		await getEmployee({
			firstName: 'July',
			lastName: 'Doe',
			email: 'julydoe@kitehrms.com',
			isAdmin: true,
			profileInfo: {
				dob: new Date(1999, 5, 17),
				nameAddress: "July Doe's",
			},
			job: 'Sales Manager',
			department: 'Sales',
			supervisor: 'febdoe@kitehrms.com',
		}),
		await getEmployee({
			firstName: 'August',
			lastName: 'Doe',
			email: 'augustdoe@kitehrms.com',
			profileInfo: {
				dob: new Date(2004, 8, 12),
				gender: 'FEMALE',
				nameAddress: "August Doe's",
			},
			job: 'Sales Representative',
			department: 'Sales',
			supervisor: 'julydoe@kitehrms.com',
		}),
		await getEmployee({
			firstName: 'September',
			lastName: 'Doe',
			email: 'septdoe@kitehrms.com',
			profileInfo: {
				dob: new Date(2005, 3, 8),
				nameAddress: "September Doe's",
			},
			job: 'Sales Representative Assistant',
			department: 'Sales',
			supervisor: 'julydoe@kitehrms.com',
		}),
		await getEmployee({
			firstName: 'October',
			lastName: 'Doe',
			email: 'octdoe@kitehrms.com',
			isAdmin: true,
			profileInfo: {
				dob: new Date(2006, 6, 28),
				nameAddress: "October Doe's",
			},
			job: 'Media and Advertisement Director',
			department: 'Media and Advertisement',
		}),
		await getEmployee({
			firstName: 'November',
			lastName: 'Doe',
			email: 'novdoe@kitehrms.com',
			profileInfo: {
				dob: new Date(2000, 9, 18),
				nameAddress: "October Doe's",
			},
			job: 'Publisher',
			department: 'Media and Advertisement',
			supervisor: 'octdoe@kitehrms.com',
		}),
		await getEmployee({
			firstName: 'December',
			lastName: 'Doe',
			email: 'decdoe@kitehrms.com',
			isAdmin: true,
			profileInfo: {
				gender: 'FEMALE',
				dob: new Date(2002, 9, 15),
				nameAddress: "December Doe's",
			},
			job: 'Performance Appraiser',
			department: 'Administration',
			supervisor: 'jandoe@kitehrms.com',
		}),
	];

	const allEmployees = employees.map(({ supervisor, ...employee }) =>
		prisma.user.create({
			data: employee,
			select: { id: true },
		})
	);

	await Promise.all([...allEmployees]);

	// Adding employee supervisors
	const emps = employees
		.filter((employee) => (employee.supervisor ? true : false))
		.map((employee) => ({ need: employee.email, from: employee.supervisor }));

	const employeesWhoNeedSupervisor = await prisma.user.findMany({
		where: {
			email: {
				in: emps.map((emp) => emp.need),
			},
		},
		select: {
			email: true,
			employee: {
				select: {
					id: true,
				},
			},
		},
	});

	const employeeSupervisors = await prisma.user.findMany({
		where: {
			email: {
				in: emps.reduce((acc: string[], emp) => {
					if (!emp || emp === undefined) return acc;
					if (acc.includes(emp?.from || '')) return acc;
					return [...acc, emp?.from || ''];
				}, []),
			},
		},
		select: {
			email: true,
			employee: {
				select: {
					id: true,
				},
			},
		},
	});

	// NOTE: employee param is actually of type user
	const supervisorPromises = employeesWhoNeedSupervisor
		.filter((employee) => {
			// First check if the employee is in the emps array
			const emp = emps.find((emp) => emp.need === employee.email);
			if (!emp) return null;

			// Then check if the supervisor needed is in the employeeSupervisors array
			const supervisor = employeeSupervisors.find(
				(supervisor) => supervisor.email === emp.from
			);
			if (!supervisor) return null;

			return employee;
		})
		.map((user) => {
			const emp = emps.find((emp) => emp.need === user.email);
			// NOTE: supervisor param is actually of type user
			const supervisor = employeeSupervisors.find(
				(supervisor) => supervisor.email === emp?.from
			);

			return prisma.employee.update({
				where: {
					id: user.employee?.id,
				},
				data: {
					supervisors: {
						connect: {
							id: supervisor?.employee?.id,
						},
					},
				},
			});
		});

	await Promise.all([...supervisorPromises]);

	logger.success('Added Employees Successfully!');
}

export default main;
