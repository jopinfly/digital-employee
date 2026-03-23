# 数字员工平台

企业内部 AI 数字员工系统，基于 Next.js 15 构建，支持多模型切换、Agent 自主工具调用、流式对话与文件管理。

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![LangChain](https://img.shields.io/badge/LangChain-LangGraph-1C3C3C?logo=langchain)

---

## 功能特性

- **多模型支持** — OpenAI GPT-4o、Anthropic Claude 3.5、Google Gemini 1.5、DeepSeek V3/R1，对话中随时切换
- **Agent 模式** — 基于 LangGraph ReAct Agent，可自主调用联网搜索、计算器等工具完成复杂任务
- **流式输出** — Server-Sent Events 实时流式响应，支持 Markdown 渲染
- **账号管理** — 不开放注册，管理员登录后可新增/禁用账号
- **文件管理** — 上传文件至 Vercel Blob，支持在对话中引用分析
- **对话历史** — 自动保存所有会话，侧边栏快速切换

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript 5 |
| 认证 | NextAuth.js v5 (Credentials + JWT) |
| 数据库 | Neon (PostgreSQL) + Prisma ORM |
| 文件存储 | Vercel Blob |
| AI 层 | LangChain + LangGraph |
| 样式 | Tailwind CSS v3 |
| 部署 | Vercel |

## 项目结构

```
├── app/
│   ├── (auth)/login/          # 登录页
│   ├── (dashboard)/
│   │   ├── page.tsx           # 首页（Agent 入口卡片）
│   │   ├── chat/[id]/         # 聊天页
│   │   ├── files/             # 文件管理
│   │   └── admin/             # 用户管理（仅管理员）
│   └── api/
│       ├── auth/[...nextauth] # NextAuth 路由
│       ├── chat/              # 流式聊天接口
│       ├── conversations/     # 会话 CRUD
│       ├── files/             # 文件上传/删除
│       └── admin/users/       # 用户管理接口
├── components/
│   ├── layout/AppSidebar.tsx  # 可收起侧边栏
│   └── chat/                  # 聊天相关组件
├── lib/
│   ├── ai/
│   │   ├── agent.ts           # LangGraph Agent 流式封装
│   │   ├── models.ts          # 多模型配置
│   │   └── tools.ts           # Agent 工具定义
│   ├── db.ts                  # Prisma 客户端
│   └── blob.ts                # Vercel Blob 工具
├── prisma/
│   ├── schema.prisma          # 数据模型
│   └── seed.ts                # 初始管理员账号
├── auth.ts                    # NextAuth 配置
└── middleware.ts              # 路由鉴权
```

## 本地开发

### 前置条件

- Node.js 20+
- [Neon](https://neon.tech) 数据库（免费套餐即可）
- 至少一个 AI 模型的 API Key

### 1. 克隆并安装依赖

```bash
git clone git@github.com:jopinfly/digital-employee.git
cd digital-employee
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入以下必填项：

```env
# 必填：随机字符串，用于 JWT 签名
NEXTAUTH_SECRET=your-random-secret

# 必填：Neon 数据库连接串（在 Neon 控制台获取）
DATABASE_URL="postgresql://..."

# 必填：Vercel Blob Token（在 Vercel 项目设置中创建）
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# 至少填一个模型的 Key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIzaSy-...
DEEPSEEK_API_KEY=sk-...

# 可选：联网搜索（https://tavily.com 免费注册）
TAVILY_API_KEY=tvly-...

# 初始管理员账号（seed 时使用）
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Administrator
```

### 3. 初始化数据库

```bash
# 同步数据表结构到 Neon
npx prisma db push

# 创建初始管理员账号
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

使用 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 登录，在 **用户管理** 页面为其他员工创建账号。

## 支持的 AI 模型

| 模型 | 提供商 | 上下文窗口 | 工具调用 |
|------|--------|-----------|---------|
| GPT-4o | OpenAI | 128k | ✅ |
| GPT-4o Mini | OpenAI | 128k | ✅ |
| Claude 3.5 Sonnet | Anthropic | 200k | ✅ |
| Claude 3 Opus | Anthropic | 200k | ✅ |
| Gemini 1.5 Pro | Google | 1M | ✅ |
| Gemini 1.5 Flash | Google | 1M | ✅ |
| DeepSeek V3 | DeepSeek | 64k | ✅ |
| DeepSeek R1 | DeepSeek | 64k | — |

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在项目设置 → Environment Variables 中添加所有 `.env.example` 中列出的变量
4. 部署完成后执行数据库初始化：

```bash
# 本地执行，指向生产数据库
DATABASE_URL="<生产连接串>" npx prisma db push
DATABASE_URL="<生产连接串>" npm run db:seed
```

## 数据模型

```prisma
User          # 用户（email/password/role/isActive）
Conversation  # 对话（关联用户，记录所用模型）
Message       # 消息（role: user/assistant/system）
File          # 文件（Vercel Blob URL + 元数据）
```

## License

MIT
