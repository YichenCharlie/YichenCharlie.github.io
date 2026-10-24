---
title: "LeetCode Hot 100 · Day 16"
date: 2026-10-25
summary: "第 K 大元素、前 K 个高频元素、数据流中位数：小顶堆、元组比较与双堆平衡。"
draft: false
---

## 215. 数组中的第 K 个最大元素 · Min Heap（小顶堆）

维护大小不超过 `k` 的小顶堆，超过时弹出最小值，最终堆中保留最大的 `k` 个元素，堆顶就是第 `k` 大。

```python
import heapq

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        pq = []

        for num in nums:
            heapq.heappush(pq, num)
            if len(pq) > k:
                heapq.heappop(pq)

        return pq[0]
```

- **注意：** 第 `k` 大按排序位置计算，重复值也计入。
- **复杂度：** 时间 `O(n log(k + 1))`，空间 `O(k)`。

## 347. 前 K 个高频元素

先统计频率，再将 `(freq, num)` 放入大小不超过 `k` 的小顶堆，超过时淘汰频率最低的元素。

```python
import heapq

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        pq = []
        count = {}

        for num in nums:
            count[num] = count.get(num, 0) + 1

        for num, freq in count.items():
            heapq.heappush(pq, (freq, num))
            if len(pq) > k:
                heapq.heappop(pq)

        res = []
        for freq, num in pq:
            res.append(num)

        return res
```

- **纠错：** `enumerate(count)` 改为 `count.items()`，获取数字及其频率。
- **注意：** 堆列表并非整体有序，但本题允许任意顺序返回答案。
- **复杂度：** 平均时间 `O(n + u log(k + 1))`，空间 `O(u + k)`；`u` 为不同数字的数量。

## 295. 数据流的中位数 · 双堆

大顶堆保存较小的一半，小顶堆保存较大的一半；大顶堆的元素数量与小顶堆相同，或多一个。

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.max = []
        self.min = []

    def addNum(self, num: int) -> None:
        # 负数模拟大顶堆，先加入较小的一半
        heapq.heappush(self.max, -num)

        # 将较小一半的最大值移到较大的一半
        top = -heapq.heappop(self.max)
        heapq.heappush(self.min, top)

        # 保证大顶堆数量不少于小顶堆
        if len(self.min) > len(self.max):
            top = heapq.heappop(self.min)
            heapq.heappush(self.max, -top)

    def findMedian(self) -> float:
        if len(self.max) > len(self.min):
            return -self.max[0]
        return (-self.max[0] + self.min[0]) / 2.0
```

- **关键：** 左半部分的所有值不大于右半部分，且两堆数量差不超过 `1`。
- **复杂度：** 插入时间 `O(log n)`，查询中位数时间 `O(1)`，总空间 `O(n)`。

## 补充：元组在堆中如何比较？

### 频率相同时

`(freq, num)` 按 Lexicographical Comparison（字典序比较）：先比较 `freq`，相同则继续比较 `num`。

列表也支持字典序比较，前提是比较过程中涉及的元素支持相应比较；未实现大小比较的自定义对象，可能引发 `TypeError`。

可以加入唯一序号：

```python
(freq, index, item)
```

频率相同时，通过不同的 `index` 就能确定顺序，避免比较 `item`。

### 347 可以使用大顶堆吗？

可以，但需要改变处理方式：

- **大小为 k 的小顶堆：** 超过 `k` 个时弹出最低频率，最后保留答案。
- **包含全部元素的大顶堆：** 存入 `(-freq, num)`，再弹出 `k` 次，依次取出最高频率。

不能将第一种写法直接改成负频率，否则超过 `k` 个时会把最高频率的元素淘汰。

## 每日一句

**中文：** `heapq` 的常用接口默认维护小顶堆，可以用负数模拟大顶堆；根据题目判断堆顶应该用于“淘汰最差候选”还是“取出最佳答案”，再决定何时弹出。

**English:** The standard `heapq` operations maintain a min-heap, and negated values can simulate a max-heap. Decide whether the heap top should remove the worst candidate or provide the best answer, then choose when to pop.