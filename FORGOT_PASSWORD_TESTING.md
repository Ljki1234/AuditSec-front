# Test du Flux de Mot de Passe Oublié

## Vue d'ensemble

Le système de mot de passe oublié a été implémenté selon les spécifications de votre backend. Il utilise un code à 6 chiffres au lieu d'un token traditionnel et affiche les 3 étapes dans le même composant.

## Flux d'Utilisation

### 1. Demande de Réinitialisation
- L'utilisateur va sur `/forgot-password`
- Il saisit son email
- Le système envoie une requête `POST /api/auth/forgot-password` avec l'email
- L'utilisateur reçoit un email avec un code à 6 chiffres

### 2. Vérification du Code
- L'utilisateur saisit le code reçu par email
- Le code est validé (exactement 6 chiffres)
- Possibilité de renvoyer le code si nécessaire

### 3. Réinitialisation du Mot de Passe
- L'utilisateur saisit son nouveau mot de passe
- Il confirme le nouveau mot de passe
- Le système envoie une requête `POST /api/auth/reset-password/code` avec :
  - `email`: l'email de l'utilisateur
  - `code`: le code à 6 chiffres reçu
  - `newPassword`: le nouveau mot de passe

## Comment Tester

### Prérequis
1. Assurez-vous que votre backend est en cours d'exécution sur `http://localhost:8080`
2. Configurez Mailtrap ou un autre service d'email pour recevoir les emails de test

### Étapes de Test

#### Test 1: Demande de Code
1. Allez sur `http://localhost:4200/forgot-password`
2. Vérifiez que vous voyez les 3 étapes avec l'étape 1 active
3. Saisissez un email valide (ex: `test@example.com`)
4. Cliquez sur "Envoyer le code"
5. Vérifiez que vous recevez un email avec un code à 6 chiffres
6. Vérifiez que vous passez à l'étape 2 (Code)

#### Test 2: Vérification du Code
1. Sur l'étape 2, saisissez le code reçu par email
2. Vérifiez que le code doit contenir exactement 6 chiffres
3. Cliquez sur "Vérifier le code"
4. Vérifiez que vous passez à l'étape 3 (Nouveau mot de passe)
5. Testez le bouton "Renvoyer le code" si nécessaire

#### Test 3: Saisie du Nouveau Mot de Passe
1. Sur l'étape 3, saisissez un nouveau mot de passe (minimum 8 caractères)
2. Confirmez le nouveau mot de passe
3. Vérifiez que les mots de passe doivent correspondre
4. Cliquez sur "Réinitialiser le mot de passe"
5. Vérifiez que vous passez à l'étape 4 (Succès)

#### Test 4: Test de Connexion
1. Allez sur la page de connexion
2. Connectez-vous avec l'email et le nouveau mot de passe
3. Vérifiez que la connexion fonctionne

### Tests d'Erreur

#### Test d'Email Invalide
1. Saisissez un email qui n'existe pas dans votre système
2. Vérifiez que vous recevez le message d'erreur approprié

#### Test de Code Invalide
1. Saisissez un code incorrect (moins de 6 chiffres ou avec des lettres)
2. Vérifiez que vous recevez le message d'erreur approprié

#### Test de Code Expiré
1. Attendez que le code expire (selon votre configuration backend)
2. Essayez d'utiliser le code expiré
3. Vérifiez que vous recevez le message d'erreur approprié

#### Test de Renvoi de Code
1. Sur l'étape 2, cliquez sur "Renvoyer le code"
2. Vérifiez qu'un nouveau code est envoyé
3. Vérifiez que l'ancien code n'est plus valide

## Configuration Backend

Assurez-vous que votre backend implémente ces endpoints :

### POST /api/auth/forgot-password
```json
{
  "email": "user@example.com"
}
```

**Réponse attendue :**
- Code 200 si l'email existe
- Code 404 si l'email n'existe pas
- Code 429 si trop de tentatives

### POST /api/auth/reset-password/code
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "nouveauMotDePasse123!"
}
```

**Réponse attendue :**
- Code 200 si la réinitialisation réussit
- Code 400 si le code est invalide ou expiré
- Code 404 si l'email n'existe pas

## Fonctionnalités Implémentées

✅ **Interface en 3 étapes** avec indicateur de progression visuel  
✅ **Étape 1** : Formulaire de saisie d'email avec validation  
✅ **Étape 2** : Saisie du code à 6 chiffres avec validation  
✅ **Étape 3** : Saisie et confirmation du nouveau mot de passe  
✅ **Validation du code** : exactement 6 chiffres  
✅ **Validation du mot de passe** : minimum 8 caractères  
✅ **Confirmation du mot de passe** avec validation de correspondance  
✅ **Gestion des erreurs** avec messages appropriés selon les codes HTTP  
✅ **Bouton de renvoi de code**  
✅ **Indicateur de progression** avec étapes actives/complétées  
✅ **Interface utilisateur responsive** et moderne  
✅ **Support du thème sombre**  

## Sécurité

- Le code expire après 10 minutes (configurable dans le backend)
- Limitation du nombre de tentatives de renvoi de code
- Validation côté client et côté serveur
- Messages d'erreur génériques pour éviter l'énumération d'emails

## Support

Si vous rencontrez des problèmes ou avez des questions, vérifiez :
1. Les logs de la console du navigateur
2. Les logs de votre backend
3. La configuration de votre service d'email
4. Les paramètres de sécurité de votre backend

## Notes Techniques

- Le composant utilise `currentStep` pour gérer l'affichage des différentes étapes
- Chaque étape a son propre formulaire avec validation
- L'interface s'adapte automatiquement selon l'étape actuelle
- Les étapes précédentes sont marquées comme "completed" visuellement
