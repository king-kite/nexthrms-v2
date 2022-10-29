function Home() {
	return (
		<div className="py-5 h-screen bg-gray-200">
			<div className="container mx-auto">
				<div className="bg-white rounded-lg shadow-lg p-5 md:p-20 mx-2">
					<div className="text-center">
						<h2 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:text-5xl sm:leading-none md:text-6xl">
							Kite<span className="text-primary-600">HRMS</span>
						</h2>
						<h3 className="text-xl md:text-3xl mt-10">Coming Soon</h3>
						<p className="text-md md:text-xl mt-10">
							KiteHRMS is a website help you provide simple productivity tools
							for your human resource management system online.
						</p>
					</div>
					<div className="flex flex-wrap mt-10 justify-center">
						<div className="m-3">
							<a
								href="#"
								title="KiteHRMS On Facebook"
								className="md:w-32 bg-white tracking-wide text-gray-800 font-bold rounded border-2 border-blue-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white shadow-md py-2 px-6 inline-flex items-center"
							>
								<span className="mx-auto">Facebook</span>
							</a>
						</div>
						<div className="m-3">
							<a
								href="#"
								title="KiteHRMS On Twitter"
								className="md:w-32 bg-white tracking-wide text-gray-800 font-bold rounded border-2 border-blue-500 hover:border-blue-500 hover:bg-blue-500 hover:text-white shadow-md py-2 px-6 inline-flex items-center"
							>
								<span className="mx-auto">Twitter</span>
							</a>
						</div>
						<div className="m-3">
							<a
								href="#"
								title="KiteHRMS On Pinterest"
								className="md:w-32 bg-white tracking-wide text-gray-800 font-bold rounded border-2 border-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white shadow-md py-2 px-6 inline-flex items-center"
							>
								<span className="mx-auto">Pintrest</span>
							</a>
						</div>
						<div className="m-3">
							<a
								href="#"
								title="KiteHRMS on Reddit"
								className="md:w-32 bg-white tracking-wide text-gray-800 font-bold rounded border-2 border-orange-500 hover:border-orange-500 hover:bg-orange-500 hover:text-white shadow-md py-2 px-6 inline-flex items-center"
							>
								<span className="mx-auto">Reddit</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
