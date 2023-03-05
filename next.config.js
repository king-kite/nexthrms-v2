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

module.exports = nextConfig;
