# 🚀 Implémentation du Nombre de Sites Surveillés dans le Tableau de Bord

## 📋 Résumé des Modifications

Ce document décrit les modifications apportées pour afficher le nombre réel de sites surveillés dans le tableau de bord, en remplaçant la valeur statique par une valeur dynamique récupérée depuis l'API backend.

## 🔧 Modifications Apportées

### 1. Service WebsiteService (`src/app/core/services/website.service.ts`)

#### Interface ajoutée :
```typescript
export interface WebsitesCountData {
  totalWebsites: number;
  activeWebsites: number;
  inactiveWebsites: number;
  activeRate: number;
}
```

#### Méthode ajoutée :
```typescript
getWebsitesCount(): Observable<WebsitesCountData> {
  return this.http.get<{success: boolean, data: WebsitesCountData, message: string}>(
    `${this.API_BASE_URL}/websites-count`,
    { headers: this.getAuthHeaders() }
  ).pipe(
    map(response => {
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    }),
    catchError(error => {
      console.error('Erreur lors de la récupération du nombre de sites:', error);
      return throwError(() => error);
    })
  );
}
```

### 2. Composant Tableau de Bord (`src/app/features/tableau-de-bord/tableau-de-bord.component.ts`)

#### Méthode ajoutée :
```typescript
public loadWebsitesCount(): void {
  console.log('🔄 Chargement du nombre de sites surveillés...');

  this.websiteService.getWebsitesCount()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log('✅ Nombre de sites reçu du backend:', data);
        console.log('📊 Nombre total de sites:', data.totalWebsites);
        
        // Mettre à jour le nombre de sites dans dashboardData
        if (this.dashboardData) {
          this.dashboardData.sitesSurveilles = data.totalWebsites;
          // Forcer la détection des changements
          this.dashboardData = { ...this.dashboardData };
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du nombre de sites:', error);
        // En cas d'erreur, utiliser la valeur par défaut
        if (this.dashboardData) {
          this.dashboardData.sitesSurveilles = 2; // Valeur par défaut
          this.dashboardData = { ...this.dashboardData };
        }
      }
    });
}
```

#### Appels ajoutés :
- Dans `ngOnInit()` : `this.loadWebsitesCount()`
- Dans `startAutoRefresh()` : `this.loadWebsitesCount()`
- Dans `setupNavigationRefresh()` : `this.loadWebsitesCount()`

## 🌐 API Backend Utilisée

### Endpoint : `GET /api/websites/websites-count`

#### Réponse attendue :
```json
{
    "data": {
        "inactiveWebsites": 0,
        "activeRate": 100,
        "totalWebsites": 6,
        "activeWebsites": 6
    },
    "success": true,
    "message": "Nombre de sites surveillés récupéré avec succès"
}
```

#### Valeur utilisée :
- **`totalWebsites`** → Affiché dans la carte "Sites Surveillés" du tableau de bord

## 🎯 Fonctionnement

### 1. **Chargement initial** :
- Au démarrage du composant, `loadWebsitesCount()` est appelée
- L'API backend est interrogée pour récupérer le nombre de sites
- La valeur `totalWebsites` est assignée à `dashboardData.sitesSurveilles`

### 2. **Affichage dynamique** :
- Le composant `CarteStatistiqueComponent` reçoit la valeur via `[valeur]="dashboardData?.sitesSurveilles?.toString() || '0'"`
- L'affichage se met à jour automatiquement grâce à la détection de changements Angular

### 3. **Rafraîchissement automatique** :
- Toutes les 30 secondes, le nombre de sites est rafraîchi
- À chaque navigation vers le tableau de bord, les données sont mises à jour

### 4. **Gestion d'erreur** :
- En cas d'échec de l'API, une valeur par défaut (2) est utilisée
- Les erreurs sont loggées dans la console pour le débogage

## 🧪 Tests

### Fichier de test créé : `test-websites-count.html`

Ce fichier permet de :
- Tester l'endpoint backend directement
- Vérifier la structure de la réponse
- Tester avec et sans authentification
- Déboguer les problèmes de connectivité

## 📊 Résultat Attendu

**Avant** : La carte "Sites Surveillés" affichait une valeur statique (2)
**Après** : La carte affiche maintenant la valeur réelle récupérée depuis l'API (6 dans votre cas)

## 🔍 Débogage

### Logs de la console :
- `🔄 Chargement du nombre de sites surveillés...`
- `✅ Nombre de sites reçu du backend: [données]`
- `📊 Nombre total de sites: [valeur]`
- `🔄 Mise à jour de dashboardData.sitesSurveilles: [ancienne] → [nouvelle]`

### Vérifications :
1. **Backend démarré** : Port 8080 accessible
2. **Endpoint existant** : `/api/websites/websites-count` répond
3. **Authentification** : Token JWT valide si requis
4. **CORS** : Configuration correcte pour localhost:4200

## 🚀 Prochaines Étapes

1. **Tester l'implémentation** avec l'application Angular
2. **Vérifier les logs** dans la console du navigateur
3. **Valider l'affichage** du nombre de sites dans le tableau de bord
4. **Tester le rafraîchissement automatique** en modifiant les données backend

## 📝 Notes Techniques

- **RxJS** : Utilisation de `takeUntil()` pour la gestion de la mémoire
- **Détection de changements** : Forcée avec `{ ...this.dashboardData }`
- **Gestion d'erreur** : Fallback vers une valeur par défaut
- **Logs détaillés** : Pour faciliter le débogage en développement


