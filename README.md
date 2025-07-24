# Tamboura - Constats d'Intervention Numériques

Une application web progressive (PWA) mobile-first destinée aux forces de l'ordre et services de secours pour remplacer les constats papier par un système numérique fiable, rapide et sécurisé.

## 🎯 Fonctionnalités

### ✅ Authentification & Rôles
- **Connexion sécurisée** par matricule + mot de passe
- **3 rôles** : Agent, Chef d'unité, Administrateur
- **Mode hors ligne** avec authentification locale
- **JWT** pour la sécurisation des sessions

### ✅ Création de Constats
- **Formulaire mobile-first** optimisé pour écrans 5 pouces
- **Types d'incidents** : Accident, Vol, Agression, Vandalisme, etc.
- **Géolocalisation** automatique et manuelle
- **Photos** : prise directe ou import depuis la galerie
- **Notes audio** : enregistrement intégré
- **Signature électronique** : agent et témoin
- **Personnes impliquées** : victimes, témoins, suspects

### ✅ Mode Hors Ligne
- **Stockage local** avec IndexedDB via LocalForage
- **Synchronisation automatique** dès retour de connexion
- **Indicateurs visuels** de statut de connexion et sync

### ✅ Export PDF
- **Génération automatique** de PDF professionnels
- **Logo et coordonnées** de l'organisation
- **Photos, signatures, géolocalisation** intégrées
- **Export local et cloud** disponibles

### ✅ Tableau de Bord
- **Statistiques personnalisées** selon le rôle
- **Constats récents** avec filtres
- **Graphiques** et métriques par zone/type/période
- **Vue d'ensemble** pour superviseurs et administrateurs

### ✅ Multi-langue
- **Français** et **Bambara** supportés
- **Interface adaptée** aux contextes locaux

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS (mobile-first)
- **Backend** : Supabase (PostgreSQL + Storage)
- **PWA** : Service Workers + Cache API
- **Offline** : LocalForage (IndexedDB)
- **PDF** : jsPDF + html2canvas
- **Maps** : Geolocation API
- **Icons** : Lucide React

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase (optionnel pour mode démo)

### Étapes

1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/tamboura-pwa.git
cd tamboura-pwa
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration environnement**
```bash
cp .env.example .env
# Modifier .env avec vos clés Supabase
```

4. **Lancer en développement**
```bash
npm run dev
```

5. **Build pour production**
```bash
npm run build
npm run preview
```

## 🔧 Configuration Supabase

### Tables SQL
```sql
-- Table des utilisateurs
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  matricule TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('agent', 'supervisor', 'admin')) NOT NULL,
  zone TEXT,
  unit TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Table des constats
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location JSONB NOT NULL,
  description TEXT NOT NULL,
  involved_persons JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  audio_notes JSONB DEFAULT '[]',
  agent_signature TEXT,
  witness_signature TEXT,
  status TEXT CHECK (status IN ('draft', 'pending', 'completed', 'signed')) DEFAULT 'draft',
  agent_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_synced BOOLEAN DEFAULT false,
  pdf_url TEXT
);
```

### Storage Buckets
- `photos` : Images des constats
- `audio` : Notes audio
- `signatures` : Signatures électroniques
- `pdfs` : Rapports PDF générés

## 📱 Utilisation

### Comptes de Démonstration
- **Agent** : `A001` / `demo123`
- **Chef d'unité** : `S001` / `demo123`
- **Administrateur** : `ADM001` / `demo123`

### Workflow Typique
1. **Connexion** avec matricule
2. **Nouveau constat** via bouton principal
3. **Remplissage** du formulaire d'intervention
4. **Ajout photos/audio** selon besoins
5. **Signature électronique** agent et témoin
6. **Validation** et génération PDF
7. **Synchronisation** automatique si en ligne

### Mode Hors Ligne
- Les constats sont **sauvegardés localement**
- **Indicateur visuel** en haut d'écran
- **Sync automatique** au retour de connexion
- **File d'attente** visible dans l'interface

## 🔒 Sécurité

### Authentification
- **JWT tokens** avec expiration
- **Hashage des mots de passe** (bcrypt en production)
- **Rôles et permissions** stricts
- **Sessions persistantes** sécurisées

### Données
- **Chiffrement** des données sensibles
- **Audit trail** des modifications
- **Verrouillage** des constats après signature
- **Backup automatique** vers le cloud

## 📊 Architecture

```
src/
├── components/           # Composants React
│   ├── auth/            # Authentification
│   ├── common/          # Composants réutilisables
│   ├── dashboard/       # Tableau de bord
│   ├── reports/         # Gestion des constats
│   ├── layout/          # Navigation et mise en page
│   └── admin/           # Administration
├── contexts/            # Contextes React (Auth, etc.)
├── services/            # Services (API, Storage, PDF)
├── types/               # Types TypeScript
├── lib/                 # Configuration (Supabase)
├── i18n/               # Internationalisation
└── utils/              # Utilitaires
```

## 🌐 Déploiement

### Vercel (Recommandé)
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Serveur traditionnel
```bash
npm run build
# Servir le dossier 'dist' avec nginx/apache
```

## 🔮 Roadmap

- [ ] **Notifications push** pour nouveaux constats
- [ ] **Synchronisation temps réel** entre agents
- [ ] **Module de rapports avancés** avec graphiques
- [ ] **Intégration cartographique** complète
- [ ] **API publique** pour intégrations tiers
- [ ] **Module de formation** intégré
- [ ] **Support iOS/Android** natif

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

- **Email** : support@tamboura.app
- **Documentation** : https://docs.tamboura.app
- **Issues** : https://github.com/votre-username/tamboura-pwa/issues

---

**Tamboura** - Moderniser les forces de l'ordre avec le numérique 🚔📱