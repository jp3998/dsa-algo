**Platform:** NeetCode

**Problem:** Remove Element

**Problem Link:** https://neetcode.io/problems/minimum-stack/solution

---

# Notes


# Solution building and articulation

# Solutions sumbmitted

class MinStack:

    def __init__(self):
        self.storage = []
        self.min_stack = [ 2 ^ 32 ]
        

    def push(self, val: int) -> None:
        self.min_stack.append(min(self.min_stack[-1], val))
        self.storage.append(val)

    def pop(self) -> None:
        self.storage.pop()
        self.min_stack.pop()
        

    def top(self) -> int:
        return self.storage[-1]
        

    def getMin(self) -> int:
        return self.min_stack[-1]


class MinStack:

    def __init__(self):
        self.storage = []
        self.min_stack = [ 2 ** 32 ]
        

    def push(self, val: int) -> None:
        self.min_stack.append(min(self.min_stack[-1], val))
        self.storage.append(val)

    def pop(self) -> None:
        self.storage.pop()
        self.min_stack.pop()
        

    def top(self) -> int:
        return self.storage[-1]
        

    def getMin(self) -> int:
        return self.min_stack[-1]


