import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvaluationWithCandidate {
  id: string;
  evaluation_date: string;
  target_grade: string;
  evaluator_name: string;
  nota_final: number | null;
  status: 'pendente' | 'aprovado' | 'reprovado';
  candidates: {
    full_name: string;
    federation: string;
  } | null;
}

export default function EvaluationsPage() {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<EvaluationWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  async function fetchEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        id,
        evaluation_date,
        target_grade,
        evaluator_name,
        nota_final,
        status,
        candidates (
          full_name,
          federation
        )
      `)
      .order('evaluation_date', { ascending: false });
    
    if (error) {
      toast({
        title: 'Erro ao carregar avaliações',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEvaluations(data as EvaluationWithCandidate[] || []);
    }
    setLoading(false);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Reprovado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const filteredEvaluations = evaluations.filter(e => 
    e.candidates?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.target_grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.evaluator_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Avaliações
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico de avaliações realizadas
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por candidato, graduação ou avaliador..."
            className="pl-10"
          />
        </div>

        {/* Evaluations List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Carregando avaliações...
              </CardContent>
            </Card>
          ) : filteredEvaluations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {searchTerm ? 'Nenhuma avaliação encontrada.' : 'Nenhuma avaliação realizada.'}
              </CardContent>
            </Card>
          ) : (
            filteredEvaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-display font-bold">
                        {evaluation.target_grade.split(' ')[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {evaluation.candidates?.full_name || 'Candidato'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {evaluation.target_grade}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(evaluation.evaluation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {evaluation.nota_final !== null && (
                        <div className="text-right hidden sm:block">
                          <span className="text-xs text-muted-foreground">Nota Final</span>
                          <p className="text-xl font-bold">{evaluation.nota_final.toFixed(2)}</p>
                        </div>
                      )}
                      {getStatusBadge(evaluation.status)}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <span>Avaliador: {evaluation.evaluator_name}</span>
                    {evaluation.candidates?.federation && (
                      <span>{evaluation.candidates.federation}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
