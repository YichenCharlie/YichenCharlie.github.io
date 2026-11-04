---
title: "LeetCode Hot 100 · Day 27"
date: 2026-11-05
summary: "一维动态规划：枚举最后一个平方数、最后一枚硬币，或字符串的最后一个切点。"
draft: false
---

## 279. 完全平方数 · Perfect Squares

给定整数 `n`，求和为 `n` 所需的最少完全平方数个数。

**状态：** `dp[i]` 表示凑出 `i` 最少需要几个平方数。如果最后一个平方数选 `j * j`，剩下的数是 `i - j * j`，所以这次选法需要 `dp[i - j * j] + 1` 个。

```python
class Solution:
    def numSquares(self, n: int) -> int:
        dp = [float("inf")] * (n + 1)
        dp[0] = 0

        for i in range(1, n + 1):
            for j in range(1, int(i ** 0.5) + 1):
                dp[i] = min(dp[i], dp[i - j * j] + 1)

        return dp[n]
```

- 下标覆盖 `0` 到 `n`，所以长度是 `n + 1`。当 `i` 本身是平方数时，`dp[0] + 1` 正好得到 `1`。
- 内层枚举**所有不超过 `i` 的平方数**。因为 `i - j * j < i`，较小状态已经算好，直接查表即可，不需要递归。

## 322. 零钱兑换 · Coin Change

每种面额的硬币都可以重复使用。求凑出 `amount` 所需的最少硬币数；无法凑出则返回 `-1`。

**状态：** `dp[i]` 表示凑出金额 `i` 最少需要几枚硬币。和 279 一样，枚举最后一项，只需把平方数换成硬币面额。

```python
class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [float("inf")] * (amount + 1)
        dp[0] = 0

        for i in range(1, amount + 1):
            for coin in coins:
                if i < coin:
                    continue
                dp[i] = min(dp[i], dp[i - coin] + 1)

        return -1 if dp[amount] == float("inf") else dp[amount]
```

- 从小到大遍历的是**金额 `i`**。硬币按任意顺序枚举都可以；如果没有一种选法能凑出目标金额，`dp[amount]` 就会保持无穷大。

## 139. 单词拆分 · Word Break

判断字符串 `s` 能否拆成字典中的单词，字典里的词可以重复使用。

**状态：** `dp[i]` 表示前 `i` 个字符 `s[:i]` 能否拆分。把 `i` 固定为当前前缀的右边界，再枚举最后一刀切在哪里：如果 `s[:j]` 已经能拆，并且 `s[j:i]` 是一个完整单词，那么 `s[:i]` 也能拆。

```python
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        n = len(s)
        words = set(wordDict)
        dp = [False] * (n + 1)
        dp[0] = True

        for i in range(1, n + 1):
            for j in range(i):
                if dp[j] and s[j:i] in words:
                    dp[i] = True
                    break

        return dp[n]
```

- **修改：** `dp[0] = True` 表示空前缀可以由零个单词组成，让第一个词能从下标 `0` 开始。
- 原来的 `worddict` 与参数 `wordDict` 大小写不一致。这里转成集合 `words` 方便查词；找到一个合法切点后就能 `break`，因为本题只问“能不能”。

## 完全背包 / 一维 DP 核心总结
求最小就定义最大，要看dp数组是在记录是什么，一定要先想明白，这样初始状态以及长度都能懂，例如完全平方数，就是看数字，从1开始，所以记录最小的结果的dp数组长度要是1-amount，也就是1-amount+1，dp[0]舍去，第一个循环遍历到当前数字，第二个找当前数字前的最小平方根，然后递归一点点往前查之前的记录，然后记录下来，要么是当前数字直接是平方，要么是i - 最大的平方，合并动作+1，就是最小结果，coin也是的，先遍历数字，然后记录从小到大的coin，去减，然后去看最小值，字符串能不能切成字典里的数字，也是一样，首先是整个字符的长度，想象成在切，0位置先置true，两个遍历一段停住，一段切停住里面符合的，然后记录到dp数组里面去,状态转移就是，如果之前这个位置能切出来true，然后这个位置到后面的i也在dic里面，说明这个地方也能切，一点一点往后走