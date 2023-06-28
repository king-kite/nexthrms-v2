import dynamic from 'next/dynamic';

const DynamicDotsLoader = dynamic<any>(
	() => import('kite-react-tailwind').then((mod) => mod.DotsLoader),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading...
			</p>
		),
		ssr: false,
	}
);

const LoadingPage = () => (
	<div className="flex h-full items-center justify-center min-h-[70vh] w-full">
		<DynamicDotsLoader />
	</div>
);

export default LoadingPage;
