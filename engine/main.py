import math
import sqlite3
from sqlite3 import OperationalError
import sys
import json
from datetime import datetime, timedelta
from course import Course

year_fmt = "%Y"
month_fmt = "%m"
day_fmt = "%d"
hour_fmt = "%H"
minute_fmt = "%M"
pm_am = "%p"
full_date_fmt = "%a %d %b %Y %H:%M %p"
full_fmt_2 = "%a %d %b %Y"


def table_exists(table_name):
    with sqlite3.connect("schedule.db") as c:
        try:
            c.execute(f"SELECT * FROM {table_name}")
            return True
        except OperationalError:
            return False


def name_exists():
    ch_course_name = data['course_name']
    with sqlite3.connect("schedule.db") as ch_conn:
        try:
            courses = ch_conn.execute(f"SELECT * FROM courses")
            for crse in courses:
                if crse[1].lower() == ch_course_name.lower():
                    return True
            return False
        except OperationalError:
            return False


def create_db():
    with sqlite3.connect("schedule.db") as connection:
        try:
            connection.execute('''CREATE TABLE timetable_tasks (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            TASK_NAME TEXT NOT NULL,
            TASK_TABLE_ID TEXT NOT NULL,
            START_TIME REAL NOT NULL,
            END_TIME REAL NOT NULL,
            TASK_DONE INTEGER NOT NULL
            );''')
        except OperationalError:
            pass

        try:
            connection.execute('''CREATE TABLE courses (
                            ID INTEGER PRIMARY KEY AUTOINCREMENT,
                            COURSE_NAME TEXT NOT NULL,
                            MAX_HRS REAL NOT NULL,
                            TOTAL_HRS REAL NOT NULL,
                            START_TIME REAL NOT NULL,
                            END_TIME REAL NOT NULL,
                            DAYS_REQUIRED REAL NOT NULL,
                            UNIT_TIME REAL NOT NULL,
                            MIN_HRS REAL NOT NULL,
                            PREFERRED_HRS TEXT NOT NULL,
                            INCLUDE_SATURDAY INTEGER NOT NULL,
                            INCLUDE_SUNDAY INTEGER NOT NULL
                            );''')
        except OperationalError:
            pass


data = json.loads(sys.argv[1])

# data = {
#                 "course_name": "Web Dev",
#                 "max_hrs": 2,
#                 "total_hrs": 20,
#                 "unit_time": 1,
#                 "start_date": "2022-1-19",
#                 "end_date": "2022-2-5",
#                 "preferred_hrs": [10, 14, 15, 16],
#                 "include_saturday": 1,
#                 "include_sunday": 0
# }

fmt = "%Y-%m-%d"
fmt2 = "%m/%d/%Y"

status = data["status"]
# status = 600


if status == 600 and name_exists():
    err = {
        "status": 400,
        "message": f"Course with that name exists",
        "options": [],
        "title": "Name Error!"
    }
    print(json.dumps(err))
elif status == 600:
    create_db()
    status = 601
elif status == 1000:
    with sqlite3.connect("schedule.db") as conn:
        course_name = data['course_name']
        cursor = conn.execute(f"DELETE FROM courses WHERE COURSE_NAME = '{course_name}'")
elif status == 602:
    course_name = data['course_name']
    course = Course(course_name)
    course.start_date = data['prev_values']['date']
    course.scheduled_hrs = data['prev_values']['scheduled_hrs']
    hrs_available = course.hours_available()
    if hrs_available:
        print(json.dumps(hrs_available))
    else:
        to_db = course.write_to_db()
        if to_db:
            print(json.dumps(to_db))
elif status == 500:
    if table_exists("timetable_tasks") and table_exists("courses"):
        with sqlite3.connect("schedule.db") as conn:
            courses = conn.execute(
                "SELECT * FROM timetable_tasks t JOIN courses c ON t.TASK_TABLE_ID = c.ID").fetchall()
            results = []
            for course in courses:
                start_time = datetime.fromtimestamp(course[3])
                end_time = datetime.fromtimestamp(course[4])
                res = {
                    'id': course[0],
                    'task_name': course[1],
                    'task_table_id': course[2],
                    'start_year': start_time.strftime(year_fmt),
                    'start_month': start_time.strftime(month_fmt),
                    'start_day': start_time.strftime(day_fmt),
                    'start_hour': start_time.strftime(hour_fmt),
                    'start_minute': start_time.strftime(minute_fmt),
                    'start_pm_am': start_time.strftime(pm_am),
                    'start_date': start_time.strftime(full_fmt_2),
                    'end_year': end_time.strftime(year_fmt),
                    'end_month': end_time.strftime(month_fmt),
                    'end_day': end_time.strftime(day_fmt),
                    'end_hour': end_time.strftime(hour_fmt),
                    'end_minute': end_time.strftime(minute_fmt),
                    'end_pm_am': end_time.strftime(pm_am),
                    'course_id': course[6],
                    'course_name': course[7],
                    'end_date': datetime.fromtimestamp(course[11]).strftime(full_date_fmt),
                    'task_done': course[5],
                    'table_name': 'courses'
                }
                results.append(res)

            single_tasks = conn.execute("SELECT * FROM timetable_tasks WHERE TASK_TABLE_ID = 'TTID'")
            for st in single_tasks:
                start_time = datetime.fromtimestamp(st[3])
                end_time = datetime.fromtimestamp(st[4])
                res = {
                    'id': st[0],
                    'task_name': st[1],
                    'task_table_id': st[2],
                    'start_year': start_time.strftime(year_fmt),
                    'start_month': start_time.strftime(month_fmt),
                    'start_day': start_time.strftime(day_fmt),
                    'start_hour': start_time.strftime(hour_fmt),
                    'start_minute': start_time.strftime(minute_fmt),
                    'start_pm_am': start_time.strftime(pm_am),
                    'start_date': start_time.strftime(full_fmt_2),
                    'end_year': end_time.strftime(year_fmt),
                    'end_month': end_time.strftime(month_fmt),
                    'end_day': end_time.strftime(day_fmt),
                    'end_hour': end_time.strftime(hour_fmt),
                    'end_minute': end_time.strftime(minute_fmt),
                    'end_pm_am': end_time.strftime(pm_am),
                    'course_id': "",
                    'course_name': "",
                    'end_date': "",
                    'task_done': st[5],
                    'table_name': 'timetable_tasks'
                }
                results.append(res)

            print(json.dumps(results))
    else:
        print(json.dumps([]))
elif status == 1001:
    updates = data["updates"]
    update_str = ""
    ctrl = 1
    for num in range(len(updates)):
        for k, v in updates[num].items():
            if k == "DATE":
                continue
            if k == "END_TIME" or k == "START_TIME":
                hrs = int(v.split(":")[0])
                mins = int(v.split(":")[1].split(" ")[0])
                am_pm = v.split(":")[1].split(" ")[1]
                if am_pm == "PM" and hrs != 12:
                    hrs += 12
                time = (datetime.strptime(updates[num]["DATE"], fmt2) + timedelta(hours=hrs, seconds=mins)).timestamp()
                update_str += f"'{k}' = {time}"
            else:
                update_str += f"'{k}' = '{v}'"
            if not ctrl == len(updates):
                update_str += ','
        ctrl += 1

    with sqlite3.connect("schedule.db") as conn:
        conn.execute(f"UPDATE {data['table_name']} SET {update_str} WHERE ID = {data['id']}")
        print(json.dumps({
            "message": "Update Successful"
        }))


if status == 601:
    course_name = data['course_name']
    max_hrs = data["max_hrs"]
    total_hrs = data["total_hrs"]
    unit_time = data["unit_time"]
    start_date = datetime.strptime(data["start_date"], fmt)
    end_date = datetime.strptime(data["end_date"], fmt)
    preferred_hrs = data["preferred_hrs"]
    preferred_hrs.sort()
    days_available = (end_date - start_date).days + 1
    min_hrs = math.ceil(total_hrs / days_available)

    include_saturday = data["include_saturday"]
    include_sunday = data["include_sunday"]

    with sqlite3.connect("schedule.db") as conn:
        cursor = conn.execute(f"SELECT * FROM courses WHERE COURSE_NAME = '{course_name}'")
        if len(cursor.fetchall()) > 0:
            changes = data["changes"]
            c_str = ""
            for k, v in changes.items():
                if k == "PREFERRED_HRS":
                    c_str += f"{k} = {json.dumps(v)}"
                else:
                    c_str += f"{k} = {v},"
            conn.execute(f"UPDATE courses SET {c_str} WHERE COURSE_NAME = '{course_name}'")
            conn.commit()
        else:
            conn.execute(f"INSERT into courses "
                         f"(COURSE_NAME ,MAX_HRS , TOTAL_HRS, START_TIME, END_TIME, "
                         f"DAYS_REQUIRED, UNIT_TIME, MIN_HRS, PREFERRED_HRS, INCLUDE_SATURDAY, INCLUDE_SUNDAY) "
                         f"VALUES ('{course_name}', {max_hrs}, {total_hrs}, {start_date.timestamp()}, "
                         f"{(end_date + timedelta(hours=24)).timestamp()}, {days_available}, {unit_time}, {min_hrs}, "
                         f"'{json.dumps(preferred_hrs)}', {include_saturday}, {include_sunday})")

    course = Course(course_name)
    hrs_valid = course.hours_valid()
    if hrs_valid:
        print(json.dumps(hrs_valid))
    else:
        hrs_available = course.hours_available()
        if hrs_available:
            print(json.dumps(hrs_available))
        else:
            to_db = course.write_to_db()
            if to_db:
                print(json.dumps(to_db))

sys.stdout.flush()
