import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Movement, MovementService } from '../../services/movement.service';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-movement',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './movement.component.html',
  styleUrl: './movement.component.css',
})
export class MovementComponent implements OnInit {

  ChevronDown = ChevronDown;

  protected movementService = inject(MovementService);

  numberOfMovements = signal<number>(10);
  availableCategories = signal<string[]>([]);
  selectedCategory = signal<string>('');
  startDate = signal<string>('');
  endDate = signal<string>('');
  movements = signal<Movement[]>([]);
  finalBalance = signal<number | null>(null);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  exportMenuOpen = signal<boolean>(false);

  isDropdownOpen = signal<boolean>(false);

  ngOnInit() {

    this.movementService.getCategories().subscribe({
      next: categories => this.availableCategories.set(categories.map(c => c.categoryName)),
      error: () => this.availableCategories.set([])
    });

    this.executeSearch();
  }

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  selectCategory(value: string, event: Event) {
    event.stopPropagation();
    this.selectedCategory.set(value);
    this.isDropdownOpen.set(false);
    this.executeSearch();
  }

  onNumberOfMovementsChange(value: string) {
    this.numberOfMovements.set(+value);
    this.executeSearch();
  }

  onCategoryChange(value: string) {
    this.selectedCategory.set(value);
    this.executeSearch();
  }

  onStartDateChange(value: string) {
    this.startDate.set(value);
    this.executeSearch();
  }

  onEndDateChange(value: string) {
    this.endDate.set(value);
    this.executeSearch();
  }

  executeSearch() {
    this.errorMessage.set('');
    const n = this.numberOfMovements();

    if (!n || n <= 0) {
      this.errorMessage.set('Inserisci un numero di movimenti valido (n > 0).');
      this.loading.set(false);
      return;
    }

    const category = this.selectedCategory();
    const startValue = this.startDate();
    const endValue = this.endDate();
    const hasDateRange = !!startValue && !!endValue;

    let start: Date | null = null;
    let end: Date | null = null;

    if (hasDateRange) {
      start = new Date(startValue);
      end = new Date(endValue);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        this.errorMessage.set('La data di inizio deve precedere la data di fine.');
        this.loading.set(false);
        return;
      }
    }

    this.loading.set(true);

    if (!category && !hasDateRange) {
      this.finalBalance.set(null);
      this.movementService.getLastMovements(n)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (result) => {
            this.movements.set(this.sortByDateDesc(result.movements));
            this.finalBalance.set(result.finalBalance);
          },
          error: (error) => {
            console.error('Errore nel caricamento dei movimenti:', error);
            this.movements.set([]);
            this.finalBalance.set(null);
            this.errorMessage.set('Si è verificato un errore durante il caricamento dei movimenti.');
          }
        });
      return;
    }

    this.finalBalance.set(null);

    if (category && !hasDateRange) {
      this.movementService.getMovementsByCategory(n, category)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (movements) => this.movements.set(this.sortByDateDesc(movements)),
          error: (error) => {
            console.error('Errore nel caricamento per categoria:', error);
            this.movements.set([]);
            this.errorMessage.set('Si è verificato un errore durante il caricamento dei movimenti.');
          }
        });
      return;
    }

    if (!category && hasDateRange) {
      this.movementService.getMovementsByDateRange(n, start!, end!)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (movements) => this.movements.set(this.sortByDateDesc(movements)),
          error: (error) => {
            console.error('Errore nel caricamento per intervallo di date:', error);
            this.movements.set([]);
            this.errorMessage.set('Si è verificato un errore durante il caricamento dei movimenti.');
          }
        });
      return;
    }

    this.movementService.getMovementsByCategoryAndDateRange(n, category, start!, end!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (movements) => this.movements.set(this.sortByDateDesc(movements)),
        error: (error) => {
          console.error('Errore nel caricamento per categoria e intervallo:', error);
          this.movements.set([]);
          this.errorMessage.set('Si è verificato un errore durante il caricamento dei movimenti.');
        }
      });
  }

  private sortByDateDesc(movements: Movement[]): Movement[] {
    return [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  toggleExportMenu() {
    this.exportMenuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.exportMenuOpen() && !target.closest('.export-dropdown')) {
      this.exportMenuOpen.set(false);
    }

    if (this.isDropdownOpen() && !target.closest('.custom-select-wrapper')) {
      this.isDropdownOpen.set(false);
    }
  }

  exportCsvAndClose() {
    this.exportCsv();
    this.exportMenuOpen.set(false);
  }

  exportExcelAndClose() {
    this.exportExcel();
    this.exportMenuOpen.set(false);
  }

  exportCsv() {
    const movements = this.movements();
    if (!movements.length) return;

    const header = ['Data', 'Importo', 'NomeCategoria'];
    const rows = movements.map(m => [
      m.date.toLocaleDateString('it-IT'),
      m.amount.toFixed(2).replace('.', ','),
      m.categoryName
    ]);

    const csvContent = [header, ...rows].map(row => row.join(';')).join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movements_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportExcel() {
    const movements = this.movements();
    if (!movements.length) return;

    const data = movements.map(m => ({
      Data: m.date.toLocaleDateString('it-IT'),
      Importo: m.amount,
      NomeCategoria: m.categoryName
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimenti');
    XLSX.writeFile(workbook, `movements_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
