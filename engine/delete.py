import sqlite3
import sys
import json

data = json.loads(sys.argv[1])

if data['status'] == 2000:
    with sqlite3.connect("schedule.db") as conn:
        conn.execute(f"DELETE FROM timetable_tasks WHERE ID = {data['id']}")
elif data['status'] == 2001:
    with sqlite3.connect("schedule.db") as conn:
        conn.execute(f"DELETE FROM courses WHERE ID = {data['id']}")
        conn.execute(f"DELETE FROM timetable_tasks WHERE TASK_TABLE_ID = {data['id']}")


sys.stdout.flush()
