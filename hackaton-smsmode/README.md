<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

Create a `.env` file from `.env.example` and set `MONGODB_URI` before running the app.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

---

## Sécurité

### Défense en profondeur (Defense in Depth)

Toutes les données provenant du client sont considérées comme non fiables.

Les contrôles de sécurité critiques sont systématiquement réalisés côté serveur afin d'empêcher tout contournement via le navigateur, Postman, curl ou un proxy HTTP.


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


### Sécurité HTTP

* Aucun OTP n'est transmis dans l'URL ou les paramètres de requête.
* Les données sensibles sont transmises uniquement dans le corps (`body`) des requêtes HTTP.
* Vérification du header `Content-Type: application/json`.
* Configuration CORS restrictive.
* Ajout de headers de sécurité via Helmet.
* Utilisation de HTTPS en environnement de production.

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

### Sécurité de `/otp/generate`

L'endpoint `/otp/generate` applique les contrôles suivants :

* validation du numéro de téléphone côté serveur ;
* application de la politique de rate limiting ;
* génération de l'OTP via `crypto.randomInt()` ;
* stockage du hash OTP uniquement ;
* aucun retour de l'OTP dans la réponse API ;
* utilisation de la clé API smsmode exclusivement côté backend.


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

---

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
