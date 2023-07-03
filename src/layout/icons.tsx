import dynamic from 'next/dynamic';

export const FaArchive = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaArchive),
	{
		ssr: false,
	}
);
export const FaCalendarAlt = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaCalendarAlt),
	{
		ssr: false,
	}
);
export const FaClipboardList = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaClipboardList),
	{
		ssr: false,
	}
);
export const FaClock = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaClock),
	{
		ssr: false,
	}
);
export const FaFileArchive = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaFileArchive),
	{
		ssr: false,
	}
);
export const FaFolder = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaFolder),
	{
		ssr: false,
	}
);
export const FaHandshake = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaHandshake),
	{
		ssr: false,
	}
);
export const FaLock = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaLock),
	{
		ssr: false,
	}
);
export const FaPeopleArrows = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaPeopleArrows),
	{
		ssr: false,
	}
);
export const FaProjectDiagram = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaProjectDiagram),
	{
		ssr: false,
	}
);
export const FaRProject = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaRProject),
	{
		ssr: false,
	}
);
export const FaSuitcase = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaSuitcase),
	{
		ssr: false,
	}
);
export const FaSuitcaseRolling = dynamic<any>(
	() =>
		import('../utils/components/icons').then((mod) => mod.FaSuitcaseRolling),
	{
		ssr: false,
	}
);
export const FaThLarge = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaThLarge),
	{
		ssr: false,
	}
);
export const FaUsers = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaUsers),
	{
		ssr: false,
	}
);
export const FaUsersCog = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaUsersCog),
	{
		ssr: false,
	}
);
export const FaUserClock = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaUserClock),
	{
		ssr: false,
	}
);
export const FaUserFriends = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaUserFriends),
	{
		ssr: false,
	}
);
export const FaUserShield = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaUserShield),
	{
		ssr: false,
	}
);
export const FaUserTie = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaUserTie),
	{
		ssr: false,
	}
);
export const FaWarehouse = dynamic<any>(
	() => import('../utils/components/icons').then((mod) => mod.FaWarehouse),
	{
		ssr: false,
	}
);
