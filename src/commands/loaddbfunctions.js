/**
 * TG_NARGS -> This stores the number of parameters passed into the function.
 * TG_ARGV -> This is an array containing the arguments passed to the trigger function.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { models, logger } = require('./utils/index.js');

const DB_NAME = process.env.DATABASE_NAME || 'kitehrms';

if (!process.env.DATABASE_NAME)
	logger.warn("Database name was not provided! Default to 'kitehrms'");

const functionName = `${DB_NAME}_delete_permission_object()`;
const triggerName = `${DB_NAME}_delete_permission_object`;
const getFunctionName = (model) =>
	`${DB_NAME}_delete_permission_object('${model}')`;

const createDeletePermissionObjectFunction = `
  CREATE OR REPLACE FUNCTION ${functionName} RETURNS TRIGGER AS $$
  DECLARE
    model text;
  BEGIN
    IF TG_NARGS = 0 THEN
      RAISE EXCEPTION '${functionName} requires one argument';
    END IF;
    -- Access the first argument passed to the trigger function
    model := TG_ARGV[0];
    DELETE FROM permissions_objects WHERE object_id=OLD.id AND model_name=model::"PermissionModelChoices";
    RETURN OLD;
  END;
  $$ LANGUAGE plpgsql;
`;

const createDeletePermissionObjectTrigger = (model) => `
  CREATE TRIGGER ${triggerName}
  AFTER DELETE ON ${model}
  FOR EACH ROW
  EXECUTE FUNCTION ${getFunctionName(model)};
`;

(async function main() {
	logger.info('Removing old functions and triggers...');

	const oldTriggers = models.map((model) =>
		prisma.$executeRawUnsafe(`
			DROP TRIGGER IF EXISTS ${triggerName} ON ${model};
		`)
	);
	await prisma.$transaction([
		...oldTriggers,
		prisma.$executeRawUnsafe(`
			DROP FUNCTION IF EXISTS ${functionName};
		`),
	]);

	logger.success('Removed old functions and triggers successfully!');

	logger.info('Adding new functions...');

	await prisma.$executeRawUnsafe(createDeletePermissionObjectFunction);

	logger.success('Added new functions!');

	logger.info('Adding new triggers');

	await prisma.$transaction(
		models.map((model) =>
			prisma.$executeRawUnsafe(createDeletePermissionObjectTrigger(model))
		)
	);

	logger.success('Added new triggers successfully!');
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
