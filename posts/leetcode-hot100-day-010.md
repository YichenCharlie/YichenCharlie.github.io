---
title: "LeetCode Hot 100 · Day 10"
date: 2026-10-19
summary: "寻找旋转数组最小值、搜索旋转数组、寻找两个有序数组的中位数：有序区间与二分分割。"
draft: false
---

## 153. 寻找旋转排序数组中的最小值

判断哪一侧有序，记录该侧最小值，再继续搜索另一侧。

```python
class Solution:
    def findMin(self, nums: list[int]) -> int:
        left, right = 0, len(nums) - 1
        res = float("inf")

        while left <= right:
            mid = left + (right - left) // 2

            if nums[mid] >= nums[left]:
                # 左侧是有序数组，最小值在左端
                res = min(res, nums[left])
                left = mid + 1
            else:
                # 右侧是有序数组，最小值在 mid
                # 旋转形成的下降点位于左侧，继续搜索
                res = min(res, nums[mid])
                right = mid - 1

        return res
```

- **纠错：** 左侧判断改为 `>=`，右侧用 `else`，确保每轮都缩小范围，避免单元素区间死循环。
- **前提：** 数组非空，且元素互不相同。
- **复杂度：** 时间 `O(log n)`，空间 `O(1)`。

## 33. 搜索旋转排序数组

先判断哪一侧有序，再判断目标是否落在该侧的数值范围内，从而排除一半区间。

```python
class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid

            if nums[mid] >= nums[left]:
                # 左侧有序
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                # 右侧有序
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return -1
```

- **纠错：** `mid[left]` 改为 `nums[left]`，`mid` 是整数下标。
- **注意：** 已提前判断 `nums[mid] == target`，后面的范围判断可以排除 `mid`。
- **复杂度：** 时间 `O(log n)`，空间 `O(1)`；题目保证元素互不相同。

## 4. 寻找两个正序数组的中位数 · Binary Partition（二分分割）

在较短数组上二分分割位置，另一个数组的分割位置由左半部分所需的元素数量决定。分割合法后，直接通过边界值计算中位数。

```python
class Solution:
    def findMedianSortedArrays(
        self, nums1: list[int], nums2: list[int]
    ) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m, n = len(nums1), len(nums2)
        half = (m + n + 1) // 2
        left, right = 0, m

        while left <= right:
            i = (left + right) // 2
            j = half - i

            nums1_l = nums1[i - 1] if i > 0 else -float("inf")
            nums1_r = nums1[i] if i < m else float("inf")
            nums2_l = nums2[j - 1] if j > 0 else -float("inf")
            nums2_r = nums2[j] if j < n else float("inf")

            if nums1_l > nums2_r:
                # nums1 左侧取多了，分割位置左移
                right = i - 1
            elif nums2_l > nums1_r:
                # nums1 左侧取少了，分割位置右移
                left = i + 1
            else:
                # 分割合法：左半部分最大值 <= 右半部分最小值
                if (m + n) % 2:
                    return max(nums1_l, nums2_l)
                return (
                    max(nums1_l, nums2_l)
                    + min(nums1_r, nums2_r)
                ) / 2
```

- **纠错：** 元素数量使用整除 `//`。
- **关键：** 只有分割合法时才能返回，计算答案必须放在最后的 `else` 中。
- **边界：** `i、j` 表示各数组分到左半部分的元素数量，可以为 `0` 或数组长度；用正负无穷处理空侧。
- **奇偶：** 总长度为奇数时左侧多一个元素，中位数取左侧最大值；偶数时取左右边界的平均值。
- **复杂度：** 时间 `O(log(min(m, n) + 1))`，空间 `O(1)`。

## 每日一句

**中文：** 旋转数组的二分先判断哪侧有序；两个有序数组的中位数，则通过在较短数组上二分分割位置，让两侧数量平衡且左侧最大值不大于右侧最小值，再从分割边界取答案。

**English:** For binary search on a rotated array, first identify the sorted half. To find the median of two sorted arrays, binary-search the partition in the shorter array so that the two sides are balanced in size and the largest value on the left is no greater than the smallest on the right, then compute the median from the partition boundaries.