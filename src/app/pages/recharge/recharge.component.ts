import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RechargeService } from '../../services/recharge.service';
import { RechargePageData } from '../../entities';
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

  ChartColumn = ChartColumn;
  Smartphone = Smartphone;
  ChevronDown = ChevronDown;

  phoneNumber = '';
  operator = '';
  selectedAmount = 0;
  rechargeAmounts = [5, 10, 20, 30, 50];

  message = '';
  success = false;
  loading = false;

  pageData?: RechargePageData;
  chart?: Chart;

  isDropdownOpen = false;
  operatorList: string[] = []; // Inizialmente vuota, popolata dal BE

  constructor(private rechargeService: RechargeService) {}

  ngOnInit(): void {
    this.loadBackendData();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  loadBackendData(): void {
    this.rechargeService.getPageData().subscribe({
      next: (data: any) => {
        this.pageData = data;
        
        // Assegna gli operatori restituiti dal backend
        if (data.operatori && Array.isArray(data.operatori)) {
          this.operatorList = data.operatori;
        }

        this.updateChart(data.analytics.andamentoMensile);
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei dati:', err);
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
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 5 }, max: 50 }
        }
      }
    });
  }

  updateChart(chartData: { mesi: string[]; totali: number[] }): void {
    if (this.chart) {
      this.chart.data.labels = chartData.mesi;
      this.chart.data.datasets[0].data = chartData.totali;
      this.chart.update();
    }
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
  }

  recharge(): void {
    this.message = '';

    if (!this.phoneNumber || !this.operator || this.selectedAmount === 0) {
      this.message = 'Compila tutti i campi.';
      this.success = false;
      return;
    }

    this.loading = true;

    this.rechargeService.effettuaRicarica({
      phoneNumber: this.phoneNumber,
      operator: this.operator,
      amount: this.selectedAmount
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.success;
        this.message = res.message;

        if (res.success) {
          this.phoneNumber = '';
          this.operator = '';
          this.selectedAmount = 0;
          this.loadBackendData();
        }
      },
      error: () => {
        this.loading = false;
        this.success = false;
        this.message = 'Errore di connessione con il server.';
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