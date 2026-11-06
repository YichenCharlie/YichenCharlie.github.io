---
title: "LeetCode Hot 100 · Day 29"
date: 2026-11-06
summary: "网格 DP：数路径与求最小路径和；括号 DP：配对后拼接左侧有效段。"
draft: false
---

## 62. 不同路径 · Unique Paths

从网格左上角走到右下角，每步只能向右或向下，求不同路径的数量。

**状态：** `dp[i][j]` 表示到达 `(i, j)` 的路径数。最后一步要么从上方来，要么从左方来，两类路径数相加。第一行和第一列都只有一种走法。

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[0] * n for _ in range(m)]

        for i in range(m):
            dp[i][0] = 1
        for j in range(n):
            dp[0][j] = 1

        for i in range(1, m):
            for j in range(1, n):
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]

        return dp[m - 1][n - 1]
```

## 64. 最小路径和 · Minimum Path Sum

从网格左上角走到右下角，每步只能向右或向下，求沿途数字之和的最小值。

**状态：** `dp[i][j]` 表示到达 `(i, j)` 的最小路径和，包含当前格子的值。和 62 一样，当前格子只能从上方或左方到达；这题取两者中较小的路径和，再加上当前格子的值。

```python
class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dp = [[0] * n for _ in range(m)]
        dp[0][0] = grid[0][0]

        for i in range(1, m):
            dp[i][0] = dp[i - 1][0] + grid[i][0]
        for j in range(1, n):
            dp[0][j] = dp[0][j - 1] + grid[0][j]

        for i in range(1, m):
            for j in range(1, n):
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]

        return dp[m - 1][n - 1]
```


## 32. 最长有效括号 · Longest Valid Parentheses

求字符串中最长连续有效括号子串的长度。

**状态：** `dp[i]` 表示**必须以 `s[i]` 结尾**的最长有效括号子串长度。左括号不能作为有效子串的结尾，所以只处理右括号。

```python
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        n = len(s)
        if n == 0:
            return 0

        dp = [0] * n

        for i in range(1, n):
            if s[i] == "(":
                continue

            inner = dp[i - 1]
            j = i - inner - 1  # 跳过中间的有效段，找可能配对的左括号

            if j >= 0 and s[j] == "(":
                dp[i] = inner + 2
                if j > 0:
                    dp[i] += dp[j - 1]  # 接上这个左括号之前的有效段

        return max(dp)
```

- `j = i - inner - 1` 已经算好了配对位置，因此检查的是 `s[j]`。`dp[j - 1]` 配对成功后，它才表示能接到左边的有效段长度。