---
title: "LeetCode Hot 100 · Day 4"
date: 2026-10-13
summary: "三数之和：通过递归将 nSum 化为双指针求解的 Two Sum。"
draft: false
---

## 15. 三数之和 · nSum 通法

先排序，每次固定一个数，递归求剩余的 `n - 1` 个数；当 `n == 2` 时，使用 Two Pointers（双指针）查找。

```python
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        return self.nsum(nums, 3, 0, 0)

    def nsum(
        self, nums: list[int], n: int, start: int, target: int
    ) -> list[list[int]]:
        res = []
        sz = len(nums)

        if n < 2 or sz - start < n:
            return res

        if n == 2:
            lo, hi = start, sz - 1
            while lo < hi:
                left, right = nums[lo], nums[hi]
                total = left + right

                if total > target:
                    while lo < hi and nums[hi] == right:
                        hi -= 1
                elif total < target:
                    while lo < hi and nums[lo] == left:
                        lo += 1
                else:
                    res.append([left, right])
                    while lo < hi and nums[lo] == left:
                        lo += 1
                    while lo < hi and nums[hi] == right:
                        hi -= 1
        else:
            for i in range(start, sz - n + 1):
                # 同一层跳过重复的固定值
                if i > start and nums[i] == nums[i - 1]:
                    continue

                subs = self.nsum(
                    nums, n - 1, i + 1, target - nums[i]
                )
                for sub in subs:
                    res.append([nums[i]] + sub)

        return res
```

### 关键点与纠错

- **下标与数值：** `lo、hi` 是下标，`left、right` 是对应数值；比较应写 `nums[hi] == right`，答案直接加入 `[left, right]`。
- **递归范围：** 从 `i + 1` 开始，避免重复使用同一元素；剩余元素不足 `n` 个时直接返回。
- **去重：** 递归层跳过相同的固定值，双指针层跳过已处理的重复值。
- **接口与语法：** 方法需要 `self`；类型标注为 `start: int`；使用 `->`、`and`，条件末尾加冒号。
- **目标值：** 本题固定为 `0`，因此 `threeSum` 不需要额外的 `target` 参数。

### 复杂度

本题 `n = 3`：时间 `O(N²)`；额外空间 `O(N)`，不计最终输出，包含 Python 排序及中间结果。`N` 为数组长度。