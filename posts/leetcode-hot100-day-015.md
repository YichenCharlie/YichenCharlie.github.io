---
title: "LeetCode Hot 100 · Day 15"
date: 2026-10-24
summary: "每日温度、柱状图最大矩形、滑动窗口最大值：单调栈与单调队列。"
draft: false
---

## 739. 每日温度 · Monotonic Stack（单调栈）

本质是找下一个更大的值。栈存下标，遇到更高温度时弹出对应下标，并记录等待天数。

```python
class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        temps = temperatures
        n = len(temps)
        stack = []
        res = [0] * n

        for i in range(n):
            while stack and temps[i] > temps[stack[-1]]:
                idx = stack.pop()
                res[idx] = i - idx
            stack.append(i)

        return res
```

- **纠错：** 先定义 `n`，再创建 `[0] * n`，不能写 `len(n)`。
- **注意：** 栈底到栈顶的温度非递增；相等温度不能作为“更高温度”，不弹出。
- **复杂度：** 时间 `O(n)`，空间 `O(n)`。

## 84. 柱状图中最大的矩形 · 单调栈

遇到更矮的柱子时，弹出栈顶柱子，以其高度计算矩形面积；当前下标是右边界，弹出后的栈顶用于确定左边界。

```python
class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        heights = [0] + heights + [0]
        n = len(heights)
        max_area = 0
        stack = []

        for i in range(n):
            while stack and heights[i] < heights[stack[-1]]:
                h = heights[stack.pop()]
                w = i - stack[-1] - 1
                max_area = max(max_area, w * h)
            stack.append(i)

        return max_area
```

- **本质：** 找右侧第一个更小的高度，并结合左侧边界计算宽度，不只是找一个更小值。
- **注意：** 此写法保留相等高度，栈内高度非递减；弹出后左侧栈顶可能等高，最左侧的等高柱最终会覆盖完整宽度。
- **哨兵：** 左侧 `0` 防止计算宽度时栈为空，右侧 `0` 触发剩余正高度柱子的结算。
- **复杂度：** 时间 `O(n)`，空间 `O(n)`。

## 239. 滑动窗口最大值 · Monotonic Queue（单调队列）

双端队列存下标，对应数值从队首到队尾非递增。队尾移除更小值，队首移除过期下标，队首对应当前窗口最大值。

```python
from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        q = deque()
        res = []

        for i, num in enumerate(nums):
            while q and num > nums[q[-1]]:
                q.pop()

            q.append(i)

            if q[0] <= i - k:
                q.popleft()

            if i >= k - 1:
                res.append(nums[q[0]])

        return res
```

- **注意：** 当前窗口为 `[i - k + 1, i]`，下标 `<= i - k` 的元素已过期。
- **相等值：** 使用 `>` 会保留相等值；改成 `>=` 也正确，因为新元素值相同、过期更晚，可以替代旧元素。
- **复杂度：** 时间 `O(n)`，额外空间 `O(k)`，不计输出。

## 单调栈八种情况

以下统一从左向右遍历数组；栈存下标，单调性描述的是**栈底到栈顶对应的数值**。

- **找下一个：** 当前元素满足条件时，给被弹出的下标记录答案。
- **找上一个：** 先弹出不符合条件的元素，再用剩余栈顶回答当前下标。

| 查找目标 | 弹栈条件 | 记录答案的位置 | 栈内数值顺序 |
| --- | --- | --- | --- |
| 下一个严格更大 | `nums[i] > nums[stack[-1]]` | 弹栈时 | 非递增，允许相等 |
| 下一个更大或相等 | `nums[i] >= nums[stack[-1]]` | 弹栈时 | 严格递减 |
| 上一个严格更大 | `nums[i] >= nums[stack[-1]]` | 弹栈结束后 | 严格递减 |
| 上一个更大或相等 | `nums[i] > nums[stack[-1]]` | 弹栈结束后 | 非递增，允许相等 |
| 下一个严格更小 | `nums[i] < nums[stack[-1]]` | 弹栈时 | 非递减，允许相等 |
| 下一个更小或相等 | `nums[i] <= nums[stack[-1]]` | 弹栈时 | 严格递增 |
| 上一个严格更小 | `nums[i] <= nums[stack[-1]]` | 弹栈结束后 | 严格递增 |
| 上一个更小或相等 | `nums[i] < nums[stack[-1]]` | 弹栈结束后 | 非递减，允许相等 |

### 模板一：找下一个

以“下一个严格更大”为例，其余情况替换比较符号。

```python
stack = []
res = [-1] * len(nums)

for i in range(len(nums)):
    while stack and nums[i] > nums[stack[-1]]:
        idx = stack.pop()
        res[idx] = nums[i]
    stack.append(i)
```

### 模板二：找上一个

以“上一个严格更大”为例，先弹掉所有小于或等于当前值的元素。

```python
stack = []
res = [-1] * len(nums)

for i in range(len(nums)):
    while stack and nums[i] >= nums[stack[-1]]:
        stack.pop()
    res[i] = nums[stack[-1]] if stack else -1
    stack.append(i)
```

这里返回的是元素值；若要求下标或距离，应相应改为下标或下标差。

## 每日一句

**中文：** 从左向右遍历时，找“下一个”就在弹栈时回答旧元素，找“上一个”就在弹栈后用栈顶回答当前元素；找下一个严格更大或更小，以及上一个更大或更小等于时，弹栈条件都不带等号。

**English:** When scanning from left to right, answer “next” queries for popped elements during popping, and answer “previous” queries for the current element using the remaining stack top. Use strict pop comparisons for next strictly greater or smaller queries, and for previous greater-or-equal or smaller-or-equal queries.