import * as routes from "../../../config/server";

import user from "./user"; // Single User Path
import users from "./users";

const paths = {
	[routes.USERS_URL]: users,
	[routes.USER_URL("{id}")]: user
}

export default paths;