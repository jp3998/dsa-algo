**Platform:** NeetCode

**Problem:** Valid Parentheses

**Problem Link:** https://neetcode.io/problems/validate-parentheses/question

---
# Problema articulation


# Solution explanation


# Solutions submitted

class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        open_brackets = ['(', '{', '[']
        close_bracket_map = {')': '(', ']': '[', '}': '{'}
        for bracket in s:
            if bracket in open_brackets:
                stack.append(bracket)
            else:
                if close_bracket_map[bracket] == stack[-1]:
                    stack.pop()
                else:
                    return False
        return True

class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        open_brackets = ['(', '{', '[']
        close_bracket_map = {')': '(', ']': '[', '}': '{'}
        for bracket in s:
            if bracket in open_brackets:
                stack.append(bracket)
            else:
                if (len(stack) > 0) and (close_bracket_map[bracket] == stack[-1]):
                    stack.pop()
                else:
                    return False
        return True




class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        open_brackets = ['(', '{', '[']
        close_bracket_map = {')': '(', ']': '[', '}': '{'}
        for bracket in s:
            if bracket in open_brackets:
                stack.append(bracket)
            else:
                if (len(stack) > 0) and (close_bracket_map[bracket] == stack[-1]):
                    stack.pop()
                else:
                    return False
        return len(stack) == 0


# Mistakes Made