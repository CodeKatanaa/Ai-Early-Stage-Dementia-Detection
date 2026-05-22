import { useNavigate } from 'react-router-dom';
import { Puzzle, Crown, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const games = [
  { id: 'duck', title: 'Memory Match', desc: 'Flip cards and find matching pairs. Train your visual memory and concentration.', icon: Puzzle, color: 'bg-warning/10 text-warning' },
  { id: 'chess', title: 'Chess', desc: 'Play on a simplified chess board. Exercise strategic thinking and planning.', icon: Crown, color: 'bg-primary/10 text-primary' },
  { id: 'sudoku', title: 'Sudoku', desc: 'Complete a 9×9 number puzzle. Train logical reasoning and concentration.', icon: Grid3X3, color: 'bg-secondary/10 text-secondary' },
];

const GamesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Memory Games</h1>
      <p className="text-muted-foreground">Play these games regularly to exercise different cognitive abilities.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {games.map(game => (
          <div key={game.id} className="gradient-card rounded-xl p-6 shadow-card flex flex-col">
            <div className={`w-14 h-14 rounded-xl ${game.color} flex items-center justify-center mb-4`}>
              <game.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">{game.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 flex-1">{game.desc}</p>
            <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => navigate(`/dashboard/games/${game.id}`)}>
              Play Now
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
