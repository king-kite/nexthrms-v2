import * as routes from "../../../config/server";

import userActivation from "./userActivation";
import passwordChange from "./passwordChange";
import user from "./user"; // Single User Path
import users from "./users";

const paths = {
	[routes.USERS_URL]: users,
	[routes.USER_URL("{id}")]: user,
	[routes.CHANGE_USER_PASSWORD_URL]: passwordChange,
	[routes.ACTIVATE_USER_URL]: userActivation,
}

export default paths;