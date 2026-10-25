---
title: "LeetCode Hot 100 · Day 17"
date: 2026-10-26
summary: "合并 K 个升序链表、LRU 缓存与前缀树：堆、OrderedDict 与 Trie 入门。"
draft: false
---

## 23. 合并 K 个升序链表 · Min-Heap（小顶堆）

给定 K 个升序链表，将它们合并为一个升序链表。

堆中保存每条链表当前待处理的节点。每次取出最小节点，接到结果链表，再把它的后继节点加入堆。

```python
import heapq


class Solution:
    def mergeKLists(self, lists):
        dummy = ListNode(-1)
        p = dummy
        pq = []

        for i, node in enumerate(lists):
            if node is not None:
                heapq.heappush(pq, (node.val, i, node))

        while pq:
            val, i, node = heapq.heappop(pq)
            p.next = node
            p = p.next

            if node.next is not None:
                heapq.heappush(pq, (node.next.val, i, node.next))

        return dummy.next
```

- 空链表不能直接访问 `node.val`。
- 弹出节点后，需要将它的后继节点入堆，否则无法继续合并。
- `i` 是链表编号；堆中每条链表最多一个节点，因此值相同时不会比较节点对象。
- 总节点数为 N：时间 O(N log(K + 1))，辅助空间 O(K)。

## 146. LRU 缓存 · OrderedDict（有序字典）

实现固定容量的缓存：读取和写入都算一次使用，容量不足时淘汰最久未使用的键。

初次先使用封装 API，之后再专题练习哈希表与双向链表实现。

```python
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.cap = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1

        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        self.cache[key] = value
        self.cache.move_to_end(key)

        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)
```

- 正确名称是 `OrderedDict`，构造方法是 `__init__`。
- 字典头部是最久未使用的键，尾部是最近使用的键。
- 写入已有键也算使用，所以更新值后必须移到尾部。
- `get`、`put` 平均时间 O(1)，空间 O(capacity)。

## 208. 实现 Trie（前缀树）

实现单词插入、完整单词查询和前缀查询。

目前先理解基本实现，树相关算法之后再做专题。前缀树通过字符连接节点，共享相同的单词前缀。

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root

        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]

        node.is_end = True

    def search(self, word: str) -> bool:
        node = self.root

        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]

        return node.is_end

    def startsWith(self, prefix: str) -> bool:
        node = self.root

        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]

        return True
```

- `self` 是整棵 Trie，`node` 是当前节点；结束标记应写为 `node.is_end`。
- `search` 要检查最后一个节点是否标记为单词结尾；`startsWith` 只要求路径存在。
- 提交方法名是 `startsWith`，注意大小写。
- 单次操作时间 O(L)，L 为查询或插入的字符串长度；总空间 O(S)，S 为所有插入单词的总字符数。