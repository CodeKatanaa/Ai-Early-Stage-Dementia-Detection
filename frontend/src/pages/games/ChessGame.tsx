import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Piece = { type: string; color: 'w' | 'b' } | null;

const INITIAL_BOARD: Piece[][] = [
  [{ type: '♜', color: 'b' }, { type: '♞', color: 'b' }, { type: '♝', color: 'b' }, { type: '♛', color: 'b' }, { type: '♚', color: 'b' }, { type: '♝', color: 'b' }, { type: '♞', color: 'b' }, { type: '♜', color: 'b' }],
  Array(8).fill(null).map(() => ({ type: '♟', color: 'b' as const })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: '♙', color: 'w' as const })),
  [{ type: '♖', color: 'w' }, { type: '♘', color: 'w' }, { type: '♗', color: 'w' }, { type: '♕', color: 'w' }, { type: '♔', color: 'w' }, { type: '♗', color: 'w' }, { type: '♘', color: 'w' }, { type: '♖', color: 'w' }],
];

const ChessGame = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Piece[][]>(INITIAL_BOARD.map(r => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'w' | 'b'>('w');

  const handleClick = (r: number, c: number) => {
    const piece = board[r][c];
    if (selected) {
      const [sr, sc] = selected;
      const sp = board[sr][sc];
      if (sp && (r !== sr || c !== sc)) {
        const target = board[r][c];
        if (!target || target.color !== sp.color) {
          const newBoard = board.map(row => [...row]);
          newBoard[r][c] = sp;
          newBoard[sr][sc] = null;
          setBoard(newBoard);
          setTurn(t => t === 'w' ? 'b' : 'w');
        }
      }
      setSelected(null);
    } else if (piece && piece.color === turn) {
      setSelected([r, c]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/dashboard/games')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <span className="text-sm text-muted-foreground">{turn === 'w' ? 'White' : 'Black'}'s turn</span>
      </div>

      <div className="flex justify-center">
        <div className="inline-grid grid-cols-8 border-2 border-foreground/20 rounded-lg overflow-hidden">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const light = (r + c) % 2 === 0;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl transition-colors
                    ${light ? 'bg-accent' : 'bg-primary/20'}
                    ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                    hover:brightness-95`}
                >
                  {piece?.type}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={() => { setBoard(INITIAL_BOARD.map(r => [...r])); setTurn('w'); setSelected(null); }}>
          Reset Board
        </Button>
      </div>
    </div>
  );
};

export default ChessGame;
