# DecoAndCo - Décoration d'Intérieur Premium au Maroc

Site web moderne et responsive pour DecoAndCo, spécialiste en décoration d'intérieur au Maroc.

## Fonctionnalités

- **Design Responsive** : Optimisé pour tous les appareils (mobile, tablette, desktop)
- **Navigation Fluide** : Défilement fluide entre les sections
- **Portfolio Interactif** : Filtrage des projets par catégorie
- **Formulaire de Contact** : Intégration avec Mailjet pour l'envoi d'emails
- **Animations** : Effets visuels modernes et micro-interactions
- **Performance** : Code optimisé pour un chargement rapide

## Structure du Projet

```
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── script.js           # JavaScript interactif
├── api/
│   └── send-email.js   # API pour l'envoi d'emails via Mailjet
├── package.json        # Dépendances du projet
└── .env.example        # Variables d'environnement exemple
```

## Installation

1. Clonez le projet
2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Copiez `.env.example` vers `.env`
   - Ajoutez vos clés API Mailjet

4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Configuration Mailjet

Pour activer l'envoi d'emails via le formulaire de contact :

1. Créez un compte sur [Mailjet](https://www.mailjet.com/)
2. Obtenez vos clés API depuis le dashboard Mailjet
3. Configurez les variables d'environnement dans `.env` :
   ```
   MAILJET_API_KEY=votre_cle_api
   MAILJET_SECRET_KEY=votre_cle_secrete
   FROM_EMAIL=noreply@decoandco.ma
   TO_EMAIL=contact@decoandco.ma
   ```

## Sections du Site

- **Accueil** : Hero section avec présentation
- **Services** : Nos différents services de décoration
- **Portfolio** : Galerie de nos réalisations avec filtres
- **À Propos** : Présentation de l'entreprise et valeurs
- **Contact** : Formulaire de contact et informations

## Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec Flexbox et Grid
- **JavaScript ES6+** : Interactivité et animations
- **Mailjet API** : Service d'envoi d'emails
- **Font Awesome** : Icônes
- **Google Fonts** : Typographie (Inter)

## Déploiement

Le site peut être déployé sur n'importe quelle plateforme supportant les sites statiques :
- Netlify
- Vercel
- GitHub Pages
- Hébergement traditionnel

Pour le formulaire de contact, assurez-vous que votre plateforme supporte les fonctions serverless ou configurez un backend séparé.

## Contact

Pour toute question concernant le site web :
- Email : contact@decoandco.ma
- Téléphone : 06.00.90.84.67 / 07.53.23.64.14