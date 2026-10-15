---
title: "LeetCode Hot 100 · Day 7"
date: 2026-10-15
summary: "除自身以外数组的乘积、和为 K 的子数组、接雨水：前后缀、哈希计数与双指针。"
draft: false
---

## 238. 除自身以外数组的乘积 · 前后缀积

分别计算每个位置左侧和右侧的乘积，相乘即可排除当前元素，无需除法。

```python
class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        pre = [1] * (n + 1)
        suffix = [1] * (n + 1)
        res = []

        for i in range(n):
            pre[i + 1] = pre[i] * nums[i]

        for i in range(n - 1, -1, -1):
            suffix[i] = suffix[i + 1] * nums[i]

        for i in range(n):
            res.append(pre[i] * suffix[i + 1])

        return res
```

- **含义：** `pre[i]` 是下标 `i` 之前的乘积；`suffix[i + 1]` 是下标 `i` 之后的乘积。
- **纠错：** 后缀从 `n - 1` 遍历到 `0`，使用 `suffix[i + 1]` 计算 `suffix[i]`；不能遍历到 `-1`。
- **复杂度：** 时间 `O(n)`，额外空间 `O(n)`，不计输出。

## 560. 和为 K 的子数组 · Prefix Sum（前缀和）与 Hash Map（哈希映射）

若两个前缀和之差为 `k`，它们之间的连续子数组之和就是 `k`。用字典记录之前各个前缀和的出现次数。

```python
class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        count = {0: 1}
        n = len(nums)
        pre = [0] * (n + 1)
        res = 0

        for i in range(n):
            pre[i + 1] = pre[i] + nums[i]

        for i in range(1, len(pre)):
            val = pre[i] - k
            if val in count:
                res += count[val]
            count[pre[i]] = count.get(pre[i], 0) + 1

        return res
```

- **纠错：** 补上 `res = 0`；`if` 与 `count` 更新的缩进应与 `val` 一致。
- **注意：** `{0: 1}` 表示空前缀，使从下标 `0` 开始的子数组也能被统计。
- **顺序：** 先查找，再记录当前前缀和，避免在 `k = 0` 时统计空子数组。
- **复杂度：** 平均时间 `O(n)`，空间 `O(n)`。

## 42. 接雨水 · Two Pointers（双指针）

维护左右两侧已扫描到的最大高度，每次处理最大高度较小的一侧，该侧的最大高度决定当前位置的接水量。

![接雨水示意图：五根柱子中，第 3 根上方的水位由左右最高柱中较矮的一根决定。](images/day-007/trapping-rain-water.svg)

按手绘图整理：用示意高度 `[2, 4, 2, 3, 1]` 说明，第 3 根柱子（数组下标 `2`）左侧最高为 `4`，右侧最高为 `3`，所以水位只能到 `3`，接水量为 `min(4, 3) - 2 = 1`。蓝色部分就是这格能接到的水。

> 图中的 1–5 表示第几根柱子，不是数组下标。一般位置的水量为 `min(左侧最高, 右侧最高) - 当前高度`；双指针利用较小一侧的已知最大高度，逐步确定每一格水量。

```python
class Solution:
    def trap(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        l_max, r_max = 0, 0
        res = 0

        while left < right:
            l_max = max(l_max, height[left])
            r_max = max(r_max, height[right])

            if r_max < l_max:
                res += r_max - height[right]
                right -= 1
            else:
                res += l_max - height[left]
                left += 1

        return res
```

- **纠错：** `r_max < l_max` 时计算右侧并移动 `right`；否则计算左侧并移动 `left`。
- **公式：** 当前接水量 = 该侧最大高度 − 当前柱子高度。
- **注意：** 先更新最大高度，再计算接水量，结果不会为负。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。
