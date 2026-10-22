---
title: "LeetCode Hot 100 · Day 14"
date: 2026-10-23
summary: "有效的括号、最小栈、字符串解码：栈的匹配、辅助记录与嵌套处理。"
draft: false
---

## 20. 有效的括号 · Stack（栈）

左括号入栈，右括号与栈顶匹配并弹出；遍历结束后，栈为空才表示全部匹配成功。

```python
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []

        for char in s:
            if char in "[{(":
                stack.append(char)
            else:
                if stack and self.gethalf(char) == stack[-1]:
                    stack.pop()
                else:
                    return False

        return not stack

    def gethalf(self, char: str) -> str:
        if char == "}":
            return "{"
        elif char == "]":
            return "["
        elif char == ")":
            return "("
```

- **纠错：** 最后栈为空应返回 `True`，非空返回 `False`；Python 布尔值首字母大写。
- **注意：** 先检查 `stack` 非空，再访问 `stack[-1]`；题目保证输入只有括号字符。
- **复杂度：** 时间 `O(n)`，空间 `O(n)`。

## 155. 最小栈 · 辅助栈

普通栈保存全部元素，辅助栈记录当前最小值及其变化，使所有操作都能在常量时间内完成。

```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]

    def pop(self) -> None:
        if self.stack.pop() == self.min_stack[-1]:
            self.min_stack.pop()

    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
```


- **注意：** 入辅助栈的条件必须包含 `=`，重复最小值也要记录，才能在弹出时正确保留剩余最小值。
- **复杂度：** 各操作均摊时间 `O(1)`，总空间 `O(n)`。

## 394. 字符串解码 · 双栈

遇到左括号，保存重复次数和当前字符串，再开始处理括号内部；遇到右括号，弹出并拼接，完成当前层解码。

```python
class Solution:
    def decodeString(self, s: str) -> str:
        nums = []
        strs = []
        res = ""
        num = 0

        for char in s:
            if char.isdigit():
                num = num * 10 + int(char)
            elif char.isalpha():
                res += char
            elif char == "[":
                nums.append(num)
                strs.append(res)
                res = ""
                num = 0
            elif char == "]":
                onum = nums.pop()
                ostr = strs.pop()
                res = ostr + res * onum

        return res
```

- **纠错：** `strs.append(str)` 改为 `strs.append(res)`；`str = ""` 改为 `res = ""`。
- **注意：** `num * 10 + int(char)` 用于读取多位数；两个栈共同保存外层状态，支持嵌套解码。
- **复杂度：** 字符串重复与拼接需要复制字符，时间取决于各层生成字符串的总长度，不能简单写成输入长度的 `O(n)`；空间为 `O(n + L)`，`L` 为最终解码长度。

## 每日一句

**中文：** 匹配括号时，左括号入栈，右括号与栈顶比较；最小栈用辅助栈记录最小值；字符串解码遇到 `[` 时“存档”并重置当前状态，遇到 `]` 时“读档”并拼接；`not stack` 在栈为空时为 `True`，非空时为 `False`。

**English:** For bracket matching, push opening brackets and compare closing brackets with the stack top. Use an auxiliary stack to track minimum values. For string decoding, save and reset the current state at `[` and restore and combine it at `]`. `not stack` is `True` when the stack is empty and `False` otherwise.