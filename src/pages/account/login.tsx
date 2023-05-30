import Login from '../../containers/account/login';
import { Title } from '../../utils';

const Page = () => {
	return (
		<>
			<Title title="Login Into Kite Human Resource Management System" />
			<Login />
		</>
	);
};

Page.authRequired = false;

export default Page;
