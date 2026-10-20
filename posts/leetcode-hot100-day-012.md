---
title: "LeetCode Hot 100 · Day 12"
date: 2026-10-21
summary: "删除倒数节点、两两交换、两数相加、寻找环入口与重复数：链表操作与快慢指针。"
draft: false
---

## 19. 删除链表的倒数第 N 个节点

先统计实际节点数，再从虚拟头节点出发，找到待删除节点的前驱并跳过目标节点。

```python
class Solution:
    def removeNthFromEnd(self, head, n: int):
        dummy = ListNode(-1)
        dummy.next = head

        length = 0
        curr = head
        while curr:
            length += 1
            curr = curr.next

        curr = dummy
        for _ in range(length - n):
            curr = curr.next

        curr.next = curr.next.next
        return dummy.next
```

- **纠错：** 计数从 `head` 开始，不包含 `dummy`；定位前驱从 `dummy` 开始，走 `length - n` 步。
- **命名：** 使用 `length`，避免覆盖内置函数 `len`；节点类写作 `ListNode`。
- **复杂度：** 时间 `O(L)`，空间 `O(1)`；`L` 为链表长度。

## 24. 两两交换链表中的节点 · Recursion（递归）

交换当前两个节点，再将原来的第一个节点连接到剩余链表递归交换后的头节点。

```python
class Solution:
    def swapPairs(self, head):
        if head is None or head.next is None:
            return head

        first, second = head, head.next
        others = second.next

        second.next = first
        first.next = self.swapPairs(others)

        return second
```

- **纠错：** `fist` 改为 `first`；补上空链表和单节点的终止条件；统一方法名为 `swapPairs`。
- **注意：** 修改连接前保存 `others`，交换后返回新的头节点 `second`。
- **复杂度：** 时间 `O(L)`，递归栈空间 `O(L)`。

## 2. 两数相加

逐位累加两条链表的节点值与进位，将个位写入新节点，将十位留给下一轮。

```python
class Solution:
    def addTwoNumbers(self, l1, l2):
        p1, p2 = l1, l2
        carry = 0
        dummy = ListNode(-1)
        p = dummy

        while p1 is not None or p2 is not None or carry > 0:
            val = carry

            if p1 is not None:
                val += p1.val
                p1 = p1.next
            if p2 is not None:
                val += p2.val
                p2 = p2.next

            carry = val // 10
            val %= 10
            p.next = ListNode(val)
            p = p.next

        return dummy.next
```

- **纠错：** 新节点应为 `ListNode(val)`，不是 `ListNode(carry)`。
- **注意：** 链表按低位到高位存储；即使两个指针都为空，只要还有进位就继续。
- **复杂度：** 时间 `O(max(m, n))`，额外空间 `O(1)`，不计输出链表。

## 142. 环形链表 II · Fast and Slow Pointers（快慢指针）

先让快慢指针在环内相遇，再将一个指针放回头节点，两者每次各走一步，再次相遇的位置就是环入口。

```python
class Solution:
    def detectCycle(self, head):
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                break
        else:
            return None

        fast = head
        while slow is not fast:
            fast = fast.next
            slow = slow.next

        return slow
```

- **整理：** 删除未使用的 `first = slow`；使用 `is` 判断是否为同一个节点。
- **语法：** `while...else` 中，循环正常结束才执行 `else`；通过 `break` 退出则跳过。
- **复杂度：** 时间 `O(L)`，空间 `O(1)`。

## 287. 寻找重复数 · Floyd Cycle Detection（Floyd 判环算法）

将数组视为隐式链表：下标是节点，`nums[i]` 是下一个节点。重复数对应从下标 `0` 出发所进入的环入口。

```python
class Solution:
    def findDuplicate(self, nums: list[int]) -> int:
        slow, fast = 0, 0

        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break

        first = 0
        while slow != first:
            slow = nums[slow]
            first = nums[first]

        return first
```

- **前提：** 数组长度为 `n + 1`，元素范围为 `[1, n]`，只有一个重复的数，但它可以出现多次。
- **整理：** 原逻辑正确；将 `first = 0` 放到第二阶段前，第二阶段改为条件循环。
- **对应：** 链表的 `p.next` 对应数组的 `nums[p]`；这里比较的是整数下标，使用 `==`。
- **复杂度：** 时间 `O(n)`，空间 `O(1)`，不修改原数组。