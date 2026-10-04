from listing1 import *

needs = {("a", "c"), ("b", "c"), ("b", "d")}   # (x, y): y needs x
task_before = lambda x, y: (x, y) in needs

print(count_sorted("abcd", task_before))                 # 5
print(is_sorted_neighbours("dabc", task_before))         # True  (passes the neighbour test)
print(is_sorted_by("dabc", task_before))                 # False (b must precede d)

noticeably = lambda x, y: y - x > 1
print(is_sorted_neighbours([2.2, 1.5, 1.0], noticeably))  # True
print(is_sorted_by([2.2, 1.5, 1.0], noticeably))          # False (1.0 must come before 2.2)
