import * as routes from "../../../config/server";

import users from "./users";

const paths = {
	[routes.USERS_URL]: users,
}

export default paths;