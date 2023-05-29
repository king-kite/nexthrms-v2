import { FaHandshake, FaPlaneDeparture, FaUsers } from 'react-icons/fa';

import { Card } from '../common';

const cards = [
	{
		bgColor: 'bg-yellow-400',
		image: '/images/users-yellow.png',
		title: 'TOTAL USERS',
		txtColor: 'text-yellow-400',
	},
	{
		bgColor: 'bg-green-400',
		image: '/images/users-green.png',
		title: 'ACTIVE USERS',
		txtColor: 'text-green-400',
	},
	{
		bgColor: 'bg-red-400',
		image: '/images/users-red.png',
		title: 'INACTIVE USERS',
		txtColor: 'text-red-400',
	},
	{
		bgColor: 'bg-purple-600',
		Icon: FaUsers,
		title: 'TOTAL EMPLOYEES',
		txtColor: 'text-purple-600',
	},
	{
		bgColor: 'bg-teal-600',
		Icon: FaPlaneDeparture,
		title: 'EMPLOYEES ON LEAVE',
		txtColor: 'text-teal-600',
	},
	{
		bgColor: 'bg-blue-500',
		Icon: FaHandshake,
		title: 'TOTAL CLIENTS',
		txtColor: 'text-blue-500',
	},
];

type CardsType = {
	active: number;
	leave: number;
	inactive: number;
	employees: number;
	total: number;
	clients: number;
};

const Cards = ({
	active,
	leave,
	inactive,
	employees,
	clients,
	total,
}: CardsType) => (
	<div className="gap-4 grid grid-col-1 lg:grid-cols-3 my-1 py-4">
		<Card {...cards[0]} value={total} />
		<Card {...cards[1]} value={active} />
		<Card {...cards[2]} value={inactive} />
		<Card {...cards[3]} value={employees} />
		<Card {...cards[4]} value={leave} />
		<Card {...cards[5]} value={clients} />
	</div>
);

export default Cards;
