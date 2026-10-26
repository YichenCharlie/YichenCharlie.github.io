---
title: "LeetCode Hot 100 · Day 18"
date: 2026-10-27
summary: "二叉树入门：中序遍历、最大深度、翻转、对称与直径，以及递归的三个位置。"
draft: false
---

## 94. 二叉树的中序遍历 · Inorder Traversal（中序遍历）

返回二叉树按“左子树 → 当前节点 → 右子树”顺序遍历的节点值。

```python
class Solution:
    def inorderTraversal(self, root):
        self.res = []
        self.traverse(root)
        return self.res

    def traverse(self, root):
        if root is None:
            return

        self.traverse(root.left)
        self.res.append(root.val)
        self.traverse(root.right)
```

- 结果需要节点值，所以添加 `root.val`，不是 `root`。
- 将结果初始化放在入口方法，避免同一个对象多次调用时累积旧结果。
- 时间 O(N)，递归栈 O(H)，结果数组 O(N)。

## 104. 二叉树的最大深度 · Traversal（遍历）

求根节点到最远叶子节点的路径上的节点数。

```python
class Solution:
    def maxDepth(self, root):
        self.maxd = 0
        self.dep = 0
        self.traverse(root)
        return self.maxd

    def traverse(self, root):
        if root is None:
            return

        # 前序：进入节点，当前深度加一
        self.dep += 1
        self.maxd = max(self.maxd, self.dep)

        self.traverse(root.left)
        self.traverse(root.right)

        # 后序：离开节点，恢复父节点的深度
        self.dep -= 1
```

- `dep` 记录当前路径深度，`maxd` 记录遍历过程中遇到的最大深度。
- `self.dep -= 1` 是回溯时恢复状态，不能遗漏。
- 时间 O(N)，空间 O(H)。

## 226. 翻转二叉树 · Recursion（递归）

交换每个节点的左右子树，返回翻转后的根节点。

```python
class Solution:
    def invertTree(self, root):
        if root is None:
            return None

        tmp = root.left
        root.left = root.right
        root.right = tmp

        self.invertTree(root.left)
        self.invertTree(root.right)

        return root
```

- 前序位置交换左右子树，再递归处理两棵子树。
- 原来的交换逻辑正确，主要修正 `None` 的大小写。
- 时间 O(N)，空间 O(H)。

## 101. 对称二叉树 · Mirror Comparison（镜像比较）

判断二叉树的左右子树是否互为镜像。

```python
class Solution:
    def isSymmetric(self, root):
        if root is None:
            return True

        return self.check(root.left, root.right)

    def check(self, left, right):
        if left is None and right is None:
            return True

        if left is None or right is None:
            return False

        if left.val != right.val:
            return False

        return (
            self.check(left.left, right.right)
            and self.check(left.right, right.left)
        )
```

- 镜像比较：外侧对外侧，内侧对内侧。
- 两次递归都要写 `self.check(...)`。
- Python 使用 `None`、`True`、`False`，注意大小写。
- 时间 O(N)，空间 O(H)。

## 543. 二叉树的直径 · Postorder（后序）

求任意两个节点之间最长路径的边数，路径不一定经过根节点。

```python
class Solution:
    def diameterOfBinaryTree(self, root):
        self.maxd = 0
        self.depth(root)
        return self.maxd

    def depth(self, root):
        if root is None:
            return 0

        left = self.depth(root.left)
        right = self.depth(root.right)

        # 后序：根据左右子树深度，更新经过当前节点的最长路径
        self.maxd = max(self.maxd, left + right)

        # 返回当前子树的深度，供父节点使用
        return max(left, right) + 1
```

- `depth` 返回以节点数计算的子树深度，`left + right` 恰好是经过当前节点的路径边数。
- 原代码缺少最后的 `return`，父节点会拿到 `None`，无法计算。
- 时间 O(N)，空间 O(H)。

> N 为节点总数，H 为树高；最坏情况下树退化成链表，H = N。

## 递归模板：前序、中序、后序位置

```python
def traverse(root):
    if root is None:
        return

    # 1. 前序位置：刚进入节点
    # 可以使用从父节点传下来的状态，如当前深度、当前路径
    # 适合：记录路径、深度加一、交换左右子树
    traverse(root.left)

    # 2. 中序位置：左子树遍历完，准备遍历右子树
    # 适合：二叉搜索树（BST）的有序操作，如找第 K 小
    traverse(root.right)

    # 3. 后序位置：左右子树都遍历完，准备退出节点
    # 适合：汇总子树结果、更新直径、回溯时撤销选择
```

**“遍历完子树”不等于“自动拿到了子树结果”。** 如果需要使用返回值，必须定义返回含义并接住结果：

```python
def depth(root):
    if root is None:
        return 0

    left = depth(root.left)
    right = depth(root.right)

    # 后序位置：汇总左右子树返回的深度
    return max(left, right) + 1
```

构造方法的正确写法是 `def __init__(self):`。本篇将结果变量放在入口方法初始化，方便每次调用时重置；`self.res`、`self.dep` 等是实例属性，不是全局变量。

## 每日一句

**中文：** 返回值法明确每棵子树返回什么，常在后序位置自底向上汇总；遍历法沿路径维护状态，需要回溯时在前序更新、后序恢复。两种思路可以结合，也不一定需要全局变量。

**English:** Define what each subtree returns and often combine the results bottom-up in postorder. During traversal, maintain path state and, when backtracking is needed, update it on entry and restore it on exit. Both approaches can be combined, and neither requires global variables.