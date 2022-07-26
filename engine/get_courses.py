import sqlite3
import sys
import json
from sqlite3 import OperationalError
from datetime import datetime

data = json.loads(sys.argv[1])
full_fmt = "%a %d %b %Y"

with sqlite3.connect("schedule.db") as conn:
    try:
        courses = conn.execute("SELECT * FROM courses").fetchall()
        results = []
        for c in courses:
            start_time = datetime.fromtimestamp(c[4]).strftime(full_fmt)
            end_time = datetime.fromtimestamp(c[5]).strftime(full_fmt)
            res = {
                'id': c[0],
                'COURSE_NAME': c[1],
                'MAX_HRS': c[2],
                'TOTAL_HRS': c[3],
                'START_TIME': start_time,
                'END_TIME': end_time,
                'DAYS_REQUIRED': c[6],
                'UNIT_TIME': c[7],
                'MIN_HRS': c[8],
                'PREFERRED_HRS': c[9],
                'INCLUDE_SATURDAY': c[10],
                'INCLUDE_SUNDAY': c[11]
            }
            results.append(res)

        print(json.dumps(results))
    except OperationalError:
        print(json.dumps([]))

sys.stdout.flush()
