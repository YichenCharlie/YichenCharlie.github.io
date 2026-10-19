---
title: "LeetCode Hot 100 · Day 11"
date: 2026-10-19
summary: "反转、合并、相交、判环与回文链表：节点连接、双指针与快慢指针。"
draft: false
---

## 206. 反转链表

遍历链表，先保存后继节点，再将当前节点指向前驱，最后向前移动指针。

```python
class Solution:
    def reverseList(self, head):
        if head is None or head.next is None:
            return head

        pre, curr = None, head
        while curr:
            nxt = curr.next
            curr.next = pre
            pre = curr
            curr = nxt

        return pre
```

- **纠错：** 判断空节点使用 `is None`，不是 `in None`。
- **注意：** 修改 `curr.next` 前必须保存 `nxt`，否则会丢失后续链表的入口。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

## 21. 合并两个有序链表 · Dummy Node（虚拟头节点）

每次将较小节点接到结果尾部，移动对应指针；一条链表耗尽后，直接接上另一条的剩余部分。

```python
class Solution:
    def mergeTwoLists(self, list1, list2):
        dummy = ListNode(-1)
        curr = dummy
        p1, p2 = list1, list2

        while p1 and p2:
            if p1.val >= p2.val:
                curr.next = p2
                p2 = p2.next
            else:
                curr.next = p1
                p1 = p1.next
            curr = curr.next

        curr.next = p1 if p1 else p2
        return dummy.next
```

- **纠错：** `Listnode` 改为 `ListNode`，该节点类由 LeetCode 提供。
- **注意：** `dummy` 保留结果入口，`curr` 始终指向结果尾部。
- **复杂度：** 时间 `O(m + n)`，额外空间 `O(1)`。

## 160. 相交链表 · Two Pointers（双指针）

两个指针分别从两条链表出发，到达空节点后切换到另一条链表的头部，最终在交点或 `None` 相遇。

```python
class Solution:
    def getIntersectionNode(self, headA, headB):
        p1, p2 = headA, headB

        while p1 is not p2:
            if p1 is None:
                p1 = headB
            else:
                p1 = p1.next

            if p2 is None:
                p2 = headA
            else:
                p2 = p2.next

        return p1
```

- **纠错：** 第二个空节点判断应检查 `p2`，不是 `p1`。
- **注意：** 相交指共享同一个节点，使用 `is` 比较节点身份，不是比较节点值。
- **原理：** 设两条独有部分长度为 `a、b`，公共部分长度为 `c`，换头后通过 `a + c + b = b + c + a` 抵消长度差。
- **复杂度：** 时间 `O(m + n)`，空间 `O(1)`。

## 141. 环形链表 · Fast and Slow Pointers（快慢指针）

慢指针每次走一步，快指针每次走两步；有环则必然相遇，无环则快指针到达末尾。

```python
class Solution:
    def hasCycle(self, head) -> bool:
        slow, fast = head, head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True

        return False
```

- **纠错：** 循环条件改为 `fast and fast.next`，确保可以安全访问 `fast.next.next`。
- **注意：** 先移动再判断相遇，因为两个指针初始都指向头节点。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

## 234. 回文链表

用快慢指针找到中点，从中点开始反转后半段，再从两端逐个比较节点值。

```python
class Solution:
    def isPalindrome(self, head) -> bool:
        if head is None or head.next is None:
            return True

        slow, fast = head, head
        # 先通过快慢指针找中点
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        pre, curr = None, slow
        while curr:
            nxt = curr.next
            curr.next = pre
            pre = curr
            curr = nxt

        # 从 slow 开始反转，奇数长度时包含中间节点
        p1, p2 = head, pre
        # 以反转后的半段 p2 为比较范围
        while p2:
            if p1.val != p2.val:
                return False
            p1 = p1.next
            p2 = p2.next

        return True
```

- **纠错：** 使用 `is None`、`fast and fast.next`；`while cur` 改为 `while curr`。
- **注释修正：** 不能说 `p2` 更长；它包含原链表后半段，奇数长度时还包含中间节点，因此比较到 `p2` 结束即可。
- **注意：** 此写法会修改原链表结构，比较后没有恢复。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`。

## 每日一句

**中文：** 找中点靠快慢指针，相交链表靠换头抵消长度差（`a + c + b = b + c + a`）；操作时想清指针方向：`xxx.next = ...` 修改节点连接，`xxx = ...` 修改变量指向，只有 `xxx = xxx.next` 才是沿链表向前走一步。

**English:** Use fast and slow pointers to find the midpoint, and switch heads to cancel the length difference when finding an intersection (`a + c + b = b + c + a`). Keep track of pointer directions: `xxx.next = ...` changes a node’s link, while `xxx = ...` changes what the variable refers to; `xxx = xxx.next` moves one step forward.