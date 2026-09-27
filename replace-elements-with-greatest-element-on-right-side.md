**Platform:** NeetCode

**Problem:** Replace Elements With Greatest Element On Right Side

**Problem Link:** https://neetcode.io/problems/replace-elements-with-greatest-element-on-right-side/question

---

# Solution building and articulation
We start traversing the array from right to left.

We keep track of the greatest value we have seen so far in max.

For every element we encounter:

Store the current value of max as previous_max.
Update max using the current element's value.
Replace the current element with previous_max.


# Solutions sumbmitted
```
class Solution:
    def replaceElements(self, arr: List[int]) -> List[int]:
        max = -1
        for i in range(len(arr)-1, 0, -1):
            previous_max = max
            if arr[i] > max:
                max = arr[i]
            arr[i] = previous_max
        arr[len(arr)-1] = -1
        return arr
```

```
class Solution:
    def replaceElements(self, arr: List[int]) -> List[int]:
        max = -1
        for i in range(len(arr)-1, -1, -1):
            previous_max = max
            if arr[i] > max:
                max = arr[i]
            arr[i] = previous_max
        arr[len(arr)-1] = -1
        return arr
```

