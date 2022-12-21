import * as routes from "../../../config/server";

import clientsExport from './exportClients'
import client from './client'; // Single Client
import clients from './clients'

const paths = {
	[routes.CLIENTS_URL]: clients,
	[routes.CLIENT_URL("{id}")]: client,
	[routes.CLIENTS_EXPORT_URL]: clientsExport,
};

export default paths;
