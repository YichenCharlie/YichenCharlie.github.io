---
title: "LeetCode Hot 100 · Day 6"
date: 2026-10-15
summary: "滑动窗口三问：何时扩大、何时缩小、何时更新答案。"
draft: false
---

## Sliding Window（滑动窗口）三问

1. 什么时候扩大窗口？加入元素后更新什么数据？
2. 什么时候缩小窗口？移除元素后更新什么数据？
3. 什么时候更新答案？

统一使用左闭右开窗口 `[slow, fast)`，长度为 `fast - slow`。

## 3. 无重复字符的最长子串

右侧逐个加入字符，发现重复就从左侧缩小窗口，直到无重复，再更新最大长度。

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        slow, fast = 0, 0
        window = {}
        res = 0

        while fast < len(s):
            c = s[fast]
            fast += 1
            # 加入后，更新每个字符的计数
            window[c] = window.get(c, 0) + 1

            # 如果发现字符重复，就缩小窗口
            while window[c] > 1:
                d = s[slow]
                slow += 1
                # 缩小窗口，减去被移除字符的计数
                window[d] -= 1

            res = max(res, fast - slow)

        return res
```

- **纠错：** 初始化 `fast`，不是 `start`；计数使用 `window.get(c, 0)`。
- **复杂度：** 平均时间 `O(n)`，空间 `O(k)`；`k` 为字符串中不同字符的数量。

## 438. 找到字符串中所有字母异位词

维护长度为 `len(p)` 的窗口，比较窗口与目标的字符计数，相同就记录起始下标。

```python
class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        slow, fast = 0, 0
        window = {}
        target = {}
        res = []

        for i in p:
            target[i] = target.get(i, 0) + 1

        while fast < len(s):
            c = s[fast]
            fast += 1
            # 公式起手，先记录窗口内的字符计数
            window[c] = window.get(c, 0) + 1

            # 如果窗口长度超过目标，就必须开始缩小窗口
            while fast - slow > len(p):
                d = s[slow]
                slow += 1
                window[d] -= 1

                # 某项减到 0 就删除，否则多余的零值键
                # 会影响 target == window 的判断
                if window[d] == 0:
                    del window[d]

            if target == window:
                res.append(slow)

        return res
```

- **纠错：** 初始化 `fast`；`target == slow` 改为 `target == window`。
- **复杂度：** 本题仅含小写英文字母，时间 `O(n + m)`，额外空间 `O(1)`，不计输出。

## 76. 最小覆盖子串

扩大窗口直到覆盖 `t` 的全部字符及次数，再不断缩小窗口，并在移除字符前更新最短答案。

```python
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t:
            return ""

        # 老思路，公式起手
        slow, fast = 0, 0
        window = {}
        target = {}

        # 找最小，要先定义“最大”
        length = float("inf")
        # 记录已满足目标次数的字符种类数
        valid = 0
        # 保存最优窗口起点，用来切片输出最终结果
        start = 0

        for i in t:
            target[i] = target.get(i, 0) + 1

        while fast < len(s):
            c = s[fast]
            fast += 1

            # 只统计目标字符
            if c in target:
                window[c] = window.get(c, 0) + 1
                if window[c] == target[c]:
                    valid += 1

            # 所有目标字符均满足次数要求，就开始缩小窗口
            while valid == len(target):
                if fast - slow < length:
                    start = slow
                    length = fast - slow

                d = s[slow]
                slow += 1

                if d in target:
                    # 当前次数刚好达标，移除后就不再满足
                    if window[d] == target[d]:
                        valid -= 1
                    # 先比较，再减少 window[d]
                    window[d] -= 1

        # 扫描完整个字符串后，再返回最终结果
        if length == float("inf"):
            return ""
        return s[start:start + length]
```

- **纠错：** `lenght` 改为 `length`；判断使用 `==`；最终 `return` 放在外层循环之外。
- **注意：** `valid` 统计满足要求的字符种类数，不是字符总数。移除前若次数超过目标，移除一个后仍然达标，不减少 `valid`。
- **复杂度：** 平均时间 `O(n + m)`，空间 `O(k)`；`k` 为 `t` 中不同字符的数量。

### 计数放在 `if` 内外的区别

```python
# 写法一：所有字符都计数，只有目标字符影响 valid
window[c] = window.get(c, 0) + 1
if c in target:
    if window[c] == target[c]:
        valid += 1
```

```python
# 写法二：只统计目标字符
if c in target:
    window[c] = window.get(c, 0) + 1
    if window[c] == target[c]:
        valid += 1
```

两种写法都能正确求解本题，第二种只保留必要数据。

如果采用第一种，但缩小窗口时仍只减少目标字符的计数，无关字符的计数就不再代表当前窗口的真实数量。不过它们不参与判断，不影响本题答案。