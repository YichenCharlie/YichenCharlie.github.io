---
title: "LeetCode Hot 100 · Day 13"
date: 2026-10-22
summary: "随机链表复制、排序链表、K 个一组翻转：节点映射、归并排序与分组重连。"
draft: false
---

## 138. 随机链表的复制 · Hash Map（哈希映射）

先为每个原节点创建新节点，记录「原节点 → 新节点」的映射，再通过映射连接新节点的 `next` 和 `random`。

```python
class Solution:
    def copyRandomList(self, head):
        if head is None:
            return None

        maplist = {None: None}
        curr = head
        while curr:
            maplist[curr] = Node(curr.val)
            curr = curr.next

        curr = head
        while curr:
            maplist[curr].next = maplist[curr.next]
            maplist[curr].random = maplist[curr.random]
            curr = curr.next

        return maplist[head]
```

- **关键：** 不能直接连接 `curr.next`、`curr.random`，否则新链表仍指向原节点，不是完整的深拷贝。
- **注意：** `{None: None}` 用于统一处理空指针；`Node` 由 LeetCode 提供。
- **复杂度：** 平均时间 `O(n)`，额外空间 `O(n)`，不计输出节点。

## 148. 排序链表 · Merge Sort（归并排序）

用快慢指针将链表断成两半，递归排序，再合并两个有序链表。

```python
class Solution:
    def sortList(self, head):
        if head is None or head.next is None:
            return head

        slow = fast = head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next

        mid = slow.next
        slow.next = None

        p1 = self.sortList(head)
        p2 = self.sortList(mid)

        dummy = ListNode(-1)
        p = dummy
        while p1 and p2:
            if p1.val <= p2.val:
                p.next = p1
                p1 = p1.next
            else:
                p.next = p2
                p2 = p2.next
            p = p.next

        p.next = p1 if p1 else p2
        return dummy.next
```

- **纠错：** 补上空链表和单节点的递归终止条件；每次接入节点后必须执行 `p = p.next`。
- **注意：** `slow.next = None` 真正断开两半，使递归处理的链表不断缩短。
- **复杂度：** 时间 `O(n log n)`，递归栈空间 `O(log n)`；此版本不满足进阶要求的常量空间。

## 25. K 个一组翻转链表

先找到当前组第 `k` 个节点，保存下一组入口并断开当前组；反转后连接前后两段，再更新前驱。

```python
class Solution:
    def reverseKGroup(self, head, k: int):
        dummy = ListNode(-1)
        dummy.next = head
        prev = dummy

        while True:
            kth = self.getkth(prev.next, k)
            if kth is None:
                break

            next_group = kth.next
            start = prev.next

            # 断开当前组，再反转这 k 个节点
            kth.next = None
            pre, curr = None, start

            for _ in range(k):
                nxt = curr.next
                curr.next = pre
                pre = curr
                curr = nxt

            # 原尾变新头，原头变新尾
            prev.next = pre
            start.next = next_group

            # 当前组的新尾，就是下一组的前驱
            prev = start

        return dummy.next

    def getkth(self, head, k: int):
        curr = head
        for _ in range(k - 1):
            if curr is None:
                return None
            curr = curr.next
        return curr
```

- **纠错：** 删除反转后的 `curr = curr.next`，因为当前组已断开，反转结束后 `curr` 为 `None`。
- **注意：** 不足 `k` 个节点时保持原样；每组连接到 `prev`，只有第一组的 `prev` 是 `dummy`。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

## 每日一句

**中文：** k个一组反转链表，找出第k个,切，接，连，切除前k个，尾变头连上dummy，头连上下一段，更新下一个k组的prev（即是原本的start）

**English:** To reverse a linked list in k-groups, find the k-th node, cut and reconnect by detaching the first k nodes, link the new head (original tail) back to the dummy/prev, connect the new tail (original start) to the next group, and update prev to the original start for the next k-group.