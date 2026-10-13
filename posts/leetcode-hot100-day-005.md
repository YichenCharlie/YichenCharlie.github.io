---
title: "LeetCode Hot 100 · Day 5"
date: 2026-10-13
summary: "轮转数组、下一个排列、缺失的第一个正数：切片、双指针与原地置换。"
draft: false
---

## 189. 轮转数组 · Slicing（切片）

将最后 `k` 个元素移到前面，使用 `nums[:]` 修改原列表。

```python
class Solution:
    def rotate(self, nums: list[int], k: int) -> None:
        n = len(nums)
        k %= n
        nums[:] = nums[n - k:] + nums[:n - k]
```

- **注意：** 题目保证数组非空；`k %= n` 去掉完整轮转。
- **复杂度：** 时间 `O(n)`，额外空间 `O(n)`；切片会创建新列表。

## 31. 下一个排列 · Two Pointers（双指针）

从右向左找到第一个 `nums[i] < nums[i + 1]` 的位置，再从右侧找到第一个大于它的数，交换后反转后缀。

```python
class Solution:
    def nextPermutation(self, nums: list[int]) -> None:
        n = len(nums)
        i = n - 2

        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1

        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]

        left, right = i + 1, n - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1
```

- **纠错：** `if i >= 0` 放在第一个 `while` 外；寻找交换对象时跳过小于或等于 `nums[i]` 的数。
- **注意：** 若整个数组非递增，反转整个数组，得到最小排列。
- **空间优化：** 原来的切片反转逻辑正确，但占 `O(n)` 空间；这里改为双指针。
- **复杂度：** 时间 `O(n)`，额外空间 `O(1)`。

## 41. 缺失的第一个正数

### 方法一：Sorting（排序）

排序后，从 `1` 开始检查；遇到当前需要的数字就加一，遇到更大的数字说明出现缺口。

```python
class Solution:
    def firstMissingPositive(self, nums: list[int]) -> int:
        nums.sort()
        res = 1
        for num in nums:
            if num == res:
                res += 1
            elif num > res:
                break
        return res
```

- **纠错：** 比较使用 `==`，不是赋值符号 `=`。
- **复杂度：** 时间 `O(n log n)`，Python 排序额外空间 `O(n)`；不满足本题的复杂度要求。

### 方法二：原地置换

答案一定在 `[1, n + 1]`。将范围内的数字 `x` 放到下标 `x - 1`，最后查找第一个位置不匹配的数字。

```python
class Solution:
    def firstMissingPositive(self, nums: list[int]) -> int:
        n = len(nums)

        for i in range(n):
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                target = nums[i] - 1
                nums[target], nums[i] = nums[i], nums[target]

        for i in range(n):
            if nums[i] != i + 1:
                return i + 1

        return n + 1
```

- **纠错：** `if` 末尾补冒号；`return n + 1` 必须放在循环外。
- **注意：** 交换后继续检查当前位置；目标位置已有相同数字时停止，避免重复值导致死循环。
- **修改：** 原交换语句可用，这里增加 `target`，让目标下标更清楚。
- **复杂度：** 时间 `O(n)`，额外空间 `O(1)`；每次交换都将一个数字放到正确位置。