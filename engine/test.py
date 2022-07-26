from datetime import datetime, timedelta

fmt = "%Y %d %m"
fmt2 = "%a %d %b %Y %H:%M %p"
fmt3 = "%a"
fmt5 = "%m/%d/%Y"

y = "%Y"
m = "%m"
d = "%d"
h = "%H"
min = "%M"
pm_am = "%p"
fmt4 = f"{y} {m} {d} {h}:{min} {pm_am}"
start_date = datetime.strptime("2022 16 2", fmt)
end_date = datetime.strptime("2022 17 2", fmt)

# start_time = (datetime.strptime("2/4/2022", fmt5) + timedelta(hours=hrs, minutes=mins)).timestamp()
#
# print(datetime.fromtimestamp(start_time).strftime(fmt2))
# print(datetime.fromtimestamp(end_date.timestamp()).strftime(fmt2))

# # print((end_date - start_date).days)
# print(end_date.strftime(fmt2))
print(end_date.timestamp())
# print(end_date.strftime(fmt3) == "Sun")
# #
# print(end_date.timestamp())
# #
# print((start_date + timedelta(hours=6)).timestamp())
# print((start_date + timedelta(hours=7)).timestamp())
#
# print(datetime.fromtimestamp(1644976800.0).strftime(fmt4))
# print(datetime.fromtimestamp(1644984000.0).strftime(fmt4))
# print(datetime.fromtimestamp(1644984000.0).strftime(fmt4))
# print(datetime.fromtimestamp(1644989400.0).strftime(fmt4))


# print((end_date - start_date).days)
# print((end_date + timedelta(hours=24)))

# print(end_date.timestamp())
# print(start_date.timestamp())

# nums = {"num": [3, 2, 4, 7, 3, 1, 2]}
# nums["num"].sort()
# print(nums["num"])

# num = 0
# while num < 5:
#     if num == 2:
#         num += 1
#         continue
#     print(num)
#     num += 1








# import sqlite3
from sqlite3 import OperationalError

# conn = sqlite3.connect("test.db")
# conn.execute('''CREATE TABLE courses (
#         ID INTEGER PRIMARY KEY AUTOINCREMENT,
#         NAME TEXT NOT NULL,
#         MAX_HRS REAL NOT NULL
#         );''')

# conn.execute('''INSERT into courses (NAME, MAX_HRS) values ("Geography", 7.5)''')
# conn.execute('''INSERT into courses (NAME, MAX_HRS) values ("History", 7.5)''')
#
# cursor = conn.execute('SELECT * FROM courses WHERE NAME = "Geography"')
# print(cursor.fetchall())
# conn.close()
# # try:
# #
# # except OperationalError:
# #     print("hello holla chao")
#
# conn.close()
