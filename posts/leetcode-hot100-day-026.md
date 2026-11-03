---
title: "LeetCode Hot 100 · Day 26"
date: 2026-11-03
summary: "自底向上动态规划：定义状态、确定初始值、选择遍历顺序与返回值。"
draft: false
---

## 70. 爬楼梯 · Climbing Stairs

每次可以爬 1 或 2 阶，求恰好爬到第 n 阶的方案数。

**状态：** `dp[i]` 是到达第 `i` 阶的方案数。最后一步只能来自第 `i - 1` 阶或第 `i - 2` 阶，两类方案相加。

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n

        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2

        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]

        return dp[n]
```

下标直接表示台阶数，所以数组开 `n + 1` 个位置，答案取 `dp[n]`。原代码正确，只把建表移到了特判之后。

## 118. 杨辉三角 · Pascal's Triangle

生成杨辉三角的前 `numRows` 行。每行两端都是 1，中间每个数等于上一行相邻两个数之和。

```python
class Solution:
    def generate(self, numRows: int) -> list[list[int]]:
        dp = []

        for i in range(numRows):
            row = [1] * (i + 1)
            for j in range(1, i):
                row[j] = dp[i - 1][j - 1] + dp[i - 1][j]
            dp.append(row)

        return dp
```

`range(1, i)` 只更新中间位置；前两行没有中间位置，循环自然跳过，不需要特判。题目要所有行，所以返回整张表 `dp`。

## 198. 打家劫舍 · House Robber

不能偷相邻的两间房屋，求可以偷到的最大金额。

**状态：** `dp[i]` 是考虑第 `0` 到第 `i` 间房后能获得的最大金额，**不要求偷第 `i` 间**。偷它，就取 `dp[i - 2] + nums[i]`；不偷，就保留 `dp[i - 1]`。

```python
class Solution:
    def rob(self, nums: list[int]) -> int:
        n = len(nums)
        if n == 1:
            return nums[0]

        dp = [0] * n
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])

        for i in range(2, n):
            dp[i] = max(dp[i - 2] + nums[i], dp[i - 1])

        return dp[n - 1]
```

按这套初始化方式，只有一间房时要提前返回，否则会访问不存在的 `nums[1]`。最后一项已经考虑了所有房屋，所以返回 `dp[n - 1]`。

## 53. 最大子数组和 · Maximum Subarray

在非空整数数组中，求连续非空子数组的最大和。

**状态：** `dp[i]` 是**必须以 `nums[i]` 结尾**的最大子数组和。要么接在前一段后面，要么从当前元素重新开始。

```python
class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [0] * n
        dp[0] = nums[0]

        for i in range(1, n):
            dp[i] = max(dp[i - 1] + nums[i], nums[i])

        return max(dp)
```

你的 `n == 1` 特判正确，但可以省略：只有一个元素时，循环不会执行，`max(dp)` 就是 `nums[0]`。和 198 不同，**最优子数组可能在中途结束**，所以要比较所有结尾，返回 `max(dp)`。

## 每日一句

基础dp，看是否是最值问题，然后先构造dp，看构造[0][1]还是[-1]，然后先定义基础case， dp[0]，dp[1]的状态，然后看特殊，比如说当数组小于2或者1的时候要有个特判答案，然后开始遍历，自底向上，写状态转换方程，做选择，然后想一下要的结果是最后dp里的最值还是最后一位还是什么