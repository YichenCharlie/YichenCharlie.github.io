---
title: "LeetCode Hot 100 · Day 1"
date: 2026-10-10
summary: "哈希表：两数之和、字母异位词分组、最长连续序列。"
draft: false
---

## 1. 两数之和 · Hash Map（哈希映射）

用字典记录「数字 → 下标」，遍历时查找 `target - num`。

```python
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        valtoindex = {}
        for i, num in enumerate(nums):
            need = target - num
            if need in valtoindex:
                return [valtoindex[need], i]
            valtoindex[num] = i
        return []
```

- **纠错：** 存入的是 `valtoindex[num] = i`，不是 `valtoindex[need] = i`。
- **注意：** 先查找再存入，避免重复使用当前元素。
- **复杂度：** 平均时间 `O(n)`，空间 `O(n)`。

## 49. 字母异位词分组 · Hash Map

将字符串排序作为分组键，例如 `"eat"` 和 `"tea"` 都得到 `"aet"`。

```python
class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        codetogroup = {}
        for s in strs:
            code = "".join(sorted(s))
            if code not in codetogroup:
                codetogroup[code] = []
            codetogroup[code].append(s)
        return list(codetogroup.values())
```

- **语法：** `sorted(s)` 返回字符列表，`"".join(...)` 将其拼接为字符串。
- **复杂度：** 时间 `O(nk log k)`，空间 `O(nk)`；`n` 为字符串数量，`k` 为最大字符串长度。

## 128. 最长连续序列 · Hash Set（哈希集合）

用集合去重，只从没有前驱 `num - 1` 的数字开始，向后统计连续长度。

```python
class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        longest = 0
        nums_set = set(nums)
        for num in nums_set:
            if num - 1 not in nums_set:
                curr = num
                length = 1
                while curr + 1 in nums_set:
                    curr += 1
                    length += 1
                longest = max(longest, length)
        return longest
```

- **纠错：** `while` 应检查不断更新的 `curr + 1`，否则可能无限循环。
- **注意：** 连续指数字连续，不要求在原数组中相邻。只从起点查找，避免重复扫描。
- **复杂度：** 平均时间 `O(n)`，空间 `O(n)`。