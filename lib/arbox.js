export const createEnrollmentJobs = async () => {
	if (!user.token) await loginArbox();

	let schedule = scheduleClasses;

	console.log("Desired schedule: ", schedule);

	const getNextDateForDay = (dayOfWeek) => {
		const today = new Date();
		const daysUntil = (dayOfWeek - today.getDay() + 7) % 7 || 7;
		return format(addDays(today, daysUntil), "yyyy-MM-dd");
	};

	for (const classObj of schedule) {
		const nextDate = getNextDateForDay(classObj.dayOfWeek);

		const boxSchedule = await getArboxScheduleByDate(nextDate);
		let optionalClasses = [];
		for (const boxClass of boxSchedule) {
			if (
				boxClass.time === classObj.start_time &&
				boxClass.box_categories.name.trim() === classObj.class_name
			) {
				optionalClasses.push(boxClass);
			}
		}

		if (optionalClasses.length === 0) {
			console.log(
				"no matching classes found for the time " + classObj.start_time
			);
			continue;
		}

		let selected_class = optionalClasses[0];
		outer: for (const coach of COACH_PRIORITIES) {
			for (const currClass of optionalClasses) {
				if (currClass.coach && coach === currClass.coach.full_name) {
					selected_class = currClass;
					break outer;
				}
			}
		}

		const newJob = {
			extras: null,
			membership_user_id: user.membership_id,
			schedule_id: selected_class.id,
			workoutDetails: { ...classObj, date: nextDate },
		};
		addJob(newJob);
	}
};
