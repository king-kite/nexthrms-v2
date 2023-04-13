/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['localhost', '127.0.0.1', 'res.cloudinary.com'],
		fallback: true,
	},
	reactStrictMode: true,
	swcMinify: true,
	trailingSlash: true,
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: false,
	},
};

if (process.env.NODE_ENV === 'development') {
	const withBundleAnalyzer = require('@next/bundle-analyzer')({
		enabled: +process.env.ANALYZE === 1,
	});
	module.exports = withBundleAnalyzer(nextConfig);
} else {
	module.exports = nextConfig;
}
