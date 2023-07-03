/**
 * TG_NARGS -> This stores the number of parameters passed into the function.
 * TG_ARGV -> This is an array containing the arguments passed to the trigger function.
 */

import type { PermissionModelChoices, PrismaClient } from '@prisma/client';

import logger from './utils/logger';
import dbModels from './models';

const DB_NAME = 'kitehrms';

const functionName = `${DB_NAME}_delete_permission_object()`;
const triggerName = `${DB_NAME}_delete_permission_object`;
const getFunctionName = (model: PermissionModelChoices) =>
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

const createDeletePermissionObjectTrigger = (model: PermissionModelChoices) => `
  CREATE TRIGGER ${triggerName}
  AFTER DELETE ON ${model}
  FOR EACH ROW
  EXECUTE FUNCTION ${getFunctionName(model)};
`;

async function main(prisma: PrismaClient) {
	logger.info('Removing old functions and triggers...');

	const models = (
		dbModels.filter((model) => (model.map ? true : false)) as unknown as {
			map: PermissionModelChoices;
			name: string;
			title: string;
		}[]
	).map((model) => model.map);

	await prisma.$transaction([
		// remove old triggers
		...models.map((model) =>
			prisma.$executeRawUnsafe(`
			DROP TRIGGER IF EXISTS ${triggerName} ON ${model};
		`)
		),
		// remove old triggers
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
}

export default main;
