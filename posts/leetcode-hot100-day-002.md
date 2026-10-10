---
title: "LeetCode Hot 100 · Day 2"
date: 2026-10-11
summary: "只出现一次的数字、多数元素：异或、哈希计数与投票法。"
draft: false
---

## 136. 只出现一次的数字

### 方法一：XOR（异或）

相同数字异或为 `0`，任何数字与 `0` 异或仍为自身。将所有数字异或，成对出现的数字会抵消。

```python
class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        res = 0
        for num in nums:
            res ^= num
        return res
```

- **前提：** 除一个数字出现一次外，其余数字均出现两次。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

### 方法二：Hash Map（哈希映射）计数

统计每个数字的出现次数，返回次数为 `1` 的数字。

```python
class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        count = {}
        for num in nums:
            count[num] = count.get(num, 0) + 1
        for num, freq in count.items():
            if freq == 1:
                return num
```

- **语法：** `count.get(num, 0)` 在键不存在时返回 `0`。
- **复杂度：** 平均时间 `O(n)`，空间 `O(n)`。
- **注意：** 此方法不满足题目要求的常量额外空间。

## 169. 多数元素

### 方法一：Boyer–Moore Voting（摩尔投票法）

相同数字加一票，不同数字减一票；票数归零时更换候选值。多数元素出现超过一半，抵消后最终留下的候选值就是它。

```python
class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        count = 0
        target = 0
        for num in nums:
            if count == 0:
                target = num
            if num == target:
                count += 1
            else:
                count -= 1
        return target
```

- **纠错：** 第二个判断使用 `if`，不能用 `elif`，否则选定候选值时会漏计当前这一票。
- **前提：** 题目保证多数元素存在；若无此保证，还需验证候选值的出现次数。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

### 方法二：Hash Map 计数

统计出现次数，返回次数超过数组长度一半的数字。

```python
class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        count = {}
        for num in nums:
            count[num] = count.get(num, 0) + 1
        for num, freq in count.items():
            if freq > len(nums) // 2:
                return num
```

- **注意：** 多数元素要求出现次数严格超过一半。
- **复杂度：** 平均时间 `O(n)`，空间 `O(n)`。