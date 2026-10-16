---
title: "LeetCode Hot 100 · Day 8"
date: 2026-10-16
summary: "矩阵置零、螺旋矩阵、旋转图像、搜索二维矩阵 II：行列标记、边界遍历与转置。"
draft: false
---

## 73. 矩阵置零 · Hash Set（哈希集合）

先记录原矩阵中零元素所在的行和列，再统一置零，避免新产生的零影响后续判断。

```python
class Solution:
    def setZeroes(self, matrix: list[list[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        hang_zero = set()
        lie_zero = set()

        for i in range(m):
            for j in range(n):
                if matrix[i][j] == 0:
                    hang_zero.add(i)
                    lie_zero.add(j)

        for i in range(m):
            for j in range(n):
                if i in hang_zero or j in lie_zero:
                    matrix[i][j] = 0
```


- **注意：** 先记录，再修改，不能发现零就立即清空整行整列。
- **复杂度：** 平均时间 `O(mn)`，空间 `O(m + n)`。

## 54. 螺旋矩阵 · 边界遍历

维护上下左右四条边界，依次向右、向下、向左、向上遍历，每完成一条边就收缩对应边界。

```python
class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        m, n = len(matrix), len(matrix[0])
        left_b, right_b = 0, n - 1
        up_b, down_b = 0, m - 1
        res = []

        while len(res) < m * n:
            if up_b <= down_b:
                for i in range(left_b, right_b + 1):
                    res.append(matrix[up_b][i])
                up_b += 1

            if left_b <= right_b:
                for i in range(up_b, down_b + 1):
                    res.append(matrix[i][right_b])
                right_b -= 1

            if up_b <= down_b:
                for i in range(right_b, left_b - 1, -1):
                    res.append(matrix[down_b][i])
                down_b -= 1

            if left_b <= right_b:
                for i in range(down_b, up_b - 1, -1):
                    res.append(matrix[i][left_b])
                left_b += 1

        return res
```

- **纠错：** 向下遍历时应为 `matrix[i][right_b]`，不是 `matrix[right_b][i]`。
- **注意：** `matrix[行][列]`；横向遍历固定行，纵向遍历固定列。
- **复杂度：** 时间 `O(mn)`，额外空间 `O(1)`，不计输出。

## 48. 旋转图像 · Transpose（转置）与行反转

先沿主对角线转置，再反转每一行，即可将方阵顺时针旋转 90°。

```python
class Solution:
    def reverse(self, arr: list[int]) -> None:
        i, j = 0, len(arr) - 1
        while i < j:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
            j -= 1

    def rotate(self, matrix: list[list[int]]) -> None:
        m = len(matrix)

        for i in range(m):
            for j in range(i, m):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        for hang in matrix:
            self.reverse(hang)
```

- **纠错：** `self.reverse(matrix)` 改为 `self.reverse(hang)`，每次反转当前行。
- **接口：** 主方法补为 `rotate`；`reverse` 原地修改且无返回值，标注为 `-> None`。
- **注意：** 只遍历对角线及其一侧，避免同一对元素交换两次。
- **复杂度：** 时间 `O(m²)`，空间 `O(1)`。

## 240. 搜索二维矩阵 II · 阶梯搜索

从右上角开始：当前值小于目标就向下移动，大于目标就向左移动，每次排除一行或一列。

```python
class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        i, j = 0, n - 1

        while i < m and j >= 0:
            if matrix[i][j] == target:
                return True
            elif matrix[i][j] < target:
                i += 1
            else:
                j -= 1

        return False
```

- **前提：** 每行从左到右升序，每列从上到下升序。
- **复杂度：** 时间 `O(m + n)`，空间 `O(1)`。