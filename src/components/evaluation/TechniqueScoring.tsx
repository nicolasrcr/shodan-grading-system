import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JUDO_TECHNIQUES, getCategoryOptions, getTechniquesByCategory } from '@/data/judoTechniques';
import { Trash2, Plus, ExternalLink } from 'lucide-react';

export interface TechniqueScore {
  id: string;
  category: string;
  technique: string;
  score: string;
  videoUrl?: string;
}

interface TechniqueScoringProps {
  scores: TechniqueScore[];
  onChange: (scores: TechniqueScore[]) => void;
}

export function TechniqueScoring({ scores, onChange }: TechniqueScoringProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState('');

  const categories = getCategoryOptions();

  const handleAddTechnique = () => {
    if (!selectedCategory || !selectedTechnique) return;

    const techData = getTechniquesByCategory(selectedCategory).find(
      (t) => t.name === selectedTechnique
    );

    const newScore: TechniqueScore = {
      id: crypto.randomUUID(),
      category: selectedCategory,
      technique: selectedTechnique,
      score: '',
      videoUrl: techData?.videoUrl,
    };

    onChange([...scores, newScore]);
    setSelectedTechnique('');
  };

  const handleScoreChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 10)) return;
    onChange(scores.map((s) => (s.id === id ? { ...s, score: value } : s)));
  };

  const handleRemove = (id: string) => {
    onChange(scores.filter((s) => s.id !== id));
  };

  const techniques = selectedCategory ? getTechniquesByCategory(selectedCategory) : [];

  // Agrupar scores por categoria para exibição
  const groupedScores = scores.reduce<Record<string, TechniqueScore[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const averageScore = () => {
    const validScores = scores.filter((s) => s.score !== '' && !isNaN(parseFloat(s.score)));
    if (validScores.length === 0) return 0;
    return validScores.reduce((sum, s) => sum + parseFloat(s.score), 0) / validScores.length;
  };

  return (
    <div className="space-y-4">
      {/* Seletor de técnica */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <Label className="text-sm">Grupo de Técnica</Label>
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val);
              setSelectedTechnique('');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o grupo" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label className="text-sm">Técnica</Label>
          <Select
            value={selectedTechnique}
            onValueChange={setSelectedTechnique}
            disabled={!selectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedCategory ? 'Selecione a técnica' : 'Escolha o grupo primeiro'} />
            </SelectTrigger>
            <SelectContent>
              {techniques.map((tech) => (
                <SelectItem key={tech.name} value={tech.name}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleAddTechnique}
          disabled={!selectedCategory || !selectedTechnique}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Lista de técnicas adicionadas, agrupadas */}
      {Object.keys(groupedScores).length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedScores).map(([category, categoryScores]) => (
            <div key={category} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary px-4 py-2">
                <span className="font-semibold text-sm">{category}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({categoryScores.length} técnica{categoryScores.length > 1 ? 's' : ''})
                </span>
              </div>
              <div className="divide-y divide-border">
                {categoryScores.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2">
                    <span className="flex-1 text-sm font-medium">{item.technique}</span>
                    {item.videoUrl && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 shrink-0"
                        title="Ver vídeo"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={item.score}
                      onChange={(e) => handleScoreChange(item.id, e.target.value)}
                      className="w-20 score-input text-center"
                      placeholder="0-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Média das técnicas */}
          <div className="p-3 bg-secondary rounded-lg flex items-center justify-between">
            <span className="font-medium">Média das Técnicas:</span>
            <span className="text-xl font-bold">{averageScore().toFixed(2)}</span>
          </div>
        </div>
      )}

      {scores.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          Nenhuma técnica adicionada. Selecione o grupo e a técnica acima.
        </p>
      )}
    </div>
  );
}
