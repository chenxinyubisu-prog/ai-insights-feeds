# AI Insights Feeds

自动抓取 AI builder X 账号动态，生成 JSON feed 供 OpenClaw ai-insights-digest skill 使用。

## 配置

当前抓取账号：
- Gavin Baker (@GasparBaker)

如需添加更多账号，编辑 `scripts/fetch-x.js` 的 `ACCOUNTS` 数组。

## 输出

- `feed-x.json` — X 账号推文 feed

## 使用

GitHub Actions 每天 UTC 1:00（北京时间 9:00）自动运行。

手动触发：
1. 进入仓库 Actions 页面
2. 选择 "Fetch X Feeds"
3. 点击 "Run workflow"

## 集成

在 ai-insights-digest 的 `prepare-insights-digest.js` 中，将：

```javascript
const ENGLISH_FEEDS = {
  x: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json',
  // ...
};
```

替换为：

```javascript
const ENGLISH_FEEDS = {
  x: 'https://raw.githubusercontent.com/chenxinyubisu-prog/ai-insights-feeds/main/feed-x.json',
  // ...
};
```

（或合并两个 feed）
