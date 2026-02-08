export interface Candidate {
  id: string;
  full_name: string;
  email?: string;
  birth_date: string;
  federation: string;
  association?: string;
  current_grade: string;
  target_grade: string;
  zempo_registration?: string;
  registration_years: number;
  accumulated_points: number;
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: string;
  candidate_id: string;
  evaluation_date: string;
  target_grade: string;
  evaluator_name: string;
  evaluator_grade: string;
  location?: string;
  
  // Notas teóricas
  teoria_historico?: number;
  teoria_filosofia?: number;
  teoria_etica?: number;
  teoria_atualidades?: number;
  teoria_tecnicas?: number;
  teoria_vocabulario?: number;
  teoria_kata?: number;
  teoria_arbitragem?: number;
  
  // Notas práticas
  pratica_nage_no_kata?: number;
  pratica_katame_no_kata?: number;
  pratica_ju_no_kata?: number;
  pratica_kime_no_kata?: number;
  pratica_goshin_jutsu?: number;
  pratica_nage_waza?: number;
  pratica_renraku_waza?: number;
  pratica_kaeshi_waza?: number;
  pratica_katame_waza?: number;
  pratica_arbitragem?: number;
  pratica_pedagogia?: number;
  
  // Resultados
  nota_teorica_final?: number;
  nota_pratica_final?: number;
  nota_final?: number;
  status: 'pendente' | 'aprovado' | 'reprovado';
  
  observations?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamento
  candidates?: Candidate;
}

export interface GradeProgram {
  id: string;
  grade: string;
  minimum_age: number;
  minimum_carency_years: number;
  minimum_points: number;
  required_katas: string[];
  theoretical_topics: string[];
  practical_requirements: string[];
  created_at: string;
}

export interface TheoreticalQuestion {
  id: string;
  grade: string;
  category: string;
  question: string;
  correct_answer?: string;
  options?: string[];
  points: number;
  created_at: string;
}

export const GRADE_OPTIONS = [
  { value: '1º DAN', label: '1º DAN (Sho Dan) - Faixa Preta', color: 'black' },
  { value: '2º DAN', label: '2º DAN (Ni Dan) - Faixa Preta', color: 'black' },
  { value: '3º DAN', label: '3º DAN (San Dan) - Faixa Preta', color: 'black' },
  { value: '4º DAN', label: '4º DAN (Yon Dan) - Faixa Preta', color: 'black' },
  { value: '5º DAN', label: '5º DAN (Go Dan) - Faixa Preta', color: 'black' },
  { value: '6º DAN', label: '6º DAN (Roku Dan) - Faixa Vermelha e Branca', color: 'red-white' },
  { value: '7º DAN', label: '7º DAN (Shiti Dan) - Faixa Vermelha e Branca', color: 'red-white' },
  { value: '8º DAN', label: '8º DAN (Hati Dan) - Faixa Vermelha e Branca', color: 'red-white' },
] as const;

export const PREVIOUS_GRADES = [
  { value: '1º KYÛ', label: '1º KYÛ - Faixa Marrom' },
  { value: '1º DAN', label: '1º DAN - Faixa Preta' },
  { value: '2º DAN', label: '2º DAN - Faixa Preta' },
  { value: '3º DAN', label: '3º DAN - Faixa Preta' },
  { value: '4º DAN', label: '4º DAN - Faixa Preta' },
  { value: '5º DAN', label: '5º DAN - Faixa Preta' },
  { value: '6º DAN', label: '6º DAN - Faixa Vermelha e Branca' },
  { value: '7º DAN', label: '7º DAN - Faixa Vermelha e Branca' },
] as const;
