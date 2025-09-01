# 🔧 Guide de Dépannage - Tableau de Bord des Vulnérabilités

## Problème Identifié
Les données de vulnérabilités s'affichent comme "0" dans le tableau de bord Angular, même si l'API backend retourne les bonnes données.

## 🔍 Diagnostic Étape par Étape

### 1. Vérification de l'API Backend
**Testez d'abord votre API directement :**

```bash
# Test avec cURL (remplacez YOUR_TOKEN par un vrai token)
curl -X GET http://localhost:8080/api/vulnerability-statistics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "sqlInjection": 6,
    "headers": 12,
    "total": 33,
    "mediumCount": 9,
    "globalRiskScore": 52.58,
    "xss": 6,
    "csrf": 3,
    "highCount": 13,
    "lowCount": 3,
    "autres": 6,
    "criticalCount": 8
  }
}
```

### 2. Vérification de l'Authentification Angular
**Problème possible :** L'utilisateur n'est pas authentifié dans Angular.

**Solution :**
1. Vérifiez que vous êtes connecté dans l'application Angular
2. Vérifiez que le token est bien stocké dans le localStorage
3. Ouvrez la console du navigateur et vérifiez les logs

### 3. Vérification des Logs de la Console
**Ouvrez la console du navigateur (F12) et regardez les logs :**

```
🔄 Chargement des données du tableau de bord...
✅ Données reçues du backend: {data: {...}}
📊 Données du tableau de bord: {total: 33, xss: 6, ...}
```

**Si vous voyez des erreurs :**
```
❌ Erreur lors du chargement des données du tableau de bord: ...
```

### 4. Test avec le Fichier HTML
**Utilisez le fichier `test-api.html` pour tester l'API :**

1. Ouvrez `test-api.html` dans votre navigateur
2. Connectez-vous avec vos identifiants
3. Testez l'endpoint `/dashboard`
4. Vérifiez que les données sont correctes

### 5. Vérification de la Configuration CORS
**Problème possible :** Erreur CORS empêchant les requêtes.

**Dans votre backend Spring Boot, vérifiez :**
```java
@CrossOrigin(origins = "http://localhost:4200")
```

**Ou dans la configuration globale :**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 🛠️ Solutions

### Solution 1 : Vérification de l'Authentification
```typescript
// Dans la console du navigateur, vérifiez :
localStorage.getItem('auth_token')
localStorage.getItem('auth_user')
```

### Solution 2 : Test Direct de l'API
```javascript
// Dans la console du navigateur, testez :
fetch('http://localhost:8080/api/vulnerability-statistics/dashboard', {
  headers: {
    'Authorization': 'Bearer VOTRE_TOKEN_ICI'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Solution 3 : Vérification du Service Angular
**Vérifiez que le service est bien injecté :**
```typescript
// Dans le composant, ajoutez :
constructor(private vulnerabilityStatisticsService: VulnerabilityStatisticsService) {
  console.log('Service injecté:', this.vulnerabilityStatisticsService);
}
```

### Solution 4 : Gestion des Erreurs Améliorée
**Modifiez le composant pour mieux gérer les erreurs :**
```typescript
private loadDashboardData(): void {
  this.isLoading = true;
  this.error = null;

  console.log('🔄 Chargement des données du tableau de bord...');

  this.vulnerabilityStatisticsService.getDashboardStatistics()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log('✅ Données reçues du backend:', data);
        
        // Vérification des données
        if (!data || typeof data !== 'object') {
          console.error('❌ Données invalides reçues:', data);
          this.error = 'Format de données invalide';
          return;
        }
        
        this.dashboardData = data;
        this.updateVulnerabilityChartData();
        this.isLoading = false;
        
        console.log('📊 Données du tableau de bord:', {
          total: this.dashboardData?.total,
          xss: this.dashboardData?.xss,
          sqlInjection: this.dashboardData?.sqlInjection,
          csrf: this.dashboardData?.csrf,
          headers: this.dashboardData?.headers,
          autres: this.dashboardData?.autres
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données du tableau de bord:', error);
        this.error = `Erreur: ${error.message}`;
        this.isLoading = false;
      }
    });
}
```

## 🔍 Vérifications Supplémentaires

### 1. Vérification du Token d'Authentification
```typescript
// Dans le service, ajoutez des logs :
private getAuthHeaders(): HttpHeaders {
  const token = this.authService.getCurrentToken();
  console.log('🔑 Token utilisé:', token ? token.substring(0, 20) + '...' : 'Aucun token');
  
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}
```

### 2. Vérification de la Réponse HTTP
```typescript
getDashboardStatistics(): Observable<DashboardData> {
  return this.http.get<{success: boolean, data: DashboardData, message: string}>(
    `${this.API_BASE_URL}/dashboard`,
    { headers: this.getAuthHeaders() }
  ).pipe(
    tap(response => console.log('📡 Réponse HTTP brute:', response)),
    map(response => {
      console.log('🔍 Traitement de la réponse:', response);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    }),
    catchError(error => {
      console.error('❌ Erreur dans le service:', error);
      return throwError(() => error);
    })
  );
}
```

### 3. Vérification de l'Interface des Données
**Assurez-vous que l'interface correspond aux données de l'API :**
```typescript
export interface DashboardData {
  total: number;
  xss: number;
  sqlInjection: number;
  csrf: number;
  headers: number;
  autres: number;
  globalRiskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  sitesSurveilles?: number;
  auditsRealises?: number;
}
```

## 🚀 Test de la Solution

### 1. Redémarrez l'Application
```bash
# Arrêtez Angular (Ctrl+C)
# Puis redémarrez :
npm start
```

### 2. Vérifiez la Console
- Ouvrez la console du navigateur (F12)
- Naviguez vers le tableau de bord
- Vérifiez les logs de débogage

### 3. Testez l'API
- Utilisez le fichier `test-api.html`
- Vérifiez que l'API fonctionne
- Comparez les données avec celles affichées

## 📋 Checklist de Résolution

- [ ] L'API backend fonctionne (test avec cURL/Postman)
- [ ] L'utilisateur est authentifié dans Angular
- [ ] Le token est valide et non expiré
- [ ] Pas d'erreurs CORS
- [ ] Les logs de débogage s'affichent
- [ ] Les données sont reçues du backend
- [ ] L'interface correspond aux données
- [ ] Les données s'affichent dans le template

## 🆘 Si le Problème Persiste

1. **Vérifiez les logs du serveur Spring Boot**
2. **Vérifiez la base de données**
3. **Testez avec Postman ou cURL**
4. **Vérifiez la configuration CORS**
5. **Vérifiez les permissions utilisateur**

## 📞 Support

Si le problème persiste après avoir suivi ce guide :
1. Collectez tous les logs (console navigateur + serveur)
2. Testez l'API avec les outils fournis
3. Vérifiez la configuration de votre environnement
