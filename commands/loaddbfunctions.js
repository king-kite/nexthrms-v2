/**
 * TG_NARGS -> This stores the number of parameters passed into the function.
 * TG_ARGV -> This is an array containing the arguments passed to the trigger function.
 */
const DB_NAME = process.env.DATABASE_NAME;

if (!DB_NAME)
	throw new Error("Please provide the 'DATABASE_NAME' environment variable! ");

const functionName = `${DB_NAME}.delete_permission_object()`;
const triggerName = `${DB_NAME}_delete_permission_object`;
const getFunctionName = (model) =>
	`${DB_NAME}.delete_permission_object('${model}')`;

const createDeletePermissionObjectFunction = `
  CREATE OR REPLACE FUNCTION ${functionName} RETURNS TRIGGER AS $$
  DECLARE
    model text;
  BEGIN
    IF TG_NARGS = 0 THEN
      RAISE EXCEPTION 'delete_permission_object() requires one argument';
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
  ON DATABASE ${DB_NAME}
  AFTER DELETE ON ${model}
  FOR EACH ROW
  EXECUTE FUNCTION ${getFunctionName(model)};
`;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { models, logger } = require('./utils/index.js');

(async function main() {
	logger.info('Removing old functions and triggers...');

	const oldTriggers = models.map(
		(model) => prisma.$executeRaw`
    DROP TRIGGER IF EXISTS ${triggerName} ON ${model};
  `
	);
	await Promise.all([
		...oldTriggers,
		prisma.$executeRaw`
	    DROP FUNCTION IF EXISTS ${functionName};
    `,
	]);

	logger.success('Removed old functions and triggers successfully!');

	logger.info('Adding new functions...');

	await prisma.$executeRaw`${createDeletePermissionObjectFunction}`;

	logger.success('Added new functions!');

	logger.info('Adding new triggers');

	const triggers = models.map(
		(model) => prisma.$executeRaw`${createDeletePermissionObjectTrigger(model)}`
	);

	await Promise.all(triggers);

	logger.success('Added new triggers successfully!');
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
