---
title: "LeetCode Hot 100 · Day 19"
date: 2026-10-27
summary: "二叉搜索树：有序数组建树、上下界验证与中序寻找第 K 小。"
draft: false
---

## 108. 将有序数组转换为二叉搜索树 · BST（二叉搜索树）

将严格升序数组转换为高度平衡的二叉搜索树。

每次选取当前区间的中间元素作为根节点，再分别构建左右子树。

```python
class Solution:
    def sortedArrayToBST(self, nums):
        return self.build(nums, 0, len(nums) - 1)

    def build(self, nums, left, right):
        if left > right:
            return None

        mid = (left + right) // 2
        root = TreeNode(nums[mid])

        root.left = self.build(nums, left, mid - 1)
        root.right = self.build(nums, mid + 1, right)

        return root
```

- 递归传入 `nums` 和区间边界；`root` 是每次调用中新建的节点。
- `left > right` 表示区间为空，返回 `None`。
- 高度平衡：每个节点的左右子树高度差不超过 1，并非必须完全相同。
- 时间 O(N)，辅助空间 O(log N)，不计创建的树。

## 98. 验证二叉搜索树 · Bounds（上下界）

判断每个节点是否满足：左子树所有值严格小于它，右子树所有值严格大于它。

递归携带祖先规定的上下界，不能只比较当前节点和它的孩子。

```python
class Solution:
    def isValidBST(self, root):
        return self.check(root, None, None)

    def check(self, root, lower, upper):
        if root is None:
            return True

        if lower is not None and root.val <= lower.val:
            return False
        if upper is not None and root.val >= upper.val:
            return False

        return (
            self.check(root.left, lower, root)
            and self.check(root.right, root, upper)
        )
```

- 原来的上下界思路正确，主要修正 `None`、`True`、`False` 的大小写。
- 进入左子树，更新上界；进入右子树，更新下界。相等也不满足要求。
- 将 `min`、`max` 改名为 `lower`、`upper`，避免遮蔽 Python 内置函数；这是命名优化。
- 时间 O(N)，空间 O(H)。

## 230. 二叉搜索树中第 K 小的元素 · Inorder Traversal（中序遍历）

给定二叉搜索树，返回其中第 K 小的节点值，K 从 1 开始计数。

BST 的中序遍历结果是升序，因此访问到第 K 个节点时记录答案。

```python
class Solution:
    def __init__(self):
        self.res = 0
        self.kth = 0
        
    def kthSmallest(self, root, k):
        
        self.traverse(root, k)
        return self.res

    def traverse(self, root, k):
        if root is None:
            return

        self.traverse(root.left, k)

        self.kth += 1
        if self.kth == k:
            self.res = root.val
            return

        self.traverse(root.right, k)
```

- 每次递归都要传入 `k`。
- `return` 只结束当前函数调用；找到答案后，还需要让祖先调用停止后续处理。
- 在入口初始化 `res` 和 `kth`，避免多次调用时残留旧状态。
- 时间 O(H + K)，空间 O(H)；H 为树高。

## 每日一句

**中文：** 今天的 BST 三招：有序数组建树选中间，保证高度平衡；验树不能只比亲父子，要带上下界且排除相等；找第 K 小用中序升序计数，找到后让各层停止后续遍历。

**English:** Three BST techniques from today: choose the middle element of a sorted array to build a height-balanced tree; validate ancestor bounds with strict inequalities; and find the kth smallest value through inorder traversal, stopping further traversal once it is found.