import json
import math
import sqlite3
from datetime import datetime, timedelta
from timetable_tasks import TimeTableTasks
from timetable_tasks import get_free_times

fmt = "%Y-%m-%d"
fmt2 = "%a %d %b %Y"
fmt3 = "%a"


class Course:
    def __init__(self, course_name):
        with sqlite3.connect("schedule.db") as conn:
            course_data = conn.execute(f"SELECT * FROM courses WHERE COURSE_NAME = '{course_name}'").fetchone()

        self.course_id = course_data[0]
        self.course_name = course_data[1]
        self.max_hrs = course_data[2]
        self.total_hrs = course_data[3]
        self.start_date = course_data[4]
        self.end_date = course_data[5]
        self.days_available = course_data[6]
        self.unit_time = course_data[7]
        self.min_hrs = course_data[8]
        self.preferred_hrs = json.loads(course_data[9])
        x = lambda a: a == 1
        self.include_saturday = x(course_data[10])
        self.include_sunday = x(course_data[11])

        self.days_required = self.total_hrs / self.min_hrs
        if not self.include_saturday:
            self.days_required += math.floor(self.days_available / 7)
        if not self.include_sunday:
            self.days_required += math.floor(self.days_available / 7)

        self.scheduled_hrs = []

    def hours_valid(self):
        if self.max_hrs < self.min_hrs or len(
                self.preferred_hrs) <= self.min_hrs or self.days_required > self.days_available:
            options = ["Stretch deadline"]
            if len(self.preferred_hrs) <= self.min_hrs:
                options.append("Increase number of selected hours")
            if self.max_hrs < self.min_hrs:
                options.append("Increase Max Hours per Day")
            if not self.include_saturday:
                options.append("Include Saturday")
            if not self.include_sunday:
                options.append("Include Sunday")
            return {
                "status": 400,
                "message": f"Time frame is limited. More time is required. Minimum Hrs per day should be {self.min_hrs}. You have the following options",
                "options": options,
                "title": "Scheduling Error!"
            }

    def hours_available(self):
        total_hrs = self.total_hrs
        current_date = self.start_date

        while current_date < self.end_date:
            if not self.include_saturday and datetime.fromtimestamp(current_date).strftime(fmt3) == "Sat" or \
                    not self.include_sunday and datetime.fromtimestamp(current_date).strftime(fmt3) == "Sun":
                current_date = (datetime.fromtimestamp(current_date) + timedelta(days=1)).timestamp()
                continue
            max_hrs = self.max_hrs
            min_hrs = self.min_hrs
            days_schedule = []

            start_time = (datetime.fromtimestamp(current_date) + timedelta(hours=self.preferred_hrs[0])).timestamp()
            end_time = (datetime.fromtimestamp(current_date) + timedelta(
                hours=self.preferred_hrs[len(self.preferred_hrs) - 1] + 1)).timestamp()
            free_times = get_free_times(start_time, end_time)
            for ft in free_times:
                current_starting_time = ft[0]
                if max_hrs <= 0:
                    break
                while (ft[1] - current_starting_time) / 3600 > self.unit_time and (max_hrs - self.unit_time) >= 0:

                    hr = math.floor((current_starting_time - current_date) / 3600)
                    current_end_time = (datetime.fromtimestamp(current_starting_time) + timedelta(
                        hours=self.unit_time)).timestamp()
                    if hr in self.preferred_hrs:
                        task = {
                            "task_name": self.course_name,
                            "task_table_id": self.course_id,
                            "start_time": current_starting_time,
                            "end_time": current_end_time
                        }
                        total_hrs -= self.unit_time
                        max_hrs -= self.unit_time

                        days_schedule.append(task)
                        if min_hrs > 0:
                            min_hrs -= self.unit_time
                    current_starting_time = current_end_time

            if min_hrs > 0:
                options = [f"Increase Max Hours per Day on {datetime.fromtimestamp(current_date).strftime(fmt2)} only",
                           "Stretch deadline",
                           "Increase Max Hours per day for each day"]
                if not self.include_sunday:
                    options.append("Include Sunday")
                if not self.include_saturday:
                    options.append("Include Saturday")
                return {
                    "status": 401,
                    "message": "Time frame is limited. More time is required.",
                    "options": options,
                    "prev_values": {
                        "date": current_date,
                        "scheduled_hrs": self.scheduled_hrs
                    },
                    "title": "Scheduling ran into some problems!"
                }
            current_date = (datetime.fromtimestamp(current_date) + timedelta(days=1)).timestamp()
            self.scheduled_hrs.append(days_schedule)

    def write_to_db(self):
        with sqlite3.connect("schedule.db") as conn:
            for day in self.scheduled_hrs:
                for task in day:
                    task_name = task["task_name"]
                    task_table_id = task["task_table_id"]
                    start_time = task["start_time"]
                    end_time = task["end_time"]

                    conn.execute(f"INSERT INTO timetable_tasks (TASK_NAME, TASK_TABLE_ID, START_TIME, END_TIME, TASK_DONE) "
                                 f"VALUES ('{task_name}', {task_table_id}, "
                                 f"{start_time}, {end_time}, 0)")
            return {
                "status": 402,
                "message": "Scheduling was successful. Go to schedules page to view",
                "options": [],
                "title": "Success!"
            }
