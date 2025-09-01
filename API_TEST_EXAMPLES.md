# Exemples de Tests pour l'API des Statistiques de Vulnérabilités

## Vue d'ensemble

Ce document fournit des exemples de tests et d'utilisation de l'API des statistiques de vulnérabilités pour vérifier que l'intégration fonctionne correctement.

## Endpoints de l'API

### 1. Statistiques du Tableau de Bord
**GET** `/api/vulnerability-statistics/dashboard`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "total": 47,
    "xss": 12,
    "sqlInjection": 8,
    "csrf": 5,
    "headers": 15,
    "autres": 7,
    "globalRiskScore": 78.5,
    "criticalCount": 3,
    "highCount": 8,
    "mediumCount": 20,
    "lowCount": 16,
    "sitesSurveilles": 24,
    "auditsRealises": 156
  },
  "message": "Données du tableau de bord récupérées avec succès"
}
```

### 2. Statistiques Complètes
**GET** `/api/vulnerability-statistics/overview`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "total": 47,
    "xss": 12,
    "sqlInjection": 8,
    "csrf": 5,
    "headers": 15,
    "autres": 7,
    "globalRiskScore": 78.5,
    "critical": 3,
    "high": 8,
    "medium": 20,
    "low": 16,
    "typeBreakdown": {
      "XSS": 12,
      "SQL_INJECTION": 8,
      "CSRF": 5,
      "HEADERS": 15,
      "OTHERS": 7
    },
    "severityDistribution": {
      "CRITICAL": 3,
      "HIGH": 8,
      "MEDIUM": 20,
      "LOW": 16
    }
  },
  "message": "Statistiques récupérées avec succès"
}
```

### 3. Statistiques par Site Web
**GET** `/api/vulnerability-statistics/website/{websiteId}`

**Exemple :** `/api/vulnerability-statistics/website/1`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "xss": 3,
    "sqlInjection": 2,
    "csrf": 1,
    "headers": 6,
    "autres": 3,
    "globalRiskScore": 65.2,
    "critical": 1,
    "high": 3,
    "medium": 8,
    "low": 3
  },
  "websiteId": 1,
  "message": "Statistiques du site récupérées avec succès"
}
```

## Tests avec cURL

### Test d'Authentification
```bash
# D'abord, obtenez un token d'authentification
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre@email.com",
    "password": "votre_mot_de_passe"
  }'
```

### Test des Statistiques du Tableau de Bord
```bash
# Remplacez YOUR_TOKEN par le token obtenu
curl -X GET http://localhost:8080/api/vulnerability-statistics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test des Statistiques Complètes
```bash
curl -X GET http://localhost:8080/api/vulnerability-statistics/overview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test des Statistiques par Site
```bash
curl -X GET http://localhost:8080/api/vulnerability-statistics/website/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Tests avec Postman

### Collection Postman
Créez une collection avec les requêtes suivantes :

1. **Login**
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Body (raw JSON):
   ```json
   {
     "email": "votre@email.com",
     "password": "votre_mot_de_passe"
   }
   ```

2. **Dashboard Statistics**
   - Method: GET
   - URL: `http://localhost:8080/api/vulnerability-statistics/dashboard`
   - Headers: `Authorization: Bearer {{auth_token}}`

3. **Overview Statistics**
   - Method: GET
   - URL: `http://localhost:8080/api/vulnerability-statistics/overview`
   - Headers: `Authorization: Bearer {{auth_token}}`

### Variables d'Environnement
- `base_url`: `http://localhost:8080`
- `auth_token`: Token d'authentification (à extraire de la réponse du login)

## Tests avec JavaScript/Fetch

### Test Simple
```javascript
// Test des statistiques du tableau de bord
async function testDashboardAPI() {
  try {
    const response = await fetch('http://localhost:8080/api/vulnerability-statistics/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Dashboard Statistics:', data);
    
    if (data.success) {
      console.log('Total vulnerabilities:', data.data.total);
      console.log('XSS count:', data.data.xss);
      console.log('SQL Injection count:', data.data.sqlInjection);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testDashboardAPI();
```

### Test avec Gestion d'Erreur
```javascript
async function testAPIWithErrorHandling() {
  try {
    const response = await fetch('http://localhost:8080/api/vulnerability-statistics/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'API request failed');
    }
  } catch (error) {
    console.error('API Error:', error.message);
    return null;
  }
}
```

## Vérification des Données

### Validation des Réponses
1. **Vérifiez le statut de succès** : `success: true`
2. **Vérifiez la structure des données** : tous les champs requis sont présents
3. **Vérifiez la cohérence** : `total` doit être égal à la somme de tous les types
4. **Vérifiez les valeurs** : tous les compteurs doivent être des nombres ≥ 0

### Tests de Cohérence
```javascript
function validateDataConsistency(data) {
  const calculatedTotal = data.xss + data.sqlInjection + data.csrf + data.headers + data.autres;
  
  if (calculatedTotal !== data.total) {
    console.error('Data inconsistency: calculated total != reported total');
    console.error(`Calculated: ${calculatedTotal}, Reported: ${data.total}`);
    return false;
  }
  
  const severityTotal = data.critical + data.high + data.medium + data.low;
  if (severityTotal !== data.total) {
    console.error('Severity inconsistency: severity sum != total');
    console.error(`Severity sum: ${severityTotal}, Total: ${data.total}`);
    return false;
  }
  
  return true;
}
```

## Dépannage

### Erreurs Courantes

1. **401 Unauthorized**
   - Vérifiez que le token est valide
   - Vérifiez que le token n'a pas expiré

2. **403 Forbidden**
   - Vérifiez les permissions de l'utilisateur
   - Vérifiez que l'utilisateur a accès aux statistiques

3. **500 Internal Server Error**
   - Vérifiez les logs du serveur backend
   - Vérifiez la connexion à la base de données

4. **CORS Error**
   - Vérifiez la configuration CORS dans le backend
   - Vérifiez que l'origine `http://localhost:4200` est autorisée

### Logs de Débogage
Activez les logs détaillés dans votre backend Spring Boot :
```properties
logging.level.com.monsite.monsite=DEBUG
logging.level.org.springframework.web=DEBUG
```

## Tests de Performance

### Test de Charge Simple
```bash
# Test avec 100 requêtes simultanées
for i in {1..100}; do
  curl -X GET http://localhost:8080/api/vulnerability-statistics/dashboard \
    -H "Authorization: Bearer YOUR_TOKEN" &
done
wait
```

### Mesure du Temps de Réponse
```javascript
async function measureResponseTime() {
  const start = performance.now();
  
  try {
    const response = await fetch('http://localhost:8080/api/vulnerability-statistics/dashboard', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    const data = await response.json();
    const end = performance.now();
    
    console.log(`Response time: ${end - start}ms`);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Conclusion

Ces tests vous permettront de vérifier que :
1. L'API fonctionne correctement
2. L'authentification est en place
3. Les données sont cohérentes
4. Les performances sont acceptables
5. L'intégration avec Angular fonctionne

Exécutez ces tests avant de déployer en production pour vous assurer de la fiabilité de votre système.
