import "jspdf-autotable"; // Importando o plugin autoTable

declare module "jspdf" {
  interface jsPDF {
    autoTable: (
      options: jsPDFAutoTableOptions
    ) => jsPDF;

    lastAutoTable: {
      finalY: number; // Definindo a propriedade finalY da tabela
    };
  }
}

interface jsPDFAutoTableOptions {
  head: (string | number)[][]; // Cabeçalho com strings ou números
  body: (string | number)[][]; // Corpo da tabela com strings ou números
  startY: number; // Posição inicial no eixo Y
  theme: "striped" | "grid" | "plain"; // Tema da tabela
  headStyles: { fillColor: [number, number, number] }; // Estilo do cabeçalho
  styles: { fontSize: number }; // Estilo da fonte
  columnStyles?: { [columnIndex: number]: { fontStyle: string } }; // Definindo columnStyles
  margin?: { top?: number, left?: number, bottom?: number, right?: number };
  didDrawCell?: (data: jsPDF.Autotable.Cell) => void;
}
