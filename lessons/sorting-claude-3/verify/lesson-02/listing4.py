from functools import cmp_to_key


def largest_number(nums):
    strs = [str(x) for x in nums]

    def cmp(a, b):
        # a goes first iff a+b > b+a. A strict weak ordering: the key is a / (10**len(a) - 1).
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0

    strs.sort(key=cmp_to_key(cmp))
    result = "".join(strs)
    return "0" if result[0] == "0" else result   # all zeros: "00" must become "0"


print(largest_number([3, 30, 34, 5, 9]))   # 9534330
print(largest_number([0, 0]))              # 0
