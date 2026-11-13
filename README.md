# linghai-feature-config

领嗨熊仔 · 服务端功能开关（全用户一致，无审核差异化）。

## 可视化后台

GitHub Pages 开启后访问：

```
https://lcd10415.github.io/linghai-feature-config/admin/
```

使用方式：

1. 打开后台页面
2. 填入 GitHub Personal Access Token（需要 `repo`，或 Fine-grained：本仓库 Contents Read/Write）
3. 点「连接并加载」→ 切换开关 →「保存到 GitHub」
4. App 下次启动拉取 `features.json` 生效

Token 只存在浏览器 `localStorage`，不会发到第三方服务器。

## App 拉取地址

```
https://raw.githubusercontent.com/lcd10415/linghai-feature-config/main/features.json
```

## 开关字段

| 字段 | 含义 | 默认 |
| --- | --- | --- |
| `payout` | 提现账户 | `false` |
| `add_payout` | 添加提现账户 | `false` |
| `cream_off` | 提现记录 | `false` |
| `apply_agent` | 申请代理 | `false` |
| `bind_invite` | 绑定邀请 | `false` |
| `my_team` | 我的团队 | `false` |
| `recharge` | 充值 | `false` |

**请保持对所有用户同一套配置**，不要按审核员/地区做差异化。
