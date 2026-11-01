---
title: "LeetCode Hot 100 · Day 24"
date: 2026-11-02
summary: "回溯进阶：括号生成、单词搜索、分割回文串与 N 皇后。"
draft: false
---

## 22. 括号生成 · Backtracking（回溯）

给定 n 对括号，生成所有合法的括号组合。

left、right 分别表示剩余可用的左右括号数量，每次选择一个括号，交给下一层继续处理。

```python
class Solution:
    def generateParenthesis(self, n):
        self.res = []
        self.track = ""

        self.backtrack(n, n)
        return self.res

    def backtrack(self, left, right):
        if left > right:
            return
        if left < 0 or right < 0:
            return

        if left == 0 and right == 0:
            self.res.append(self.track)
            return

        self.track += "("
        self.backtrack(left - 1, right)
        self.track = self.track[:-1]

        self.track += ")"
        self.backtrack(left, right - 1)
        self.track = self.track[:-1]
```

- 原回溯逻辑正确，修正入口方法内部的缩进。
- `left > right` 表示已使用的右括号比左括号多，当前前缀不合法。
- 字符串不可变，可以直接保存 `self.track`；列表路径则需要复制。

## 79. 单词搜索 · DFS（深度优先搜索）与回溯

判断能否通过网格中上下左右相邻的格子拼出 word，同一条路径不能重复使用同一个格子。

start 表示接下来要匹配的字符下标。匹配一个字符后，将 start 加一。

```python
class Solution:
    def exist(self, board, word):
        self.find = False
        m, n = len(board), len(board[0])

        for i in range(m):
            for j in range(n):
                self.dfs(board, i, j, word, 0)
                if self.find:
                    return True

        return False

    def dfs(self, board, i, j, word, start):
        if self.find:
            return

        # 所有字符已经匹配，不需要再访问下一个格子
        if start == len(word):
            self.find = True
            return

        m, n = len(board), len(board[0])
        if i < 0 or j < 0 or i >= m or j >= n:
            return

        if board[i][j] != word[start]:
            return

        tmp = board[i][j]
        board[i][j] = "#"

        self.dfs(board, i + 1, j, word, start + 1)
        self.dfs(board, i - 1, j, word, start + 1)
        self.dfs(board, i, j + 1, word, start + 1)
        self.dfs(board, i, j - 1, word, start + 1)

        board[i][j] = tmp
```

- 完成判断移到越界判断之前：最后一个字符匹配后，下一次调用只是确认完成，不应要求还有一个有效的相邻格子。
- `"#"` 表示当前路径已经使用该格子；返回时恢复，供其他路径尝试。
- 找到答案后，尚未退出的调用仍会执行恢复操作，最终保留原网格。

## 131. 分割回文串 · Backtracking（回溯）

将字符串分割为若干回文子串，返回所有分割方案。

start 是当前未处理部分的起点，枚举终点 i；若这一段是回文，就切下它，再处理剩余部分。

```python
class Solution:
    def partition(self, s):
        self.track = []
        self.res = []

        self.backtrack(s, 0)
        return self.res

    def backtrack(self, s, start):
        if start == len(s):
            self.res.append(list(self.track))
            return

        for i in range(start, len(s)):
            if not self.ishuiwen(s, start, i):
                continue

            self.track.append(s[start:i + 1])
            self.backtrack(s, i + 1)
            self.track.pop()

    def ishuiwen(self, s, lo, hi):
        while lo < hi:
            if s[lo] != s[hi]:
                return False

            lo += 1
            hi -= 1

        return True
```

- 当前切下的是闭区间 `[start, i]`，下一段从 `i + 1` 开始。
- `start == len(s)` 表示整个字符串恰好分割完，保存路径副本。

## 51. N 皇后 · Backtracking（回溯）

在 N × N 棋盘中放置 N 个皇后，使任意两个皇后不在同一行、同一列或同一斜线上，返回所有方案。

每层固定一行，枚举该行的列；放好一个皇后后，递归处理下一行。

```python
class Solution:
    def solveNQueens(self, n):
        self.res = []
        self.board = ["." * n for _ in range(n)]

        self.backtrack(self.board, 0)
        return self.res

    def backtrack(self, board, row):
        n = len(board)

        if row == n:
            self.res.append(list(board))
            return

        for col in range(n):
            if not self.isvalid(board, row, col):
                continue

            board[row] = board[row][:col] + "Q" + board[row][col + 1:]
            self.backtrack(board, row + 1)
            board[row] = board[row][:col] + "." + board[row][col + 1:]

    def isvalid(self, board, row, col):
        n = len(board)

        # 检查同一列的上方
        for i in range(row):
            if board[i][col] == "Q":
                return False

        # 检查右上方
        for i, j in zip(range(row - 1, -1, -1), range(col + 1, n)):
            if board[i][j] == "Q":
                return False

        # 检查左上方
        for i, j in zip(range(row - 1, -1, -1), range(col - 1, -1, -1)):
            if board[i][j] == "Q":
                return False

        return True
```

- 删除不需要的 `col` 参数，因为列由当前层循环决定。
- 检查同列时使用 `board[i][col]`，检查斜线时使用 `board[i][j]`；原来一直检查 `board[row][col]`，没有检查到其他皇后。
- 每行只放一个皇后，因此不需要检查同行；后面的行还没放，因此只检查上方。
- 每行是不可变字符串，保存棋盘时 `list(board)` 即可。

## 每日一句

**中文：** 回溯像一把“刀”：每次确定一部分，把剩余问题交给下一层。括号生成消耗剩余数量，单词搜索匹配一字后推进 start，回文分割切下 `[start, i]` 后从 `i + 1` 继续，N 皇后固定一行后处理 `row + 1`。不合法就剪枝，完成就收集答案，返回时撤销选择。

**English:** Backtracking works like making a cut: settle one part and pass the remaining problem to the next recursive call. Consume a bracket, match the next character, cut off a palindromic substring, or place a queen in the current row. Prune invalid choices, record completed solutions, and undo each choice when returning.