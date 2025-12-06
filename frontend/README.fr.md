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
- **API Backend** en cours d'exécution sur `http://localhost:5101`

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/arrighiMonoRepoOfficial.git
cd arrighiMonoRepoOfficial/frontend
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres :

```env
NEXT_PUBLIC_API_URL=http://localhost:5101/api
OPENAI_API_KEY=votre-cle-openai
```

### 4. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── api/                # Routes API
│   │   │   ├── ai/             # Points de terminaison IA
│   │   │   └── portal-cliente/ # APIs du Portail Client
│   │   ├── boletos/            # Page des factures
│   │   ├── cadastros/          # Inscriptions (Personne Physique/Morale)
│   │   ├── clientes/           # Gestion des clients
│   │   ├── contratos/          # Gestion des contrats
│   │   ├── dashboard/          # Tableau de bord et finances
│   │   ├── portal-cliente/     # Portail Client
│   │   └── usuarios/           # Gestion des utilisateurs
│   │
│   ├── components/             # Composants React
│   │   ├── boletos/            # Composants de factures
│   │   ├── forms/              # Formulaires
│   │   ├── guards/             # Gardes de route
│   │   ├── historico/          # Historique des clients
│   │   └── permissions/        # Composants de permission
│   │
│   ├── contexts/               # Contextes React
│   │   ├── AuthContext.tsx     # Authentification principale
│   │   └── ClienteAuthContext.tsx # Auth du Portail
│   │
│   ├── hooks/                  # Hooks Personnalisés
│   │   ├── useClientes.ts
│   │   ├── useContratos.ts
│   │   ├── useBoletos.ts
│   │   └── ...
│   │
│   ├── lib/                    # Utilitaires et configurations
│   ├── services/               # Services API
│   ├── types/                  # Définitions TypeScript
│   └── theme/                  # Configuration du thème
│
├── public/                     # Fichiers statiques
├── .env                        # Variables d'environnement
├── next.config.ts              # Configuration Next.js
├── tailwind.config.js          # Configuration Tailwind
└── package.json
```

---

## 📜 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarrer le serveur de développement |
| `pnpm build` | Compiler pour la production |
| `pnpm start` | Démarrer le serveur de production |
| `pnpm lint` | Exécuter le linting du code |
| `pnpm type-check` | Vérifier les types TypeScript |

---

## 🔐 Variables d'Environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | ✅ |
| `OPENAI_API_KEY` | Clé API OpenAI | Pour l'IA |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry | Pour la surveillance |

---

## 🌐 Déploiement

### Vercel (Recommandé)

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

## 📄 Licence

Ce projet est propriétaire et réservé à l'usage exclusif d'Arrighi Advogados.

---

<div align="center">

**Développé avec ❤️ pour Arrighi Advogados**

</div>

