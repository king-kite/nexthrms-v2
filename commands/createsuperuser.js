const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const prompt = require("prompt-sync")({ sigint: true });

const {
	getEmail,
	getPassword,
	handleJoiError,
	bcrypt: { hash },
	logger,
} = require("./utils/index.js");

(async function main() {
	const firstName = prompt("Enter First Name: ");
	const lastName = prompt("Enter Last Name: ");
	const email = await getEmail();
	const password = await getPassword();

	await prisma.user.create({
		data: {
			firstName,
			lastName,
			email: email.toLowerCase().trim(),
			password: await hash(password),
			isAdmin: true,
			isSuperUser: true,
			isEmailVerified: true,
			profile: {
				create: {},
			},
			employee: {
				create: {
					dateEmployed: new Date(),
					job: {
						connectOrCreate: {
							where: {
								name: "CEO",
							},
							create: {
								name: "CEO",
							},
						},
					},
				},
			},
		},
		select: {
			id: true
		},
	});
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
