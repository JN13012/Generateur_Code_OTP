## Sécurité

### Défense en profondeur (Defense in Depth)

Toutes les données provenant du client sont considérées comme non fiables.

Les contrôles de sécurité critiques sont systématiquement réalisés côté serveur afin d'empêcher tout contournement via le navigateur, Postman, curl ou un proxy HTTP.

---

### Menaces prises en compte

* Brute force                    => Rate limiting
* Rejeu                          => Invalidation immédiate de l'OTP après validation (`used = true`)
* Expiration d'OTP               => Vérification du TTL (`expiresAt`) côté serveur
* Spam de génération d'OTP       => Rate limiting par IP et par numéro de téléphone
* IDOR                           => hash des objets, Vérification conjointe de `requestId` et `phone`
* Injection NoSQL                => Validation stricte des entrées et schémas Mongoose
* Injection XSS                  => Échappement des données utilisateur avant affichage
* Compromission de la base       => Stockage du hash OTP uniquement
* Prédiction d'OTP               => Génération via `crypto.randomInt()`
* Fuite de clé API               => Stockage des secrets dans des variables d'environnement (`.env`)
* Entrées malformées             => Validation stricte des formats (`phone`, `OTP`, `UUID`)
* Fuite d'informations           => Messages d'erreur génériques
* Contournement du frontend      => Toutes les validations sont refaites côté backend

---

### Politique de rate limiting et de blocage

#### `/otp/generate`

Afin de limiter le spam et l'abus de l'API RCS :

* maximum `1` génération d'OTP par minute pour un même numéro ;
* maximum `5` générations d'OTP par heure pour un même numéro ;
* maximum `20` générations d'OTP par heure pour une même adresse IP ;
* blocage temporaire de `15 minutes` en cas de dépassement.

#### `/otp/verify`

Afin de limiter les attaques par brute force :

* maximum `3` tentatives de vérification par OTP ;
* après `3` échecs, l'OTP est invalidé ;
* maximum `10` tentatives de vérification par heure pour un même numéro ;
* maximum `10` tentatives de vérification par heure pour une même adresse IP ;
* blocage temporaire de `30 minutes` après dépassement des seuils.

#### Blocage temporaire

Un système de blocage temporaire est appliqué en cas de comportement abusif :

* spam de génération d'OTP ;
* trop grand nombre d'échecs de vérification ;
* requêtes malformées répétées ;
* incohérences répétées entre `requestId` et `phone`.

Le blocage reste temporaire afin d'éviter qu'un attaquant puisse provoquer un déni de service sur un utilisateur légitime.

---

### Sécurité HTTP

* Aucun OTP n'est transmis dans l'URL ou les paramètres de requête.
* Les données sensibles sont transmises uniquement dans le corps (`body`) des requêtes HTTP.
* Vérification du header `Content-Type: application/json`.
* Configuration CORS restrictive.
* Ajout de headers de sécurité via Helmet.
* Utilisation de HTTPS en environnement de production.

---

### Journalisation et détection d'abus

Les événements suspects sont journalisés sans enregistrer de données sensibles :

* nombre anormal de requêtes ;
* erreurs répétées ;
* tentatives sur des `requestId` inexistants ;
* tentatives de réutilisation d'un OTP ;
* dépassement des seuils de rate limiting.

Les éléments suivants ne sont jamais enregistrés dans les logs :

* OTP en clair ;
* hash OTP ;
* clé API smsmode ;
* secrets applicatifs.

---

### Sécurité de `/otp/generate`

L'endpoint `/otp/generate` applique les contrôles suivants :

* validation du numéro de téléphone côté serveur ;
* application de la politique de rate limiting ;
* génération de l'OTP via `crypto.randomInt()` ;
* stockage du hash OTP uniquement ;
* aucun retour de l'OTP dans la réponse API ;
* utilisation de la clé API smsmode exclusivement côté backend.

---

### Sécurité de `/otp/verify`

L'endpoint `/otp/verify` applique les contrôles suivants :

* validation du format du numéro de téléphone ;
* validation du format de l'OTP ;
* validation du format du `requestId` ;
* vérification de l'existence de la demande OTP ;
* vérification de la correspondance entre `requestId` et `phone` ;
* vérification de l'expiration (`expiresAt`) ;
* vérification que l'OTP n'a pas déjà été utilisé ;
* vérification du nombre maximal de tentatives autorisées ;
* comparaison entre l'OTP fourni et le hash stocké ;
* incrémentation du compteur de tentatives en cas d'échec ;
* invalidation immédiate de l'OTP après validation ;
* réponses d'erreur génériques afin d'éviter les fuites d'information.
