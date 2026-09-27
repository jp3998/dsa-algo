**Platform:** NeetCode

**Problem:** Remove Element

**Problem Link:** https://neetcode.io/problems/remove-element/question?list=neetcode150

---

# Notes
I genuinely struggled with this problem.
I did found the solution but it was not clean.

# Solution building and articulation



# Solutions sumbmitted

```
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        val_freq = 0
        val_seq_first_ele_ind = -1
        for i in range(0, len(nums)):
            arr_val = nums[i]
            if arr_val != val:
                if val_freq > 0:
                    # this means we can swap.
                    # swap elements at index i and remove_element_strek_first_ind
                    tmp = nums[i]
                    nums[i] = nums[val_seq_first_ele_ind]
                    nums[val_seq_first_ele_ind] = tmp

                    # now update indexes
                    val_seq_first_ele_ind += 1
            else:
                val_freq += 1
                if val_seq_first_ele_ind is None:
                    val_seq_first_ele_ind = i
        return val_freq
```


```
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        val_freq = 0
        val_seq_first_ele_ind = -1
        for i in range(0, len(nums)):
            arr_val = nums[i]
            if arr_val != val:
                if val_freq > 0:
                    # this means we can swap.
                    # swap elements at index i and remove_element_strek_first_ind
                    tmp = nums[i]
                    nums[i] = nums[val_seq_first_ele_ind]
                    nums[val_seq_first_ele_ind] = tmp

                    # now update indexes
                    val_seq_first_ele_ind += 1
            else:
                val_freq += 1
                if val_seq_first_ele_ind == -1:
                    val_seq_first_ele_ind = i
        return val_freq
```


```
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        val_freq = 0
        val_seq_first_ele_ind = -1
        for i in range(0, len(nums)):
            arr_val = nums[i]
            if arr_val != val:
                if val_freq > 0:
                    # this means we can swap.
                    # swap elements at index i and remove_element_strek_first_ind
                    tmp = nums[i]
                    nums[i] = nums[val_seq_first_ele_ind]
                    nums[val_seq_first_ele_ind] = tmp

                    # now update indexes
                    val_seq_first_ele_ind += 1
            else:
                val_freq += 1
                if val_seq_first_ele_ind == -1:
                    val_seq_first_ele_ind = i
        return len(nums) - val_freq
```