import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DonneeGraphique {
  label: string;
  valeur: number;
  couleur?: string;
}

@Component({
  selector: 'app-graphique-simple',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h3 class="chart-title">{{ titre }}</h3>
      </div>
      
      <div class="chart-content" [ngSwitch]="type">
        <!-- Graphique en barres -->
        <div *ngSwitchCase="'barres'" class="bar-chart">
          <div class="bar-item" *ngFor="let item of donnees; trackBy: trackByLabel">
            <div class="bar-label">{{ item.label }}</div>
            <div class="bar-container">
              <div class="bar-fill" 
                   [style.width.%]="getPercentage(item.valeur)" 
                   [style.background-color]="item.couleur || '#3b82f6'">
              </div>
            </div>
            <div class="bar-value">{{ item.valeur }}</div>
          </div>
        </div>

        <!-- Graphique circulaire (donut) -->
        <div *ngSwitchCase="'circulaire'" class="pie-chart">
          <div class="pie-container">
            <svg viewBox="0 0 100 100" class="pie-svg">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" stroke-width="8"></circle>
              <circle *ngFor="let segment of pieSegments; trackBy: trackByLabel" 
                      cx="50" cy="50" r="40" fill="none" 
                      [attr.stroke]="segment.couleur || '#3b82f6'"
                      stroke-width="8"
                      [attr.stroke-dasharray]="segment.dashArray"
                      [attr.stroke-dashoffset]="segment.offset"
                      class="pie-segment">
              </circle>
            </svg>
            <div class="pie-center">
              <div class="pie-total">{{ total }}</div>
              <div class="pie-total-label">Total</div>
            </div>
          </div>
          <div class="pie-legend">
            <div class="legend-item" *ngFor="let item of donnees; trackBy: trackByLabel">
              <div class="legend-color" [style.background-color]="item.couleur || '#3b82f6'"></div>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.valeur }}</span>
            </div>
          </div>
        </div>

        <!-- Graphique linéaire -->
        <div *ngSwitchCase="'ligne'" class="line-chart">
          <svg viewBox="0 0 400 200" class="line-svg">
            <!-- Grille -->
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="var(--border-color)" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Ligne -->
            <polyline [attr.points]="linePoints" 
                      fill="none" 
                      stroke="#3b82f6" 
                      stroke-width="2"
                      class="line-path">
            </polyline>
            
            <!-- Points -->
            <circle *ngFor="let point of linePointsArray; trackBy: trackByIndex" 
                    [attr.cx]="point.x" 
                    [attr.cy]="point.y" 
                    r="4" 
                    fill="#3b82f6"
                    class="line-point">
            </circle>
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background-color: var(--bg-primary);
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }

    .chart-header {
      margin-bottom: 1.5rem;
    }

    .chart-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    /* Graphique en barres */
    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bar-item {
      display: grid;
      grid-template-columns: 120px 1fr 60px;
      align-items: center;
      gap: 1rem;
    }

    .bar-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .bar-container {
      height: 24px;
      background-color: var(--bg-secondary);
      border-radius: 12px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 12px;
      transition: width 0.8s ease;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
    }

    .bar-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      text-align: right;
    }

    /* Graphique circulaire */
    .pie-chart {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .pie-container {
      position: relative;
      width: 200px;
      height: 200px;
    }

    .pie-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .pie-segment {
      transition: stroke-dasharray 0.8s ease;
    }

    .pie-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .pie-total {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .pie-total-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pie-legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .legend-label {
      flex: 1;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .legend-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Graphique linéaire */
    .line-chart {
      height: 200px;
    }

    .line-svg {
      width: 100%;
      height: 100%;
    }

    .line-path {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .line-point {
      transition: r 0.2s ease;
    }

    .line-point:hover {
      r: 6;
    }

    @media (max-width: 768px) {
      .pie-chart {
        flex-direction: column;
        gap: 1rem;
      }

      .pie-container {
        width: 150px;
        height: 150px;
      }

      .bar-item {
        grid-template-columns: 80px 1fr 50px;
        gap: 0.5rem;
      }
    }
  `]
})
export class GraphiqueSimpleComponent implements OnInit, OnChanges {
  @Input() titre: string = '';
  @Input() donnees: DonneeGraphique[] = [];
  @Input() type: 'barres' | 'circulaire' | 'ligne' = 'barres';

  pieSegments: any[] = [];
  total = 0;
  maxValue = 0;
  linePoints = '';
  linePointsArray: any[] = [];

  ngOnInit() {
    this.calculerStatistiques();
    if (this.type === 'circulaire') {
      this.calculerSegmentsCirculaires();
    } else if (this.type === 'ligne') {
      this.calculerPointsLigne();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['donnees'] && !changes['donnees'].firstChange) {
      this.calculerStatistiques();
      if (this.type === 'circulaire') {
        this.calculerSegmentsCirculaires();
      } else if (this.type === 'ligne') {
        this.calculerPointsLigne();
      }
    }
  }

  calculerStatistiques() {
    this.total = this.donnees.reduce((sum, item) => sum + item.valeur, 0);
    this.maxValue = Math.max(...this.donnees.map(item => item.valeur));
  }

  calculerSegmentsCirculaires() {
    const circumference = 2 * Math.PI * 40; // r = 40
    let cumulativePercentage = 0;

    this.pieSegments = this.donnees.map(item => {
      const percentage = (item.valeur / this.total) * 100;
      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
      
      cumulativePercentage += percentage;

      return {
        ...item,
        dashArray: strokeDasharray,
        offset: strokeDashoffset
      };
    });
  }

  calculerPointsLigne() {
    const width = 400;
    const height = 200;
    const padding = 40;
    
    this.linePointsArray = this.donnees.map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (this.donnees.length - 1);
      const y = height - padding - ((item.valeur / this.maxValue) * (height - 2 * padding));
      return { x, y };
    });

    this.linePoints = this.linePointsArray.map(point => `${point.x},${point.y}`).join(' ');
  }

  getPercentage(valeur: number): number {
    return this.maxValue ? (valeur / this.maxValue) * 100 : 0;
  }

  trackByLabel(index: number, item: DonneeGraphique): string {
    return item.label;
  }

  trackByIndex(index: number): number {
    return index;
  }
}