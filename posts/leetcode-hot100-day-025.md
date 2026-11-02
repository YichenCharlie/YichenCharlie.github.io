---
title: "LeetCode Hot 100 · Day 25"
date: 2026-11-02
summary: "贪心入门：股票收益、跳跃游戏、划分字母区间与合并区间。"
draft: false
---

## 121. 买卖股票的最佳时机 · Greedy（贪心）

最多进行一次买入和一次卖出，买入必须早于卖出，求最大利润；无法获利则返回 0。

遍历每天的价格，维护此前最低买入价和目前最大利润。

```python
class Solution:
    def maxProfit(self, prices):
        minbuy = float("inf")
        max_price = 0

        for price in prices:
            minbuy = min(minbuy, price)
            max_price = max(max_price, price - minbuy)

        return max_price
```

- 先更新最低价再计算利润，即使使用当天价格，也只会得到 0，不会产生非法正利润。
- 时间 O(N)，空间 O(1)。

## 55. 跳跃游戏 · Greedy（贪心）

数组元素表示从当前位置最多可以向前跳多少步，判断能否从下标 0 到达最后一个下标。

维护目前最远可达位置；若在终点之前无法继续向前，就返回 False。

```python
class Solution:
    def canJump(self, nums):
        farthest = 0
        n = len(nums)

        for i in range(n - 1):
            farthest = max(farthest, i + nums[i])

            if farthest <= i:
                return False

            if farthest >= n - 1:
                return True

        return True
```

- 当前写法中，之前没有返回 False，就保证当前位置可达。
- 只遍历到倒数第二个位置；到达终点后不需要继续跳。
- 时间 O(N)，空间 O(1)。

## 45. 跳跃游戏 II · Greedy（贪心）

在保证能够到达终点的前提下，求到达最后一个下标所需的最少跳跃次数。

curr 表示当前跳跃次数能覆盖的右边界，nxt 表示扫描过程中发现的下一次跳跃最远边界。

```python
class Solution:
    def jump(self, nums):
        res = 0
        n = len(nums)
        curr = 0
        nxt = 0

        if n <= 1:
            return 0

        for i in range(n - 1):
            nxt = max(nxt, i + nums[i])

            if i == curr:
                res += 1
                curr = nxt

                if curr >= n - 1:
                    break

        return res
```

- 扫描完当前覆盖范围，才增加一次跳跃，并扩展到下一层范围。
- `curr` 是覆盖边界，不是必须实际落脚的位置。
- `n < 1` 改为 `n <= 1`；`curr > n - 1` 改为 `>=`，都属于提前结束优化，原写法在题目约束下也能得到正确答案。
- 时间 O(N)，空间 O(1)。

## 763. 划分字母区间 · Greedy（贪心）

将字符串划分为尽可能多的片段，使每个字母最多出现在一个片段中，返回各片段长度。

先记录每个字符最后出现的位置，再不断扩展当前片段的右边界。

```python
class Solution:
    def partitionLabels(self, s):
        start = 0
        end = 0
        last_pos = {}
        res = []

        for i, char in enumerate(s):
            last_pos[char] = i

        for i, char in enumerate(s):
            end = max(end, last_pos[char])

            if end == i:
                res.append(end - start + 1)
                start = i + 1

        return res
```

- `end` 必须覆盖当前片段中所有字符的最后出现位置。
- 当 `i == end`，当前片段内的字符都不会再出现在后面，可以立即切分。
- 时间 O(N)；题目只有 26 个小写字母，辅助空间 O(1)，不计结果。

## 56. 合并区间 · Sorting + Greedy（排序与贪心）

合并所有重叠区间，返回互不重叠且覆盖原输入的区间。端点相接也需要合并。

先按左端点排序，再将当前区间与结果中的最后一个区间比较。

```python
class Solution:
    def merge(self, intervals):
        if not intervals:
            return []

        intervals.sort(key=lambda x: x[0])
        res = [intervals[0]]

        for i in range(1, len(intervals)):
            curr = intervals[i]
            last = res[-1]

            if last[1] >= curr[0]:
                last[1] = max(last[1], curr[1])
            else:
                res.append(curr)

        return res
```

- 关键修正：`curr[1] = ...` 改为 `last[1] = ...`。合并后的区间要保留在结果中，所以更新 `res[-1]` 指向的列表。
- 这份写法会修改输入数组的顺序，并可能修改其中的区间端点。
- 时间 O(N log N)，Python 排序最坏辅助空间 O(N)，不计结果。