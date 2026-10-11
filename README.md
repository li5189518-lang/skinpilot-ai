# SkinPilot AI (MVP 骨架)
## 启动
1. `npm install`
3. `npm run dev` 
4. `npm test`
## Supabase
在 SQL Editor 执行 `supabase/schema.sql`（含 RLS）。
## 已实现 / 未实现
- 已实现：AI 生成理解测试（2 题，三档完成度由服务端判定）、学习 Dashboard（/dashboard）、邮箱魔法链接登录（Supabase Auth）、解析结果按用户落库（RLS 生效）、文字教程 → 结构化步骤（服务端 OpenAI，zod 校验）、规则式个性化、跟练页（逐步、计时、AI 教练问答，完成记录写入 practice_sessions）、数据库 Schema、基础单元测试
- 未实现（占位）：Onboarding 落库、预算、真实知识库、视频异步解析、RAG 知识库、Tailwind/shadcn UI
- 原型 UI 参考：skinpilot.html
## 下一步
知识库 RAG → 视频任务队列

## 在线演示（GitHub Pages）
`docs/index.html` 是纯前端交互原型（预置演示数据，非真实 AI 分析）。
仓库 Settings → Pages → Source 选 `Deploy from a branch`，Branch 选 `main` + `/docs`。
Next.js 完整版需要服务端，GitHub Pages 无法运行，请部署到 Vercel 等平台，并在平台环境变量中配置 `.env.example` 里的各项（不要提交 `.env.local`）。
