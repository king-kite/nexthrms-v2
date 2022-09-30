import { Loader } from '@king-kite/react-kit';

const SplashScreen = () => (
	<div
		className="bg-center bg-cover bg-no-repeat bg-primary-500 flex flex-grow h-screen items-center justify-center w-full"
		style={{ backgroundImage: 'url(/images/bg.png)' }}
	>
		<Loader color="secondary" size={15} type="dashed" width="md" />
	</div>
);

export default SplashScreen;
