---
title: "LeetCode Hot 100 · Day 3"
date: 2026-10-12
summary: "移动零、颜色分类、盛最多水的容器：快慢指针、三指针与左右指针。"
draft: false
---

## 283. 移动零 · Two Pointers（双指针）

`fast` 扫描数组，`slow` 指向下一个非零元素的写入位置。先依次写入非零元素，再将剩余位置补零。

```python
class Solution:
    def moveZeros(self, nums: list[int]) -> None:
        slow, fast = 0, 0
        while fast < len(nums):
            if nums[fast] != 0:
                nums[slow] = nums[fast]
                slow += 1
            fast += 1

        while slow < len(nums):
            nums[slow] = 0
            slow += 1
```

- **注意：** LeetCode 提交时方法名应为 `moveZeroes`，将上面的 `moveZeros` 改为 `moveZeroes`。
- **特点：** 原地修改，保持非零元素的相对顺序，无需返回数组。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

## 75. 颜色分类 · 三指针

`low` 指向下一个 `0` 的放置位置，`mid` 扫描待处理元素，`high` 指向下一个 `2` 的放置位置。

```python
class Solution:
    def sortColors(self, nums: list[int]) -> None:
        low, mid = 0, 0
        high = len(nums) - 1

        while mid <= high:
            if nums[mid] == 1:
                mid += 1
            elif nums[mid] == 2:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1
            elif nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                mid += 1
                low += 1
```

- **纠错：** 判断的是 `nums[mid]`，不是 `mid`；Python 使用 `elif`。
- **注意：** 与 `high` 交换后，换来的元素尚未检查，因此不能增加 `mid`。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

## 11. 盛最多水的容器 · Two Pointers

左右指针从两端向中间移动，每次计算面积，并移动较短的一侧。

```python
class Solution:
    def maxArea(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        res = 0

        while left < right:
            area = min(height[left], height[right]) * (right - left)
            res = max(res, area)

            if height[left] < height[right]:
                left += 1
            else:
                right -= 1

        return res
```

- **思路：** 面积由短板和宽度决定。宽度缩小时，移动短板才可能获得更大的面积；只移动长板无法改善当前面积。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。