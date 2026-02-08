import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  ClipboardList, 
  CheckCircle, 
  XCircle,
  Plus,
  TrendingUp
} from 'lucide-react';

interface Stats {
  totalCandidates: number;
  totalEvaluations: number;
  approved: number;
  pending: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalCandidates: 0,
    totalEvaluations: 0,
    approved: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [candidatesRes, evaluationsRes] = await Promise.all([
          supabase.from('candidates').select('id', { count: 'exact', head: true }),
          supabase.from('evaluations').select('status'),
        ]);

        const evaluations = evaluationsRes.data || [];
        
        setStats({
          totalCandidates: candidatesRes.count || 0,
          totalEvaluations: evaluations.length,
          approved: evaluations.filter(e => e.status === 'aprovado').length,
          pending: evaluations.filter(e => e.status === 'pendente').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Candidatos', 
      value: stats.totalCandidates, 
      icon: Users, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Avaliações', 
      value: stats.totalEvaluations, 
      icon: ClipboardList, 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      title: 'Aprovados', 
      value: stats.approved, 
      icon: CheckCircle, 
      color: 'text-success',
      bg: 'bg-success/10'
    },
    { 
      title: 'Pendentes', 
      value: stats.pending, 
      icon: TrendingUp, 
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Painel de Controle
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie avaliações de graduação do 1º ao 5º DAN
            </p>
          </div>
          <Button 
            onClick={() => navigate('/new-evaluation')}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/candidates')}
              >
                <Users className="h-4 w-4 mr-3" />
                Gerenciar Candidatos
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/new-evaluation')}
              >
                <ClipboardList className="h-4 w-4 mr-3" />
                Iniciar Nova Avaliação
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/programs')}
              >
                <CheckCircle className="h-4 w-4 mr-3" />
                Ver Programas de Faixa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Graduações Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['1º DAN', '2º DAN', '3º DAN', '4º DAN', '5º DAN'].map((grade) => (
                  <div 
                    key={grade} 
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                      <span className="font-medium">{grade}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Faixa Preta</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-primary to-gray-800 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-semibold">
                  Sistema de Avaliação CBJ
                </h3>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  Baseado no Regulamento de Exame e Outorga de Faixas e Graus de 2018
                </p>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/programs')}
              >
                Ver Requisitos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
