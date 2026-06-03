export type Raridade = "comum" | "raro" | "epico" | "lendario";

export interface Slide {
    id?: number;
    title: string;
    description: string;
    image: string;
}

export interface SlideFront extends Slide {
    file?: File; // usado apenas no frontend para upload
}

export interface Colaborador {
    id?: number;
    nome: string;
    imagem: string;
    raridade?: Raridade;
    dataAdmissao?: string;
    dataDesligamento?: string; 
    cpf?: string;               
    funcao?: string; 
    slides: Slide[];
}
