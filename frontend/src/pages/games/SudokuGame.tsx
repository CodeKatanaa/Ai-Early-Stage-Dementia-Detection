import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Puzzle = { label: string; difficulty: string; puzzle: number[][]; solution: number[][] };

const PUZZLES: Puzzle[] = [
  {
    label: 'Puzzle 1', difficulty: 'Easy',
    puzzle: [
      [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9],
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9],
    ],
  },
  {
    label: 'Puzzle 2', difficulty: 'Easy',
    puzzle: [
      [0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],
      [8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],
      [0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0],
    ],
    solution: [
      [4,3,5,2,6,9,7,8,1],[6,8,2,5,7,1,4,9,3],[1,9,7,8,3,4,5,6,2],
      [8,2,6,1,9,5,3,4,7],[3,7,4,6,8,2,9,1,5],[9,5,1,7,4,3,6,2,8],
      [5,1,9,3,2,6,8,7,4],[2,4,8,9,5,7,1,3,6],[7,6,3,4,1,8,2,5,9],
    ],
  },
  {
    label: 'Puzzle 3', difficulty: 'Medium',
    puzzle: [
      [0,0,0,6,0,0,4,0,0],[7,0,0,0,0,3,6,0,0],[0,0,0,0,9,1,0,8,0],
      [0,0,0,0,0,0,0,0,0],[0,5,0,1,8,0,0,0,3],[0,0,0,3,0,6,0,4,5],
      [0,4,0,2,0,0,0,6,0],[9,0,3,0,0,0,0,0,0],[0,2,0,0,0,0,1,0,0],
    ],
    solution: [
      [5,8,1,6,7,2,4,3,9],[7,9,2,8,4,3,6,5,1],[3,6,4,5,9,1,7,8,2],
      [4,3,8,9,5,7,2,1,6],[2,5,6,1,8,4,9,7,3],[1,7,9,3,2,6,8,4,5],
      [8,4,5,2,1,9,3,6,7],[9,1,3,7,6,8,5,2,4],[6,2,7,4,3,5,1,9,8],
    ],
  },
  {
    label: 'Puzzle 4', difficulty: 'Medium',
    puzzle: [
      [0,2,0,0,0,0,0,0,0],[0,0,0,6,0,0,0,0,3],[0,7,4,0,8,0,0,0,0],
      [0,0,0,0,0,3,0,0,2],[0,8,0,0,4,0,0,1,0],[6,0,0,5,0,0,0,0,0],
      [0,0,0,0,1,0,7,8,0],[5,0,0,0,0,9,0,0,0],[0,0,0,0,0,0,0,4,0],
    ],
    solution: [
      [1,2,6,4,3,7,9,5,8],[8,9,5,6,2,1,4,7,3],[3,7,4,9,8,5,1,2,6],
      [4,5,7,1,9,3,8,6,2],[9,8,3,2,4,6,5,1,7],[6,1,2,5,7,8,3,9,4],
      [2,6,9,3,1,4,7,8,5],[5,4,8,7,6,9,2,3,1],[7,3,1,8,5,2,6,4,9],
    ],
  },
  {
    label: 'Puzzle 5', difficulty: 'Medium',
    puzzle: [
      [1,0,0,0,0,7,0,9,0],[0,3,0,0,2,0,0,0,8],[0,0,9,6,0,0,5,0,0],
      [0,0,5,3,0,0,9,0,0],[0,1,0,0,8,0,0,0,2],[6,0,0,0,0,4,0,0,0],
      [3,0,0,0,0,0,0,1,0],[0,4,0,0,0,0,0,0,7],[0,0,7,0,0,0,3,0,0],
    ],
    solution: [
      [1,6,2,8,5,7,4,9,3],[5,3,4,1,2,9,6,7,8],[7,8,9,6,4,3,5,2,1],
      [4,7,5,3,1,2,9,8,6],[9,1,3,5,8,6,7,4,2],[6,2,8,7,9,4,1,3,5],
      [3,5,6,4,7,8,2,1,9],[2,4,1,9,3,5,8,6,7],[8,9,7,2,6,1,3,5,4],
    ],
  },
  {
    label: 'Puzzle 6', difficulty: 'Hard',
    puzzle: [
      [0,0,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,8,5],[0,0,1,0,2,0,0,0,0],
      [0,0,0,5,0,7,0,0,0],[0,0,4,0,0,0,1,0,0],[0,9,0,0,0,0,0,0,0],
      [5,0,0,0,0,0,0,7,3],[0,0,2,0,1,0,0,0,0],[0,0,0,0,4,0,0,0,9],
    ],
    solution: [
      [9,8,7,6,5,4,3,2,1],[2,4,6,1,7,3,9,8,5],[3,5,1,9,2,8,7,4,6],
      [1,2,8,5,3,7,6,9,4],[6,3,4,8,9,2,1,5,7],[7,9,5,4,6,1,8,3,2],
      [5,1,9,2,8,6,4,7,3],[4,7,2,3,1,9,5,6,8],[8,6,3,7,4,5,2,1,9],
    ],
  },
  {
    label: 'Puzzle 7', difficulty: 'Hard',
    puzzle: [
      [0,0,0,0,0,0,2,0,0],[0,0,0,0,3,0,0,0,0],[0,6,0,0,0,0,0,7,1],
      [0,0,8,0,0,0,0,9,0],[0,4,0,8,0,5,0,6,0],[0,1,0,0,0,0,5,0,0],
      [2,3,0,0,0,0,0,8,0],[0,0,0,0,9,0,0,0,0],[0,0,5,0,0,0,0,0,0],
    ],
    solution: [
      [4,5,7,6,1,9,2,3,8],[8,1,2,7,3,4,6,5,9],[3,6,9,5,8,2,4,7,1],
      [6,7,8,1,4,3,7,9,2],[9,4,3,8,2,5,1,6,7],[7,1,4,9,6,8,5,2,3],
      [2,3,6,4,5,7,9,8,1],[5,8,1,3,9,6,7,4,2],[1,9,5,2,7,1,3,1,4],
    ],
  },
  {
    label: 'Puzzle 8', difficulty: 'Medium',
    puzzle: [
      [0,0,3,0,2,0,6,0,0],[9,0,0,3,0,5,0,0,1],[0,0,1,8,0,6,4,0,0],
      [0,0,8,1,0,2,9,0,0],[7,0,0,0,0,0,0,0,8],[0,0,6,7,0,8,2,0,0],
      [0,0,2,6,0,9,5,0,0],[8,0,0,2,0,3,0,0,9],[0,0,5,0,1,0,3,0,0],
    ],
    solution: [
      [4,8,3,9,2,1,6,5,7],[9,6,7,3,4,5,8,2,1],[2,5,1,8,7,6,4,9,3],
      [5,4,8,1,3,2,9,7,6],[7,2,9,5,6,4,1,3,8],[1,3,6,7,9,8,2,4,5],
      [3,7,2,6,8,9,5,1,4],[8,1,4,2,5,3,7,6,9],[6,9,5,4,1,7,3,8,2],
    ],
  },
  {
    label: 'Puzzle 9', difficulty: 'Easy',
    puzzle: [
      [0,0,0,0,0,0,0,1,2],[0,0,0,0,3,5,0,0,0],[0,0,0,6,0,0,0,7,0],
      [7,0,0,0,0,0,3,0,0],[0,0,0,4,0,0,8,0,0],[1,0,0,0,0,0,0,0,0],
      [0,0,0,1,2,0,0,0,0],[0,8,0,0,0,0,0,4,0],[0,5,0,0,0,0,6,0,0],
    ],
    solution: [
      [6,7,3,8,9,4,5,1,2],[9,1,2,7,3,5,4,8,6],[4,8,5,6,1,2,9,7,3],
      [7,9,8,2,6,1,3,5,4],[5,2,6,4,7,3,8,9,1],[1,3,4,5,8,9,2,6,7],
      [3,6,9,1,2,8,7,4,5],[2,8,1,9,5,7,3,4,6],[8,5,7,3,4,6,6,2,9],
    ],
  },
  {
    label: 'Puzzle 10', difficulty: 'Hard',
    puzzle: [
      [8,0,0,0,0,0,0,0,0],[0,0,3,6,0,0,0,0,0],[0,7,0,0,9,0,2,0,0],
      [0,5,0,0,0,7,0,0,0],[0,0,0,0,4,5,7,0,0],[0,0,0,1,0,0,0,3,0],
      [0,0,1,0,0,0,0,6,8],[0,0,8,5,0,0,0,1,0],[0,9,0,0,0,0,4,0,0],
    ],
    solution: [
      [8,1,2,7,5,3,6,4,9],[9,4,3,6,8,2,1,7,5],[6,7,5,4,9,1,2,8,3],
      [1,5,4,2,3,7,8,9,6],[3,6,9,8,4,5,7,2,1],[2,8,7,1,6,9,5,3,4],
      [5,2,1,9,7,4,3,6,8],[4,3,8,5,2,6,9,1,7],[7,9,6,3,1,8,4,5,2],
    ],
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy:   '#16a34a',
  Medium: '#d97706',
  Hard:   '#dc2626',
};

const SudokuGame = () => {
  const navigate = useNavigate();
  const [puzzleIdx, setPuzzleIdx] = useState(() => Math.floor(Math.random() * PUZZLES.length));
  const current = PUZZLES[puzzleIdx];
  const [grid, setGrid]         = useState<number[][]>(current.puzzle.map(r=>[...r]));
  const [selected, setSelected] = useState<[number,number]|null>(null);
  const [validated, setValidated] = useState<boolean|null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);

  const loadPuzzle = (idx: number) => {
    setPuzzleIdx(idx);
    setGrid(PUZZLES[idx].puzzle.map(r=>[...r]));
    setSelected(null); setValidated(null);
  };

  const isOriginal = (r: number, c: number) => current.puzzle[r][c] !== 0;

  const handleNumberInput = (num: number) => {
    if (!selected) return;
    const [r,c] = selected;
    if (isOriginal(r,c)) return;
    const newGrid = grid.map(row=>[...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);
    setValidated(null);
  };

  const validate = () => {
    const correct = grid.every((row,r) => row.every((val,c) => val===current.solution[r][c]));
    setValidated(correct);
    if (correct) setSolvedCount(s=>s+1);
  };

  const hint = () => {
    // Reveal one random empty cell
    const empty: [number,number][] = [];
    grid.forEach((row,r) => row.forEach((val,c) => {
      if (val===0 && !isOriginal(r,c)) empty.push([r,c]);
    }));
    if (empty.length===0) return;
    const [r,c] = empty[Math.floor(Math.random()*empty.length)];
    const newGrid = grid.map(row=>[...row]);
    newGrid[r][c] = current.solution[r][c];
    setGrid(newGrid);
    setHintCount(h=>h+1);
    setValidated(null);
  };

  const nextPuzzle = () => {
    const next = (puzzleIdx+1) % PUZZLES.length;
    loadPuzzle(next);
  };

  const reset = () => {
    setGrid(current.puzzle.map(r=>[...r]));
    setSelected(null); setValidated(null);
  };

  const diffColor = DIFFICULTY_COLOR[current.difficulty] || '#374151';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/dashboard/games')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-center">
          <span className="text-sm font-medium">{current.label}</span>
          <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background:`${diffColor}20`, color:diffColor }}>{current.difficulty}</span>
        </div>
        <span className="text-xs text-muted-foreground">Solved: {solvedCount}</span>
      </div>

      {/* Puzzle selector */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {PUZZLES.map((p,i) => (
          <button key={i} onClick={() => loadPuzzle(i)}
            style={{
              padding:'3px 10px', borderRadius:999, fontSize:11, cursor:'pointer',
              background: i===puzzleIdx?'hsl(214,60%,55%)':'white',
              color: i===puzzleIdx?'white':DIFFICULTY_COLOR[p.difficulty],
              border: `1.5px solid ${i===puzzleIdx?'hsl(214,60%,55%)':DIFFICULTY_COLOR[p.difficulty]}`,
              fontWeight:600,
            }}>
            {p.label.replace('Puzzle ','')} <span style={{fontWeight:400,fontSize:10}}>({p.difficulty[0]})</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="inline-grid grid-cols-9 border-2 border-foreground/30 rounded-lg overflow-hidden">
          {grid.map((row,r) =>
            row.map((val,c) => {
              const isSel = selected && selected[0]===r && selected[1]===c;
              const borderR = (c+1)%3===0&&c<8 ? 'border-r-2 border-r-foreground/30' : 'border-r border-r-border';
              const borderB = (r+1)%3===0&&r<8 ? 'border-b-2 border-b-foreground/30' : 'border-b border-b-border';
              const isWrong = val !== 0 && !isOriginal(r,c) && validated===false && val!==current.solution[r][c];
              return (
                <button key={`${r}-${c}`} onClick={() => !isOriginal(r,c)&&setSelected([r,c])}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-sm font-medium transition-colors
                    ${borderR} ${borderB}
                    ${isOriginal(r,c)?'bg-muted text-foreground font-bold':'bg-card'}
                    ${isSel?'ring-2 ring-primary ring-inset bg-accent':''}
                    ${isWrong?'text-red-500':'text-primary'}`}>
                  {val!==0?val:''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Number pad */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <Button key={n} size="sm" variant="outline" className="w-10 h-10"
            onClick={() => handleNumberInput(n)}>{n}</Button>
        ))}
        <Button size="sm" variant="outline" className="w-10 h-10"
          onClick={() => handleNumberInput(0)}>✕</Button>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button className="gradient-primary text-primary-foreground" onClick={validate}>Validate</Button>
        <Button variant="outline" onClick={hint}>Hint ({hintCount})</Button>
        <Button variant="outline" onClick={reset}>Reset</Button>
        <Button variant="outline" onClick={nextPuzzle}>Next Puzzle →</Button>
      </div>

      {validated !== null && (
        <div className={`text-center p-3 rounded-xl ${validated?'bg-success/10 text-success':'bg-red-50 text-red-600'}`}>
          <div className="flex items-center justify-center gap-2">
            {validated ? <CheckCircle className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
            <span className="font-semibold">
              {validated
                ? `🎉 Correct! ${solvedCount} puzzle${solvedCount>1?'s':''} solved!`
                : 'Some numbers are incorrect. Red cells show errors.'}
            </span>
          </div>
          {validated && (
            <Button size="sm" className="mt-3 gradient-primary text-primary-foreground" onClick={nextPuzzle}>
              Next Puzzle →
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SudokuGame;