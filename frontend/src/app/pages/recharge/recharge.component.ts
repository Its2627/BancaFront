import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, HostListener, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RechargeService } from '../../services/recharge.service';
import { RechargePageData, RicaricheMensiliData } from '../../entities';
import Chart from 'chart.js/auto';
import { LucideAngularModule, ChartColumn, Smartphone, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './recharge.component.html',
  styleUrl: './recharge.component.css'
})
export class RechargeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private rechargeService = inject(RechargeService);

  ChartColumn = ChartColumn;
  Smartphone = Smartphone;
  ChevronDown = ChevronDown;

  phoneNumber = '';
  operator = '';
  selectedAmount = 0;
  isDropdownOpen = false;

  readonly rechargeAmounts = [5, 10, 20, 30, 50];

  pageData = signal<RechargePageData | null>(null);
  operatorList = signal<string[]>([]);
  message = signal<string>('');
  success = signal<boolean>(false);
  loading = signal<boolean>(false);

    backendMancante = signal<boolean>(false);

  analytics = computed(() => this.pageData()?.analytics ?? null);
  rubrica = computed(() => this.pageData()?.rubrica ?? []);
  ultimeRicariche = computed(() => this.pageData()?.ultimeRicariche ?? []);

  chart?: Chart;

  ngOnInit(): void {
    this.loadBackendData();
  }

  ngAfterViewInit(): void {
    this.initChart();

    const pending = this.analytics()?.andamentoMensile;

    if (pending) {
      this.updateChart(pending);
    }
  }

  loadBackendData(): void {
    this.rechargeService.getPageData().subscribe({
      next: (data: RechargePageData) => {
        this.backendMancante.set(false);
        this.pageData.set(data);
        this.operatorList.set(data.operatori ?? []);

        this.updateChart(data.analytics.andamentoMensile);
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei dati:', err);

        this.backendMancante.set(err.status === 404);
        this.message.set(
          err.status === 404
            ? 'Le ricariche telefoniche non sono ancora disponibili: il backend non espone questa funzione.'
            : 'Errore durante il caricamento dei dati delle ricariche.'
        );
        this.success.set(false);
      }
    });
  }

  initChart(): void {
    if (!this.chartCanvas) return;

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Spesa Ricariche (€)',
          data: [],
          backgroundColor: '#8b5cf6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },

          y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
        }
      }
    });
  }

    updateChart(chartData: RicaricheMensiliData): void {
    if (!this.chart) {
      return;
    }

    this.chart.data.labels = chartData.mesi;
    this.chart.data.datasets[0].data = chartData.totali;
    this.chart.update();
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
  }

    selezionaDallaRubrica(telefono: string, operatore: string): void {
    this.phoneNumber = telefono;
    this.operator = operatore;
  }

  recharge(): void {
    this.message.set('');

    if (!this.phoneNumber || !this.operator || this.selectedAmount === 0) {
      this.message.set('Compila tutti i campi.');
      this.success.set(false);
      return;
    }

    this.loading.set(true);

    this.rechargeService.effettuaRicarica({
      phoneNumber: this.phoneNumber,
      operator: this.operator,
      amount: this.selectedAmount
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.success);
        this.message.set(res.message);

        if (res.success) {
          this.phoneNumber = '';
          this.operator = '';
          this.selectedAmount = 0;

          this.loadBackendData();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.success.set(false);

        this.message.set(
          err.status === 404
            ? 'Le ricariche telefoniche non sono ancora implementate nel backend.'
            : err.error?.message ?? 'Errore di connessione con il server.'
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOperator(value: string, event: Event): void {
    event.stopPropagation();
    this.operator = value;
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.isDropdownOpen = false;
    }
  }
}
