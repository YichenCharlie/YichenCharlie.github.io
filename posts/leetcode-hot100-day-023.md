---
title: "LeetCode Hot 100 · Day 23"
date: 2026-11-01
summary: "回溯入门：子集、全排列、电话号码组合与组合总和。"
draft: false
---

## 78. 子集 · Backtracking（回溯）

给定元素互不相同的整数数组，返回所有不重复的子集，包括空集。

每个递归节点都是一个子集；通过 start 保证只向后选择。

```python
class Solution:
    def subsets(self, nums):
        self.track = []
        self.res = []

        self.backtrack(nums, 0)
        return self.res

    def backtrack(self, nums, start):
        self.res.append(list(self.track))

        for i in range(start, len(nums)):
            self.track.append(nums[i])

            self.backtrack(nums, i + 1)

            self.track.pop()
```

- 递归传 `i + 1`，当前元素不能再次选择，也避免重复组合。
- 保存答案必须复制路径，否则后续修改会影响已保存的结果。
- 时间 O(N × 2^N)，辅助空间 O(N)，不计结果。

## 46. 全排列 · Backtracking（回溯）

给定元素互不相同的整数数组，返回所有排列，每个元素在一个排列中使用一次。

每层都遍历全部元素，通过 visited 判断当前路径已经使用了哪些元素。

```python
class Solution:
    def permute(self, nums):
        self.res = []
        self.track = []
        self.visited = [False] * len(nums)

        self.backtrack(nums)
        return self.res

    def backtrack(self, nums):
        if len(self.track) == len(nums):
            self.res.append(list(self.track))
            return

        for i in range(len(nums)):
            if self.visited[i]:
                continue

            self.track.append(nums[i])
            self.visited[i] = True

            self.backtrack(nums)

            self.visited[i] = False
            self.track.pop()
```

- 排列需要考虑不同顺序，所以每层从 0 开始，不需要 `start`。
- 时间 O(N × N!)，辅助空间 O(N)，不计结果。

## 17. 电话号码的字母组合 · Backtracking（回溯）

给定由数字 2–9 组成的字符串，返回对应的所有字母组合；空字符串返回空列表。

每层处理一位数字，从它对应的字母中选择一个。

```python
class Solution:
    def letterCombinations(self, digits):
        self.res = []
        self.track = []

        if not digits:
            return []

        self.mapping = [
            "", "", "abc", "def", "ghi",
            "jkl", "mno", "pqrs", "tuv", "wxyz"
        ]

        self.backtrack(digits, 0)
        return self.res

    def backtrack(self, digits, start):
        if start == len(digits):
            self.res.append("".join(self.track))
            return

        for char in self.mapping[int(digits[start])]:
            self.track.append(char)

            self.backtrack(digits, start + 1)

            self.track.pop()
```

- 统一使用 `digits`；空字符串用 `if not digits` 判断。
- 保存答案后必须 `return`，否则继续访问 `digits[start]` 会越界。
- 长度为 N：最坏时间 O(N × 4^N)，辅助空间 O(N)，不计结果。

## 39. 组合总和 · Backtracking（回溯）

给定互不相同的正整数 candidates 和目标值 target，返回所有和为 target 的不同组合。每个数字可以重复使用。

通过 start 避免重复组合；选中第 i 个数字后，下一层仍从 i 开始，允许再次使用。

```python
class Solution:
    def combinationSum(self, candidates, target):
        self.res = []
        self.track = []
        self.target = target

        self.backtrack(candidates, 0, 0)
        return self.res

    def backtrack(self, candidates, start, total):
        if total == self.target:
            self.res.append(list(self.track))
            return

        if total > self.target:
            return

        for i in range(start, len(candidates)):
            total += candidates[i]
            self.track.append(candidates[i])

            self.backtrack(candidates, i, total)

            total -= candidates[i]
            self.track.pop()
```

- `res`、`track` 应初始化为列表 `[]`，不是数字 `0`。
- 原来的循环没有使用 `start`，会把同一组合的不同顺序重复计入。
- 所有候选数都是正数，所以超过目标后可以直接返回。
- 设 N 为候选数个数、D = target // min(candidates)：时间为指数级，宽松上界 O(N^(D+1) × (D+1))；辅助空间 O(D+1)，不计结果。

## 回溯要点

| 题目 | 每层选择范围 | 下一层参数 | 记录答案的时机 |
|---|---|---|---|
| 子集 | 从 start 开始 | i + 1 | 每次进入递归 |
| 全排列 | 全部未使用元素 | 无 start，用 visited | 路径长度等于数组长度 |
| 电话号码组合 | 当前数字对应的字母 | start + 1 | 所有数字处理完 |
| 组合总和 | 从 start 开始 | i，允许重复使用 | 路径和等于目标 |

统一步骤：**做选择 → 递归 → 撤销选择。**

## 每日一句

**中文：** 组合不区分顺序，用 start 限制选择范围，避免同一组合以不同顺序重复出现；排列区分顺序，每层遍历全部候选，不能重复使用时用 visited 标记。对于使用 start 的模板，允许重复使用当前元素就递归传 i，不允许则传 i + 1。

**English:** Combinations ignore order, so use start to avoid generating the same combination in different orders. Permutations distinguish order, so consider all candidates at each level and use visited when reuse is forbidden. In a start-based template, recurse with i to allow reuse of the current element, or i + 1 to prevent it.
