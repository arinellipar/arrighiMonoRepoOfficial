# CRM Judiciário Arrighi

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MUI](https://img.shields.io/badge/MUI-7.3-007FFF?style=for-the-badge&logo=mui)

**Système de Gestion de la Relation Client pour le Secteur Juridique**

[English](./README.en.md) | Français | [Português](./README.md)

</div>

---

## 📋 Table des Matières

- [À Propos du Projet](#-à-propos-du-projet)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Structure du Projet](#-structure-du-projet)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables d'Environnement](#-variables-denvironnement)
- [Déploiement](#-déploiement)

---

## 🎯 À Propos du Projet

**CRM Judiciário Arrighi** est une solution complète de gestion de la relation client développée spécifiquement pour les cabinets d'avocats et les départements juridiques. Le système offre une interface moderne et intuitive pour gérer les clients, les contrats, les factures, les consultants et bien plus encore.

### Principaux Atouts

- 🤖 **Analyse de Contrats par IA** - Intégration avec GPT-4 via LangChain pour l'analyse intelligente des contrats
- 🌙 **Design Premium Sombre** - Interface élégante avec thème sombre et accents dorés
- 📊 **Tableau de Bord Analytique** - Visualisation des données en temps réel
- 🔐 **Portail Client** - Espace exclusif pour les clients pour accéder à leurs données
- 📱 **Responsive** - Fonctionne parfaitement sur ordinateur, tablette et mobile

---

## ✨ Fonctionnalités

### Gestion des Clients
- Inscription des Personnes Physiques et Morales
- Historique complet des interactions
- Recherche automatique du code postal avec remplissage automatique de l'adresse

### Gestion des Contrats
- Création et suivi des contrats
- Statuts : Actif, Inactif, En Attente, Annulé, Soldé
- Filtres par filiale, consultant et statut
- Analyse des contrats avec Intelligence Artificielle

### Gestion Financière
- Contrôle des factures
- Cartes de facturation
- Analyse du risque de défaut de paiement
- Prévisions financières

### Portail Client
- Connexion sécurisée avec CPF/CNPJ et mot de passe
- Visualisation des contrats
- Suivi des paiements
- Accès aux documents

### Administration
- Gestion des utilisateurs et des permissions
- Contrôle des sessions actives
- Groupes d'accès par filiale

---

## 🛠 Technologies

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| Next.js | 16.0.7 | Framework React avec SSR |
| React | 19.2.1 | Bibliothèque UI |
| TypeScript | 5.9 | Typage statique |
| Tailwind CSS | 3.4 | Framework CSS utilitaire |
| MUI | 7.3 | Composants Material Design |
| Framer Motion | 12.23 | Animations |
| TanStack Query | 5.62 | Gestion de l'état serveur |

### Backend
| Technologie | Description |
|-------------|-------------|
| .NET Core | Framework pour APIs |
| C# | Langage de programmation |
| Entity Framework | ORM pour base de données |
| SQL Server | Base de données |

### Intelligence Artificielle
| Technologie | Description |
|-------------|-------------|
| LangChain | Framework pour applications LLM |
| OpenAI GPT-4 | Modèle de langage pour l'analyse |

### Outils
| Technologie | Description |
|-------------|-------------|
| pnpm | Gestionnaire de paquets |
| ESLint | Linting du code |
| Sentry | Surveillance des erreurs |
| Vercel Analytics | Analyse des performances |

---

## 📦 Prérequis

- **Node.js** 18.17 ou supérieur
- **pnpm** 10.x (recommandé) ou npm/yarn
- **.NET 8** ou supérieur (pour le backend)
- **SQL Server** (pour la base de données)

---

## 🚀 Installation

### Frontend

#### 1. Naviguer vers le répertoire frontend

```bash
cd frontend
```

#### 2. Installer les dépendances

```bash
pnpm install
```

#### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres :

```env
NEXT_PUBLIC_API_URL=http://localhost:5101/api
OPENAI_API_KEY=votre-cle-openai
```

#### 4. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Backend

#### 1. Naviguer vers le répertoire backend

```bash
cd backend
```

#### 2. Restaurer les paquets

```bash
dotnet restore
```

#### 3. Exécuter les migrations

```bash
dotnet ef database update
```

#### 4. Lancer le serveur

```bash
dotnet run
```

L'API sera disponible sur `http://localhost:5101`.

---

## 📁 Structure du Projet

```
arrighiMonoRepoOfficial/
├── frontend/                   # Application Next.js
│   ├── src/
│   │   ├── app/                # Routes Next.js (App Router)
│   │   │   ├── api/            # Routes API
│   │   │   ├── boletos/        # Page des factures
│   │   │   ├── cadastros/      # Inscriptions (Personne Physique/Morale)
│   │   │   ├── clientes/       # Gestion des clients
│   │   │   ├── contratos/      # Gestion des contrats
│   │   │   ├── dashboard/      # Tableau de bord et finances
│   │   │   ├── portal-cliente/ # Portail Client
│   │   │   └── usuarios/       # Gestion des utilisateurs
│   │   │
│   │   ├── components/         # Composants React
│   │   ├── contexts/           # Contextes React
│   │   ├── hooks/              # Hooks Personnalisés
│   │   ├── lib/                # Utilitaires
│   │   ├── services/           # Services API
│   │   ├── types/              # Définitions TypeScript
│   │   └── theme/              # Configuration du thème
│   │
│   ├── public/                 # Fichiers statiques
│   └── package.json
│
├── backend/                    # API .NET Core
│   ├── Controllers/            # Contrôleurs API
│   ├── Data/                   # Contexte de base de données
│   ├── Migrations/             # Migrations EF
│   ├── Models/                 # Modèles de données
│   ├── Services/               # Services métier
│   └── Program.cs              # Point d'entrée
│
├── README.md                   # Documentation (PT-BR)
├── README.en.md                # Documentation (English)
└── README.fr.md                # Documentation (Français)
```

---

## 📜 Scripts Disponibles

### Frontend

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarrer le serveur de développement |
| `pnpm build` | Compiler pour la production |
| `pnpm start` | Démarrer le serveur de production |
| `pnpm lint` | Exécuter le linting du code |
| `pnpm type-check` | Vérifier les types TypeScript |

### Backend

| Commande | Description |
|----------|-------------|
| `dotnet run` | Démarrer le serveur |
| `dotnet build` | Compiler le projet |
| `dotnet ef database update` | Appliquer les migrations |
| `dotnet test` | Exécuter les tests |

---

## 🔐 Variables d'Environnement

### Frontend

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | ✅ |
| `OPENAI_API_KEY` | Clé API OpenAI | Pour l'IA |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry | Pour la surveillance |

### Backend

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `ConnectionStrings__DefaultConnection` | Chaîne de connexion SQL Server | ✅ |
| `JWT__Secret` | Clé secrète JWT | ✅ |

---

## 🌐 Déploiement

### Frontend - Vercel (Recommandé)

```bash
cd frontend
pnpm build
vercel deploy --prod
```

### Frontend - Docker

```bash
cd frontend
docker build -t crm-juridico-frontend .
docker run -p 3000:3000 crm-juridico-frontend
```

### Backend - Docker

```bash
cd backend
docker build -t crm-juridico-backend .
docker run -p 5101:5101 crm-juridico-backend
```

---

## 📄 Licence

Ce projet est propriétaire et réservé à l'usage exclusif d'Arrighi Advogados.

---

<div align="center">

**Développé avec ❤️ pour Arrighi Advogados**

</div>

