export interface RubricaItem {
  operatore: string;
  telefono: string;
}

export interface UltimaRicarica {
  telefono: string;
  importo: number;
}

export interface RicaricheMensiliData {
  mesi: string[];      // es: ['Gen', 'Feb', 'Mar', ...]
  totali: number[];    // es: [10, 25, 0, 15, ...]
}

export interface RechargeAnalytics {
  operatorePiuUsato: string;
  totaleSpeso: number;
  ricaricheEffettuate: number;
  andamentoMensile: RicaricheMensiliData;
}

export interface RechargePageData {
  rubrica: RubricaItem[];
  ultimeRicariche: UltimaRicarica[];
  analytics: RechargeAnalytics;
}