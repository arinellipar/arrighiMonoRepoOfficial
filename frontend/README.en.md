# CRM Judiciário Arrighi

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MUI](https://img.shields.io/badge/MUI-7.3-007FFF?style=for-the-badge&logo=mui)

**Customer Relationship Management System for the Legal Sector**

English | [Français](./README.fr.md) | [Português](./README.md)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

---

## 🎯 About the Project

**CRM Judiciário Arrighi** is a comprehensive customer relationship management solution developed specifically for law firms and legal departments. The system offers a modern and intuitive interface to manage clients, contracts, invoices, consultants, and much more.

### Key Differentiators

- 🤖 **AI Contract Analysis** - Integration with GPT-4 via LangChain for intelligent contract analysis
- 🌙 **Premium Dark Design** - Elegant interface with dark theme and gold accents
- 📊 **Analytical Dashboard** - Real-time data visualization
- 🔐 **Client Portal** - Exclusive area for clients to access their data
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile

---

## ✨ Features

### Client Management
- Registration of Individuals and Legal Entities
- Complete interaction history
- Automatic ZIP code lookup with address autofill

### Contract Management
- Contract creation and tracking
- Status: Active, Inactive, Pending, Cancelled, Paid Off
- Filters by branch, consultant, and status
- Contract analysis with Artificial Intelligence

### Financial Management
- Invoice control
- Billing maps
- Default risk analysis
- Financial forecasting

### Client Portal
- Secure login with CPF/CNPJ and password
- Contract viewing
- Payment tracking
- Document access

### Administration
- User and permission management
- Active session control
- Branch-based access groups

---

## 🛠 Technologies

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Next.js | 16.0.7 | React framework with SSR |
| React | 19.2.1 | UI library |
| TypeScript | 5.9 | Static typing |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| MUI | 7.3 | Material Design components |
| Framer Motion | 12.23 | Animations |
| TanStack Query | 5.62 | Server state management |

### Artificial Intelligence
| Technology | Description |
|------------|-------------|
| LangChain | Framework for LLM applications |
| OpenAI GPT-4 | Language model for analysis |

### Tools
| Technology | Description |
|------------|-------------|
| pnpm | Package manager |
| ESLint | Code linting |
| Sentry | Error monitoring |
| Vercel Analytics | Performance analytics |

---

## 📦 Prerequisites

- **Node.js** 18.17 or higher
- **pnpm** 10.x (recommended) or npm/yarn
- **Backend API** running at `http://localhost:5101`

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/arrighiMonoRepoOfficial.git
cd arrighiMonoRepoOfficial/frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
NEXT_PUBLIC_API_URL=http://localhost:5101/api
OPENAI_API_KEY=your-openai-key
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js routes (App Router)
│   │   ├── api/                # API Routes
│   │   │   ├── ai/             # AI endpoints
│   │   │   └── portal-cliente/ # Client Portal APIs
│   │   ├── boletos/            # Invoices page
│   │   ├── cadastros/          # Registrations (Individual/Legal Entity)
│   │   ├── clientes/           # Client management
│   │   ├── contratos/          # Contract management
│   │   ├── dashboard/          # Dashboard and financials
│   │   ├── portal-cliente/     # Client Portal
│   │   └── usuarios/           # User management
│   │
│   ├── components/             # React components
│   │   ├── boletos/            # Invoice components
│   │   ├── forms/              # Forms
│   │   ├── guards/             # Route guards
│   │   ├── historico/          # Client history
│   │   └── permissions/        # Permission components
│   │
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Main authentication
│   │   └── ClienteAuthContext.tsx # Portal auth
│   │
│   ├── hooks/                  # Custom Hooks
│   │   ├── useClientes.ts
│   │   ├── useContratos.ts
│   │   ├── useBoletos.ts
│   │   └── ...
│   │
│   ├── lib/                    # Utilities and configurations
│   ├── services/               # API services
│   ├── types/                  # TypeScript definitions
│   └── theme/                  # Theme configuration
│
├── public/                     # Static files
├── .env                        # Environment variables
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run code linting |
| `pnpm type-check` | Check TypeScript types |

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | For AI |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | For monitoring |

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
pnpm build
vercel deploy --prod
```

### Docker

```bash
docker build -t crm-juridico .
docker run -p 3000:3000 crm-juridico
```

---

## 📄 License

This project is proprietary and for exclusive use by Arrighi Advogados.

---

<div align="center">

**Developed with ❤️ for Arrighi Advogados**

</div>

