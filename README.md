# linghai-feature-config

领嗨熊仔 · 服务端功能开关（全用户一致，无审核差异化）。

## 配置地址（App 拉取）

推送到 `main` 后可用：

```
https://raw.githubusercontent.com/lcd10415/linghai-feature-config/main/features.json
```

## 开关说明

| 字段 | 含义 | 默认 |
| --- | --- | --- |
| `payout` | 提现账户 | `false` |
| `add_payout` | 添加提现账户 | `false` |
| `cream_off` | 提现记录 | `false` |
| `apply_agent` | 申请代理 | `false` |
| `bind_invite` | 绑定邀请 | `false` |
| `my_team` | 我的团队 | `false` |
| `recharge` | 充值 | `false` |

改 JSON → `git commit` → `git push`，客户端下次启动（或缓存过期）生效。  
**请保持对所有用户同一套配置**，不要按审核员/地区做差异化。
