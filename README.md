# 🏠 DecoAndCo - Décoration d'Intérieur Premium au Maroc

Site web moderne et responsive pour DecoAndCo, spécialiste en décoration d'intérieur au Maroc.

## Fonctionnalités

- **Design Responsive** : Optimisé pour tous les appareils (mobile, tablette, desktop)
- **Navigation Fluide** : Défilement fluide entre les sections
- **Portfolio Interactif** : Filtrage des projets par catégorie
- **Formulaire de Contact** : Intégration avec Brevo pour l'envoi d'emails automatisés
- **Animations** : Effets visuels modernes et micro-interactions
- **Performance** : Code optimisé pour un chargement rapide
- **Assets Locaux** : Toutes les images sont hébergées localement pour de meilleures performances

## Structure du Projet

```
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── script.js           # JavaScript interactif
├── public/
│   └── images/         # Images locales du site
├── api/
│   └── send-email.js   # API pour l'envoi d'emails via Brevo
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

## Configuration Brevo (ex-Sendinblue)

Pour activer l'envoi d'emails automatisés via le formulaire de contact :

1. Créez un compte sur [Brevo](https://www.brevo.com/)
2. Obtenez votre clé API depuis le dashboard Brevo (Paramètres > Clés API)
3. Configurez les variables d'environnement dans `.env` :
   ```
   BREVO_API_KEY=votre_cle_api_brevo
   FROM_EMAIL=noreply@decoandco.ma
   TO_EMAIL=contact@decoandco.ma
   COMPANY_NAME=DecoAndCo
   ```

### Fonctionnalités Email

- **Email de notification** : Envoyé à l'équipe DecoAndCo avec tous les détails de la demande
- **Email de confirmation** : Envoyé automatiquement au client pour confirmer la réception
- **Design responsive** : Emails optimisés pour tous les appareils
- **Fallback** : Ouverture du client email en cas de problème de connexion

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
- **Brevo API** : Service d'envoi d'emails transactionnels
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