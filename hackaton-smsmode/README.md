# Hackaton smsmode - Generateur OTP RCS

Backend NestJS permettant de generer et verifier des codes OTP envoyes via l'API RCS smsmode.

Le projet utilise MongoDB pour stocker l'etat d'une demande OTP par numero de telephone, avec une limitation du nombre de generations par telephone.

## Stack

- NestJS
- TypeScript
- MongoDB avec Mongoose
- smsmode RCS API
- Docker Compose
- Swagger sur `/api`

## Installation

```bash
npm install
```

Copier le fichier d'exemple puis renseigner les valeurs:

```bash
cp .env.example .env
```

Variables attendues:

```env
PORT=3000
MONGODB_URI=mongodb://mongo:27017/smsMode
OTP_TTL_SECONDS=300
MAX_ATTEMPTS=3
SMSMODE_API_URL=https://rest.smsmode.com/rcs/v1/messages
SMSMODE_SENDER_ID=<sender-id>
SMSMODE_API_KEY=<smsmode-api-key>
NGROK_AUTHTOKEN=<your_ngrok_auth_token>
NGROK_REMOTE_ADDR=
NGROK_TARGET_HOST=host.docker.internal
NGROK_TARGET_PORT=27017
```

## Lancer le projet

En local:

```bash
npm run start:dev
```

Avec Docker Compose:

```bash
docker compose up
```

Commandes utiles:

```bash
npm run build
npm run test
npm run test:e2e
```

## API

### `POST /otp/generate`

Genere un code OTP a 6 chiffres et l'envoie par RCS au numero fourni.

Body:

```json
{
  "phone": "33*********"
}
```

Comportement:

- genere un OTP avec `crypto.randomInt(100000, 1000000)`;
- stocke le hash SHA-256 de l'OTP;
- calcule une expiration avec `OTP_TTL_SECONDS`;
- applique une limitation par telephone et ip;
- enregistre l'OTP et les compteurs en base;
- envoie le message via smsmode.

### `POST /otp/verify`

Verifie le code OTP fourni pour un numero.

Body:

```json
{
  "phone": "33*********",
  "code": "123456"
}
```

Comportement:

- recherche l'OTP associe au numero;
- refuse et supprime un OTP expire;
- bloque apres `MAX_ATTEMPTS` echecs;
- incremente le compteur d'echecs si le code est incorrect;
- supprime l'OTP si la verification reussit.

### Endpoints de debug

- `GET /otp`: liste les OTP stockes.
- `DELETE /otp`: supprime les OTP stockes.

Ces routes sont utiles pendant le hackathon, mais doivent etre protegees ou supprimees avant une mise en production.

## Securite

Cette section decrit l'etat reel du projet. Certaines protections importantes ont ete identifiees, mais toutes n'ont pas ete implementees pendant le hackathon.

### Protections implementees

- Generation de l'OTP avec `crypto.randomInt`, plus adapte que `otplib`.
- Stockage du hash SHA-256 de l'OTP, pas du code en clair.
- OTP transmis dans le body des requetes, pas dans l'URL.
- Secrets smsmode charges depuis les variables d'environnement.
- Expiration logique via le champ `expiresAt`.
- Limitation de generation par numero:
  - pas de nouveau code si un OTP non expire existe deja;
  - maximum 5 generations par heure pour le meme numero.
- Limitation de generation par IP:
  - maximum 20 demandes par heure pour une meme IP;
  - blocage temporaire de 15 minutes en cas de depassement.
- Limitation des tentatives de verification avec `MAX_ATTEMPTS`.
- Suppression de l'OTP apres verification reussie.
- Anti-rejeu basique: l'OTP est supprime de la base apres une verification reussie.
- DTOs avec validation basique sur les champs `phone` et `code`.

### Limites connues

- Il n'y a pas encore d'index TTL MongoDB pour supprimer automatiquement les OTP expires.
- Le rate limit est base sur le document MongoDB du numero, pas sur Redis ni sur une solution distribuee.
- Il n'y a pas de detection VPN/proxy/TOR.
- Il n'y a pas de CAPTCHA ni de pre-verification email.
- Il n'y a pas encore d'allowlist geographique des pays.
- Les messages d'erreur restent parfois explicites, ce qui peut aider au debug mais n'est pas ideal en production.

### Ameliorations recommandees

- Ajouter un index TTL sur `expiresAt`.
- Ajouter un rate limit par numero ressemblants.
- Masquer ou uniformiser les messages d'erreur.
- Proteger ou supprimer les endpoints de debug.
- Ajouter une configuration CORS stricte.
- Ajouter des tests unitaires sur les cas de securite: rate limit, expiration, mauvais code, nombre maximal de tentatives.

## Notes de developpement

Swagger est disponible sur:

```text
http://localhost:3000/api
```

Le projet est encore en phase hackathon. La priorite a ete de livrer un flux OTP fonctionnel avec quelques protections cote serveur, tout en gardant une liste claire des limites de securite restantes.
