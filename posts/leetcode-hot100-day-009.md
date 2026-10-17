---
title: "LeetCode Hot 100 · Day 9"
date: 2026-10-18
summary: "搜索插入位置、查找元素的首尾位置、搜索二维矩阵：二分查找与边界定位。"
draft: false
---

## 35. 搜索插入位置 · Binary Search（二分查找）

在有序数组中查找目标值，找到就返回下标；否则返回保持数组有序的插入位置。

```python
class Solution:
    def searchInsert(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = left + (right - left) // 2
            if target < nums[mid]:
                right = mid - 1
            elif target == nums[mid]:
                return mid
            else:
                left = mid + 1

        return left
```

- **注意：** 使用闭区间 `[left, right]`，循环条件为 `left <= right`。
- **返回值：** 未找到时，`left` 指向第一个大于目标的位置；若目标最大，则为数组长度。
- **复杂度：** 时间 `O(log n)`，空间 `O(1)`。

## 34. 在排序数组中查找元素的第一个和最后一个位置

进行两次二分查找：找到目标后，第一次继续向左寻找，第二次继续向右寻找。

```python
class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if target > nums[mid]:
                left = mid + 1
            elif target < nums[mid]:
                right = mid - 1
            else:
                # 找到目标后，继续向左寻找
                right = mid - 1
        left_b = left

        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if target > nums[mid]:
                left = mid + 1
            elif target < nums[mid]:
                right = mid - 1
            else:
                # 找到目标后，继续向右寻找
                left = mid + 1
        right_b = right

        if left_b <= right_b and nums[left_b] == target:
            return [left_b, right_b]
        return [-1, -1]
```

- **边界：** 第一次结束后的 `left` 是第一个大于或等于目标的位置；第二次结束后的 `right` 是最后一个小于或等于目标的位置。
- **注意：** 先检查 `left_b <= right_b`，目标不存在或数组为空时会短路，不会继续访问 `nums[left_b]`。
- **复杂度：** 时间 `O(log n)`，空间 `O(1)`。

## 74. 搜索二维矩阵 · 下标映射

将矩阵视为长度为 `m * n` 的有序数组，通过除法和取余将一维下标映射为行列下标，再进行二分查找。

```python
class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        left, right = 0, m * n - 1

        while left <= right:
            mid = left + (right - left) // 2
            val = self.get(matrix, mid)

            if target < val:
                right = mid - 1
            elif target == val:
                return True
            else:
                left = mid + 1

        return False

    def get(self, matrix: list[list[int]], index: int) -> int:
        n = len(matrix[0])
        i = index // n
        j = index % n
        return matrix[i][j]
```

- **映射：** 行下标为 `index // n`，列下标为 `index % n`；这里的 `n` 是列数。
- **前提：** 每行有序，且每行首元素大于上一行末元素，因此按行展开后整体有序。
- **复杂度：** 时间 `O(log(mn))`，空间 `O(1)`。