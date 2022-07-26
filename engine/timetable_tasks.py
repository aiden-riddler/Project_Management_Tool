import sqlite3


def get_free_times(start_time, end_time):
    conn = sqlite3.connect("schedule.db")
    cursor = conn.execute(
        f"SELECT * FROM timetable_tasks WHERE START_TIME >= {start_time} AND START_TIME < {end_time} OR {start_time} BETWEEN START_TIME AND END_TIME  ORDER BY START_TIME ASC").fetchall()

    today_tasks = []
    for row in cursor:
        timetable_task = {
            "id": row[0],
            "task_name": row[1],
            "task_table_id": row[2],
            "start_time": row[3],
            "end_time": row[4]
        }
        today_tasks.append(timetable_task)

    free_times = []

    prev_end_time = start_time
    for task in today_tasks:
        if prev_end_time < task["start_time"]:
            free_times.append((prev_end_time, task["start_time"]))
        prev_end_time = task["end_time"]

    if prev_end_time < end_time:
        free_times.append((prev_end_time, end_time))

    return free_times


class TimeTableTasks:
    def __init__(self):
        self.free_times = []
