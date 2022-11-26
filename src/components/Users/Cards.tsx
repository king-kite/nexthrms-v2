import { Card } from '../common';

const cards = [
	{
		bgColor: 'bg-green-400',
		image: '/images/users-green.png',
		title: 'ACTIVE USERS',
		txtColor: 'text-green-400',
	},
	{
		bgColor: 'bg-yellow-400',
		image: '/images/users-yellow.png',
		title: 'TOTAL USERS',
		txtColor: 'text-yellow-400',
	},
	{
		bgColor: 'bg-red-400',
		image: '/images/users-red.png',
		title: 'INACTIVE USERS',
		txtColor: 'text-red-400',
	},
	{
		bgColor: 'bg-green-400',
		image: '/images/users-green.png',
		title: 'EMPLOYEES',
		txtColor: 'text-green-400',
	},
	{
		bgColor: 'bg-yellow-400',
		image: '/images/users-yellow.png',
		title: 'CLIENTS',
		txtColor: 'text-yellow-400',
	},
	{
		bgColor: 'bg-red-400',
		image: '/images/users-red.png',
		title: 'EMPLOYEES ON LEAVE',
		txtColor: 'text-red-400',
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

const Cards = ({ active, leave, inactive, employees, clients, total }: CardsType) => (
	<div className="gap-4 grid grid-col-1 lg:grid-cols-3 my-1 py-4">
		<Card {...cards[0]} value={active} />
		<Card {...cards[1]} value={total} />
		<Card {...cards[2]} value={inactive} />
		<Card {...cards[3]} value={employees} />
		<Card {...cards[4]} value={clients} />
		<Card {...cards[5]} value={leave} />
	</div>
);

export default Cards;
