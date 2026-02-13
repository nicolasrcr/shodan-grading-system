import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTechniquesByCategory } from '@/data/judoTechniques';
import { Trash2, Plus, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export interface GroupTechniqueScore {
  id: string;
  technique: string;
  score: string;
  videoUrl?: string;
}

interface PracticalSectionScoringProps {
  label: string;
  /** Technique categories to show in the dropdown for this group */
  techniqueCategories: string[];
  scores: GroupTechniqueScore[];
  onChange: (scores: GroupTechniqueScore[]) => void;
}

export function PracticalSectionScoring({
  label,
  techniqueCategories,
  scores,
  onChange,
}: PracticalSectionScoringProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    techniqueCategories.length === 1 ? techniqueCategories[0] : ''
  );
  const [selectedTechnique, setSelectedTechnique] = useState('');
  const [expanded, setExpanded] = useState(false);

  const techniques = selectedCategory ? getTechniquesByCategory(selectedCategory) : [];
  // Filter out already-added techniques
  const availableTechniques = techniques.filter(
    (t) => !scores.some((s) => s.technique === t.name)
  );

  const handleAdd = () => {
    if (!selectedTechnique) return;
    const techData = techniques.find((t) => t.name === selectedTechnique);
    const newScore: GroupTechniqueScore = {
      id: crypto.randomUUID(),
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

  const average = () => {
    const valid = scores.filter((s) => s.score !== '' && !isNaN(parseFloat(s.score)));
    if (valid.length === 0) return 0;
    return valid.reduce((sum, s) => sum + parseFloat(s.score), 0) / valid.length;
  };

  const avg = average();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-secondary/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{label}</span>
          {scores.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {scores.length} técnica{scores.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {scores.length > 0 && (
            <span className="text-sm font-bold">{avg.toFixed(2)}</span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Add technique row */}
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            {techniqueCategories.length > 1 && (
              <div className="flex-1">
                <Label className="text-xs">Grupo</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                    setSelectedTechnique('');
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {techniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1">
              <Label className="text-xs">Técnica</Label>
              <Select
                value={selectedTechnique}
                onValueChange={setSelectedTechnique}
                disabled={!selectedCategory}
              >
                <SelectTrigger className="h-9">
                  <SelectValue
                    placeholder={
                      selectedCategory
                        ? availableTechniques.length > 0
                          ? 'Selecione a técnica'
                          : 'Todas adicionadas'
                        : 'Selecione o grupo'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTechniques.map((tech) => (
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
              onClick={handleAdd}
              disabled={!selectedTechnique}
              className="shrink-0 h-9"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* Listed techniques */}
          {scores.length > 0 && (
            <div className="divide-y divide-border border border-border rounded-md">
              {scores.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="flex-1 text-sm">{item.technique}</span>
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
                    className="w-20 text-center h-8"
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
          )}

          {scores.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhuma técnica adicionada. Use o seletor acima.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
