interface OcrOutput {
  Fournisseur: string;
  date: string;
  "name of the company": string;
  adresse: string;
  "Numéro de facture": string;
  "Montant HT": string;
  "Montant TVA": string;
  "Montant TTC": string;
  " Détail de facture": string;
}

interface OcrResponse {
  output: OcrOutput;
}

interface ProcessedOcrResult {
  supplier: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: string;
  vatAmount: string;
  amountWithTax: string;
  details: string;
  originalFile: {
    name: string;
    type: string;
    size: number;
  };
  documentType: string;
  rawResponse: OcrResponse[];
} 