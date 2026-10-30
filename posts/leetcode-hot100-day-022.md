---
title: "LeetCode Hot 100 · Day 22"
date: 2026-10-31
summary: "图遍历入门：DFS 统计岛屿、多源 BFS 模拟腐烂，以及有向图判环。"
draft: false
---

## 200. 岛屿数量 · DFS（深度优先搜索）

给定由 `"1"`（陆地）和 `"0"`（水）组成的网格，统计岛屿数量。陆地只通过上下左右相连。

每发现一块未访问的陆地，岛屿数加一，再通过 DFS 将整座岛标记为水。

```python
class Solution:
    def numIslands(self, grid):
        if not grid or not grid[0]:
            return 0

        m, n = len(grid), len(grid[0])
        res = 0

        for i in range(m):
            for j in range(n):
                if grid[i][j] == "1":
                    res += 1
                    self.dfs(grid, i, j)

        return res

    def dfs(self, grid, i, j):
        m, n = len(grid), len(grid[0])

        if i < 0 or j < 0 or i >= m or j >= n:
            return
        if grid[i][j] == "0":
            return

        # 先标记，再访问邻居，避免重复访问
        grid[i][j] = "0"

        self.dfs(grid, i + 1, j)
        self.dfs(grid, i - 1, j)
        self.dfs(grid, i, j + 1)
        self.dfs(grid, i, j - 1)
```

- 直接修改原网格，充当访问标记，不需要额外的 visited 数组。
- 时间 O(MN)，递归栈最坏 O(MN)。

## 994. 腐烂的橘子 · Multi-source BFS（多源广度优先搜索）

每分钟，腐烂橘子会使上下左右相邻的新鲜橘子腐烂。求所有橘子腐烂的最少分钟数；无法全部腐烂则返回 -1。

所有初始腐烂橘子同时入队，每轮处理一层，模拟同时向外扩散。

```python
from collections import deque


class Solution:
    def orangesRotting(self, grid):
        m, n = len(grid), len(grid[0])
        q = deque()

        for i in range(m):
            for j in range(n):
                if grid[i][j] == 2:
                    q.append((i, j))

        dirs = [(-1, 0), (1, 0), (0, 1), (0, -1)]
        step = 0

        while q:
            sz = len(q)

            for _ in range(sz):
                curr = q.popleft()

                for dx, dy in dirs:
                    x, y = curr[0] + dx, curr[1] + dy

                    if 0 <= x < m and 0 <= y < n and grid[x][y] == 1:
                        # 入队时立刻标记，避免被多个邻居重复加入
                        grid[x][y] = 2
                        q.append((x, y))

            step += 1

        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    return -1

        return step - 1 if step else 0
```

- 只能感染值为 `1` 的格子，不能把空格和已腐烂橘子重复入队。
- 保留你的计时方式：初始腐烂橘子属于第 0 层，因此处理层数减一才是分钟数。
- 时间 O(MN)，空间 O(MN)。

## 207. 课程表 · Directed Cycle Detection（有向图判环）

给定课程及其先修关系，判断能否完成全部课程。有向图存在环，就无法完成。

`visited` 表示节点是否访问过，`onpath` 表示节点是否位于当前递归路径上。

```python
class Solution:
    def canFinish(self, numCourses, prerequisites):
        graph = self.build(numCourses, prerequisites)

        self.visited = [False] * numCourses
        self.onpath = [False] * numCourses
        self.circle = False

        for i in range(numCourses):
            self.traverse(graph, i)
            if self.circle:
                return False

        return True

    def traverse(self, graph, num):
        # 再次遇到当前路径上的节点，说明存在环
        if self.onpath[num]:
            self.circle = True

        if self.circle or self.visited[num]:
            return

        self.visited[num] = True
        self.onpath[num] = True

        for s in graph[num]:
            self.traverse(graph, s)

        # 离开当前递归路径，但保留 visited 标记
        self.onpath[num] = False

    def build(self, num, pre):
        graph = [[] for _ in range(num)]

        for edge in pre:
            from_ = edge[1]
            to_ = edge[0]
            graph[from_].append(to_)

        return graph
```

- 必须先检查 `onpath`，再判断 `visited`，否则会漏掉环。访问过的节点不一定在当前路径上。
- 原来的反向建边也能判环，因为所有边反向不会改变是否存在环；这里调整的是边的表达含义。
- 时间 O(V + E)，空间 O(V + E)，V 为课程数，E 为先修关系数。

## 每日一句

**中文：** DFS 侧重沿路径深入，可用于统计连通块（如岛屿）和有向图判环；BFS 逐层向外扩展，在每步代价相同时可求最短步数或最少时间（如橘子腐烂）。连通块统计两者都能做，关键是及时标记，避免重复访问。

**English:** DFS explores deeply along a path and can count connected components or detect directed cycles. BFS expands level by level and finds the fewest steps or minimum time when every step has the same cost. Both can count connected components; mark nodes when discovered to avoid repeated visits.