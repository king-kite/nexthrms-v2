import { AttendanceInfoType } from '../../types';

export const TimeCard = ({
	border,
	day,
	time,
}: {
	day: string;
	border: string;
	time?: string;
}) => (
	<div className="flex items-start">
		<div className="flex flex-col items-center h-full">
			<div
				className={`${border} border-2 h-[0.75rem] mx-1 rounded-full w-[0.6rem]`}
			/>
			<div className="bg-gray-400 h-full min-h-[16px] rounded-lg w-[1.5px]" />
		</div>
		<div className="flex flex-col mx-2 w-full md:flex-row md:justify-between">
			<div>
				<span className="block capitalize font-medium mb-1 text-gray-700 text-xs md:text-sm">
					{day}
				</span>
				<span className="capitalize font-semibold text-gray-500 text-xs">
					{time || '-------'}
				</span>
			</div>
		</div>
	</div>
);

// Get the specified day in the timeline array
// 0 for sunday and 6 for saturday;
function getAttendanceByDay(timeline: AttendanceInfoType[], day: number = 0) {
	const attendance = timeline.find((attendance) => {
		const date = new Date(attendance.date);
		if (date.getDay() === day) return date;
	});
	return attendance;
}

const prepDayObject = (day?: AttendanceInfoType) => ({
	pit: day?.punchIn ? new Date(day.punchIn).toLocaleTimeString() : undefined,
	pot: day?.punchOut ? new Date(day.punchOut).toLocaleTimeString() : undefined,
	bic: day?.punchIn ? 'border-green-600' : 'border-red-600',
	boc: day?.punchOut ? 'border-green-600' : 'border-red-600',
});

const Activity = ({ timeline }: { timeline: AttendanceInfoType[] }) => {
	const week = [
		{
			day: 'monday',
			...prepDayObject(getAttendanceByDay(timeline, 1)),
		},
		{
			day: 'tuesday',
			...prepDayObject(getAttendanceByDay(timeline, 2)),
		},
		{
			day: 'wednesday',
			...prepDayObject(getAttendanceByDay(timeline, 3)),
		},
		{
			day: 'thursday',
			...prepDayObject(getAttendanceByDay(timeline, 4)),
		},
		{
			day: 'friday',
			...prepDayObject(getAttendanceByDay(timeline, 5)),
		},
		{
			day: 'saturday',
			...prepDayObject(getAttendanceByDay(timeline, 6)),
		},
	];

	return (
		<div className="bg-white px-4 py-2 rounded-lg shadow-lg md:col-span-2 lg:col-span-1">
			<h3 className="capitalize font-black my-2 text-gray-700 text-lg tracking-wider md:text-xl lg:text-lg">
				Weekly Activity
			</h3>
			<div className="flex items-center mb-2">
				<div className="px-1 w-1/2">
					<span className="capitalize font-semibold inline-block text-center text-gray-700 text-base">
						punch in
					</span>
				</div>
				<div className="px-2 w-1/2">
					<span className="capitalize font-semibold inline-block text-center text-gray-700 text-base">
						punch out
					</span>
				</div>
			</div>
			{week.map(({ day, pit, bic, boc, pot }) => (
				<div key={day} className="gap-4 grid grid-cols-2">
					<TimeCard border={bic} day={day} time={pit} />
					<TimeCard border={boc} day={day} time={pot} />
				</div>
			))}
		</div>
	);
};

export default Activity;
