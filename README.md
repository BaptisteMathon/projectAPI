# Projet API - README

Réalisé par Baptiste Mathon et Lucas Chabel

Présentation des auteurs:

    -Annonces : Baptiste 
    
    -User : Lucas
    
    -Oauth : Baptiste & Lucas
    

Description

Cette application permet aux utilisateurs de gérer des annonces. Elle inclut les fonctionnalités suivantes :

Création de compte utilisateur

Authentification utilisateur

L'utilisateur peut s'authentifier de deux manières :
a. Après avoir créé un compte (email unique obligatoire).
b. Sans créer de compte, en utilisant OAuth2 via Google ou GitHub.

Publication d'une annonce

Modification d'une annonce

Suppression d'une annonce

Consultation de la liste des annonces

Consultation des détails d'une annonce

Déconnexion de l'utilisateur

Technologies utilisées

Front-end : HTML, CSS

Back-end : Node.js, Express

Base de données : MongoDB

Authentification : Auth0, JWT

API : REST

Prérequis

Assurez-vous que les outils suivants sont installés sur votre machine :

Node.js (v16 ou supérieur)

MongoDB

Un navigateur web

Installation et configuration

Suivez les étapes ci-dessous pour configurer et exécuter l'application en local :

1. Clonez le dépôt
   
```
git clone https://github.com/BaptisteMathon/projectAPI.git

cd projectAPI
```

2. Installez les dépendances
```
npm install express mongoose jsonwebtoken bcryptjs dotenv cors etag path express-rate-limiter multer crypto axios nodemon
```

3. Configurez les variables d'environnement

Créez un fichier .env à la racine du projet avec les variables données dans le mail pour raison de sécurité.

4. Lancez MongoDB

Assurez-vous que votre instance MongoDB est en cours d'exécution.

5. Démarrez le serveur

npm start

Le serveur sera accessible sur ``` http://localhost:3000 ```.

Utilisation

1. Création d'un compte utilisateur

Naviguez vers /register et remplissez le formulaire d'inscription.

Vérifiez que l'email utilisé est unique.

2. Authentification utilisateur

Connectez-vous avec vos identifiants via /login ou utilisez un des boutons OAuth2 (Google, GitHub).

3. Gestion des annonces

Créer une annonce : Naviguez vers /ads/new et complétez le formulaire.

Modifier une annonce : Accédez à l'annonce souhaitée et cliquez sur "Modifier".

Supprimer une annonce : Accédez à l'annonce souhaitée et cliquez sur "Supprimer".

Consulter les annonces : Rendez-vous sur /ads pour voir la liste ou /ads/:id pour voir les détails.

4. Déconnexion

Cliquez sur le bouton "Déconnexion" pour terminer votre session.
