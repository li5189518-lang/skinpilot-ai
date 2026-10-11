# SkinPilot AI

**🔗 Live demo: https://li5189518-lang.github.io/skinpilot-ai/**
*(Interactive prototype with clearly labelled demo data — not real AI analysis.)*

> **Watch it. Understand it. Do it.**
> An AI skincare learning companion that turns fragmented tutorials into a personalised routine you can actually perform — and reproduce on your own.

## 这是什么 / What it is

多数人看过护肤教程，却没真正学会。SkinPilot AI 解决从“看过”到“独立完成”之间的断层：

**Watch → Understand → Personalize → Practice → Complete → Review → Reuse**

Most people watch skincare tutorials but never learn to do the routine themselves. SkinPilot AI closes that gap with a guided, personalised practice loop and honest measurement of whether the user really learned it.

## 核心设计 / Key ideas

- **Source vs. inference / 来源与推断分开：** 每一步都标明是“教程明确说了”还是“AI 推断”。不编造产品、成分或时间戳。
- **Personalised / 个性化：** 按肤质、敏感程度、预算、已有产品，把步骤标为“用已有 / 可跳过 / 需补齐”。只推荐产品类别，不显示未经验证的价格。
- **Guided Practice / 逐步跟练：** AI 导师（Leo / Mia）只在当前步骤范围内回答，五个动作：*I've done it*、*I don't understand*、*Why this step?*、*Can I skip this?*、*What if I don't have this product?*
- **Honest progress / 如实记录掌握程度：** 三档完成度——自报完成、理解测试通过、独立复现。只有“测试全对 + 独立完成”才计入独立完成率。
- **Safety / 安全：** 不做医学诊断；出现疼痛、红疹、灼烧时建议停用并咨询医生或药师。

## 当前状态 / Status

**可在线体验（`docs/index.html`）：** 完整的前端交互流程——导师选择、个性化、跟练、理解测试、进度页。教程、导师回答、测试题均为**预置演示数据**，页面上已标注。

**已编码的完整版（Next.js + Supabase + OpenAI）：** 文字教程 → 结构化步骤、邮箱登录、按用户落库（RLS）、AI 教练问答、AI 理解测试、学习 Dashboard、数据库 Schema、单元测试。
已通过单元测试和类型检查；**尚未在真实 Supabase / OpenAI 环境中做端到端验证。**

**未实现（占位）：** 视频 / 链接 / 截图解析、RAG 知识库与真实来源（Reference、Source URL、证据等级）、产品成分库、摄像头实时指导、完整的 Tailwind / shadcn 界面。

## 下一步 / Roadmap

知识库 RAG（带来源与证据等级）→ 视频异步解析 → Onboarding 与产品落库 → 界面升级。
