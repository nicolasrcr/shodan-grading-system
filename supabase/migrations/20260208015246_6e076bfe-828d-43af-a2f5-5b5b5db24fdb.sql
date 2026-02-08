-- Criar tabela de candidatos
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  birth_date DATE NOT NULL,
  federation TEXT NOT NULL,
  association TEXT,
  current_grade TEXT NOT NULL, -- Ex: "1º KYÛ (Faixa Marrom)"
  target_grade TEXT NOT NULL, -- Ex: "1º DAN (Faixa Preta)"
  zempo_registration TEXT,
  registration_years INTEGER DEFAULT 0,
  accumulated_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de avaliações (exames)
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_grade TEXT NOT NULL, -- Ex: "1º DAN"
  evaluator_name TEXT NOT NULL,
  evaluator_grade TEXT NOT NULL,
  location TEXT,
  
  -- Notas das provas teóricas (0-10)
  teoria_historico DECIMAL(4,2),
  teoria_filosofia DECIMAL(4,2),
  teoria_etica DECIMAL(4,2),
  teoria_atualidades DECIMAL(4,2),
  teoria_tecnicas DECIMAL(4,2),
  teoria_vocabulario DECIMAL(4,2),
  teoria_kata DECIMAL(4,2), -- Descrição escrita sobre Kata
  teoria_arbitragem DECIMAL(4,2),
  
  -- Notas das provas práticas (0-10)
  pratica_nage_no_kata DECIMAL(4,2),
  pratica_katame_no_kata DECIMAL(4,2),
  pratica_ju_no_kata DECIMAL(4,2),
  pratica_kime_no_kata DECIMAL(4,2),
  pratica_goshin_jutsu DECIMAL(4,2),
  pratica_nage_waza DECIMAL(4,2),
  pratica_renraku_waza DECIMAL(4,2),
  pratica_kaeshi_waza DECIMAL(4,2),
  pratica_katame_waza DECIMAL(4,2),
  pratica_arbitragem DECIMAL(4,2),
  pratica_pedagogia DECIMAL(4,2),
  
  -- Resultados finais
  nota_teorica_final DECIMAL(4,2),
  nota_pratica_final DECIMAL(4,2),
  nota_final DECIMAL(4,2),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
  
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para questões teóricas
CREATE TABLE public.theoretical_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade TEXT NOT NULL, -- Ex: "1º DAN", "2º DAN"
  category TEXT NOT NULL, -- Ex: "historico", "filosofia", "tecnicas", "vocabulario"
  question TEXT NOT NULL,
  correct_answer TEXT,
  options JSONB, -- Para questões de múltipla escolha
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para programas de cada faixa
CREATE TABLE public.grade_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade TEXT NOT NULL UNIQUE, -- Ex: "1º DAN", "2º DAN"
  minimum_age INTEGER NOT NULL,
  minimum_carency_years INTEGER NOT NULL,
  minimum_points INTEGER NOT NULL,
  required_katas JSONB, -- Lista de katas obrigatórios
  theoretical_topics JSONB, -- Tópicos teóricos
  practical_requirements JSONB, -- Requisitos práticos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theoretical_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_programs ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública para questões e programas (referência)
CREATE POLICY "Anyone can view theoretical questions"
  ON public.theoretical_questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view grade programs"
  ON public.grade_programs FOR SELECT
  USING (true);

-- Políticas para candidatos (apenas usuários autenticados)
CREATE POLICY "Authenticated users can view candidates"
  ON public.candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert candidates"
  ON public.candidates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update candidates"
  ON public.candidates FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para avaliações (apenas usuários autenticados)
CREATE POLICY "Authenticated users can view evaluations"
  ON public.evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert evaluations"
  ON public.evaluations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update evaluations"
  ON public.evaluations FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir programas de faixa do regulamento CBJ
INSERT INTO public.grade_programs (grade, minimum_age, minimum_carency_years, minimum_points, required_katas, theoretical_topics, practical_requirements) VALUES
('1º DAN', 16, 2, 700, 
  '["Nage no Kata (completo, como Tori)"]',
  '["Histórico, filosofia, ética e disciplina", "Atualidades", "Divisão e classificação das técnicas", "Ortografia do vocabulário técnico", "Descrição escrita sobre Nage no Kata"]',
  '["Nage no Kata – completo", "Nage waza", "Renraku waza/Renraku henka waza", "Kaeshi waza", "Katame waza", "Apresentação prática de arbitragem"]'
),
('2º DAN', 20, 4, 750,
  '["Katame no Kata (completo, como Tori)", "Nage no Kata (uma série, por sorteio, como Tori)"]',
  '["Descrição escrita sobre Katame no Kata", "Histórico, filosofia, ética e disciplina", "Atualidades", "Divisão e classificação das técnicas", "Ortografia do vocabulário técnico", "Conhecimento de arbitragem"]',
  '["Katame no Kata (completo)", "Nage no Kata (uma série)", "Nage waza", "Renraku henka waza", "Kaeshi waza", "Katame waza", "Conhecimentos didáticos e pedagógicos"]'
),
('3º DAN', 25, 5, 1200,
  '["Ju no Kata (completo, como Tori)", "Katame no Kata (um grupo por sorteio, como Tori)"]',
  '["Histórico, filosofia, ética e disciplina", "Divisão e classificação das técnicas", "Ortografia do vocabulário técnico", "Descrição escrita sobre Ju no Kata", "Noções básicas de organização de eventos", "Conhecimento de arbitragem"]',
  '["Ju no Kata (completo)", "Katame no Kata (um grupo por sorteio)", "Conhecimentos didáticos e pedagógicos de Nage no Kata, Katame no Kata, Ju no Kata e fundamentos de Judô"]'
),
('4º DAN', 31, 6, 1500,
  '["Kime no Kata (completo, como Tori)", "Ju no Kata (um grupo por sorteio como Tori)"]',
  '["Histórico, filosofia, ética e disciplina", "Divisão e classificação das técnicas", "Ortografia do vocabulário técnico", "Descrição escrita sobre Kime no Kata", "Apresentação de organização de eventos", "Conhecimento de arbitragem"]',
  '["Kime no Kata (completo)", "Ju no Kata (um grupo por sorteio)", "Conhecimentos didáticos e pedagógicos de todos os Katas"]'
),
('5º DAN', 37, 6, 2000,
  '["Kodokan Goshin Jutsu (completo, como Tori)", "Kime no Kata (um grupo por sorteio, como Tori)"]',
  '["Histórico, filosofia, ética e disciplina", "Divisão e classificação das técnicas", "Ortografia do vocabulário técnico", "Descrição escrita sobre Kodokan Goshin Jutsu", "Conhecimento de arbitragem"]',
  '["Kodokan Goshin Jutsu (completo)", "Kime no Kata (um grupo por sorteio)", "Experiência no ensino de Judô", "Cursos pedagógicos como participante e ministrante"]'
);

-- Inserir algumas questões teóricas de exemplo
INSERT INTO public.theoretical_questions (grade, category, question, correct_answer, points) VALUES
('1º DAN', 'historico', 'Em que ano foi fundado o Instituto Kodokan?', '1882', 1),
('1º DAN', 'historico', 'Qual foi o primeiro judoca a receber o 10º Dan das mãos de Jigoro Kano?', 'Yoshiaki Yamashita em 1935', 1),
('1º DAN', 'historico', 'Quem foram os primeiros judocas a receberem o 1º Dan de Jigoro Kano?', 'Tsunejiro Tomita e Shiro Saigo em 1883', 1),
('1º DAN', 'filosofia', 'Quais são os dois princípios fundamentais do Judô?', 'Seiryoku Zenyo (máxima eficiência com mínimo esforço) e Jita Kyoei (prosperidade e benefícios mútuos)', 2),
('1º DAN', 'tecnicas', 'Quantas técnicas compõem o Nage no Kata?', '15 técnicas divididas em 5 grupos de 3 técnicas', 1),
('1º DAN', 'tecnicas', 'Quais são os grupos do Nage no Kata?', 'Te waza, Koshi waza, Ashi waza, Masutemi waza e Yokosutemi waza', 2),
('2º DAN', 'kata', 'Quantas técnicas compõem o Katame no Kata?', '15 técnicas divididas em 3 grupos de 5 técnicas', 1),
('2º DAN', 'kata', 'Quais são os grupos do Katame no Kata?', 'Osae komi waza (5), Shime waza (5) e Kansetsu waza (5)', 2),
('3º DAN', 'kata', 'Quantas técnicas compõem o Ju no Kata?', '15 técnicas divididas em 3 grupos', 1),
('4º DAN', 'kata', 'Qual é o significado do Kime no Kata?', 'Kata das formas de decisão - técnicas de combate real', 1),
('5º DAN', 'kata', 'Quantas técnicas compõem o Kodokan Goshin Jutsu?', '21 técnicas de defesa pessoal', 1);