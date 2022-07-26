import sqlite3
import sys
import json
from datetime import datetime, timedelta
from timetable_tasks import get_free_times

data = json.loads(sys.argv[1])
fmt2 = "%m/%d/%Y"

with sqlite3.connect("schedule.db") as conn:
    tm = data['start_time']
    hrs = int(tm.split(":")[0])
    mins = int(tm.split(":")[1].split(" ")[0])
    am_pm = tm.split(":")[1].split(" ")[1]
    if am_pm == "PM" and hrs != 12:
        hrs += 12
    start_time = (datetime.strptime(data["date"], fmt2) + timedelta(hours=hrs, minutes=mins)).timestamp()

    tm = data['end_time']
    hrs = int(tm.split(":")[0])
    mins = int(tm.split(":")[1].split(" ")[0])
    am_pm = tm.split(":")[1].split(" ")[1]
    if am_pm == "PM" and hrs != 12:
        hrs += 12
    end_time = (datetime.strptime(data["date"], fmt2) + timedelta(hours=hrs, minutes=mins)).timestamp()

    free_time = get_free_times(start_time, end_time)
    if len(free_time) == 0:
        print(json.dumps({
            "status": 400,
            "message": "Another activity exists within the bounds of selected time"
        }))
    else:
        conn.execute(f"INSERT into timetable_tasks (TASK_NAME, TASK_TABLE_ID, START_TIME, END_TIME, TASK_DONE) "
                     f"VALUES ('{data['task_name']}', 'TTID', {start_time}, {end_time}, 0)")
        print(json.dumps({
            "status": 402,
            "res": "success"
        }))


sys.stdout.flush()
