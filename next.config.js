/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['localhost', '127.0.0.1'],
		fallback: true,
	},
	reactStrictMode: true,
	swcMinify: true,
	trailingSlash: true,
};

module.exports = nextConfig;
