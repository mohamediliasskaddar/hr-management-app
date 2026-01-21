
# Installation & Test du Projet (Backend HR Management)

##  Prérequis


Vérification :

```bash
node -v
npm -v
mongo --version
git --version
```

---

## 1️ Cloner le projet depuis GitHub

```bash
git clone https://github.com/mohamediliasskaddar/hr-management-app.git
```

```bash
cd hr-managemnet-app
```

---

##  2️ Installer les dépendances

```bash
npm install
```


##  3️ Configuration des variables d’environnement

À la racine du projet, créer un fichier **`.env`** :

```env
NODE_ENV=development
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/hr_app

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
```

##  4️ Démarrer MongoDB

### Option A – MongoDB local

```bash
mongod
```
or mongosh if u have mogosh CLI

##  5️ Lancer le serveur

### Mode développement (avec nodemon)

```bash
npm run dev
```
or node src/server.js 

Si tout est OK, tu verras :

```bash
Server running on port 3000
MongoDB connected
```

---

##  6️ Accéder à Swagger (API Documentation)

Ouvrir le navigateur :

```
http://localhost:3000/api-docs
```

✔ Tu verras toutes les routes documentées
✔ Auth, Absences, Leaves, Announcements, Notifications, etc.

---

##  7️ Tester les APIs avec Swagger

### Étape 1 : Login

1. Aller dans **Auth → POST /api/auth/login**
2. Renseigner :

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

3. Copier le **token JWT**

---

### Étape 2 : Autoriser Swagger

1. Cliquer sur **Authorize**
2. Coller :

```
Bearer <TOKEN_ICI>
```

3. Valider

---

### Étape 3 : Tester les routes

Tu peux maintenant tester :

* `/api/announcements`
* `/api/absences`
* `/api/leaves`
* `/api/employees`
* `/api/notifications`

Swagger gère automatiquement l’authentification.

---

