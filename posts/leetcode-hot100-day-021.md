---
title: "LeetCode Hot 100 · Day 21"
date: 2026-10-29
summary: "二叉树：最近公共祖先、前缀和统计路径，以及最大路径和。"
draft: false
---

## 236. 二叉树的最近公共祖先 · Postorder（后序）

给定二叉树和其中两个不同节点 p、q，返回它们的最近公共祖先。节点可以是自己的祖先。

```python
class Solution:
    def lowestCommonAncestor(self, root, p, q):
        return self.find(root, p, q)

    def find(self, root, p, q):
        if root is None:
            return None

        if root is p or root is q:
            return root

        left = self.find(root.left, p, q)
        right = self.find(root.right, p, q)

        if left is not None and right is not None:
            return root

        return left if left is not None else right
```

- 左右都有结果，说明 p、q 分居两侧，当前节点就是最近公共祖先。
- 只有一侧有结果，向上传递该结果；两侧都没有则返回 `None`。
- 原逻辑正确。将 `val1`、`val2` 改为 `p`、`q`，明确比较的是节点，而非节点值。
- 时间 O(N)，空间 O(H)。

## 437. 路径总和 III · Prefix Sum（前缀和）

统计节点值之和等于 targetSum 的向下路径数量。路径不必从根开始，也不必在叶子结束，但必须从父节点走向子节点。

```python
class Solution:
    def pathSum(self, root, targetSum):
        self.count = {0: 1}
        self.res = 0
        self.target = targetSum
        self.pth_sum = 0

        self.traverse(root)
        return self.res

    def traverse(self, root):
        if root is None:
            return

        self.pth_sum += root.val

        # 当前前缀和 - 之前的前缀和 = target
        self.res += self.count.get(self.pth_sum - self.target, 0)

        # 记录当前前缀和，供后代节点使用
        self.count[self.pth_sum] = self.count.get(self.pth_sum, 0) + 1

        self.traverse(root.left)
        self.traverse(root.right)

        # 回溯：撤销当前节点的前缀和记录，再恢复路径和
        self.count[self.pth_sum] -= 1
        if self.count[self.pth_sum] == 0:
            del self.count[self.pth_sum]
        self.pth_sum -= root.val
```

- `{0: 1}` 表示根节点之前的空前缀，使从根开始的路径也能被统计。
- 先查询、后记录，避免将空路径计入答案；退出节点时撤销记录，避免左右分支互相影响。
- 删除计数为 0 的键是空间优化。时间 O(N)，空间 O(H)。

## 124. 二叉树中的最大路径和 · Postorder（后序）

求非空二叉树中任意一条非空路径的最大节点值之和。路径可以经过某个节点连接左右子树，但不能重复经过节点。

```python
class Solution:
    def maxPathSum(self, root):
        self.res = float("-inf")
        self.maxpath(root)
        return self.res

    def maxpath(self, root):
        if root is None:
            return 0

        # 负贡献直接舍弃，不选择该侧路径
        leftmax = max(0, self.maxpath(root.left))
        rightmax = max(0, self.maxpath(root.right))

        # 更新答案：可以同时连接左右两侧
        pth_sum = leftmax + rightmax + root.val
        self.res = max(self.res, pth_sum)

        # 返回父节点：只能选择一侧继续向上延伸
        return max(leftmax, rightmax) + root.val
```

- 空节点返回 0；左右子树贡献与 0 取最大值，避免负贡献拖低路径和。
- 原来的 `self.pth_sum` 应为局部变量 `pth_sum`。
- **更新答案可以两边都选，返回父节点只能选一边**，否则会形成分叉，不再是一条路径。
- 时间 O(N)，空间 O(H)。

> N 为节点数，H 为树高。