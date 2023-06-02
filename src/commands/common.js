function getProfile({
	dob = new Date(),
	image = {
		create: {
			url: '/images/default.png',
			size: 0,
			name: "user.png",
			type: "image"
		}
	},
	nameAddress = 'my',
	address,
	city = 'New City',
	phone = '08123456789',
	state = 'New State',
	gender = 'MALE',
}) {
	return {
		dob,
		image,
		address:
			address ||
			`This is ${nameAddress} Home Address. Please leave all messages here.`,
		city,
		phone,
		state,
		gender,
	};
}

module.exports = {
	getProfile,
};
