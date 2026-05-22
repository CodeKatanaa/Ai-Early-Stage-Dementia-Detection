import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 10 different themed emoji sets
const EMOJI_SETS = [
  { theme: 'Animals',      emojis: ['🐶','🐱','🐸','🦊','🐻','🐼'] },
  { theme: 'Fruits',       emojis: ['🍎','🍋','🍇','🍓','🍊','🍉'] },
  { theme: 'Space',        emojis: ['🚀','🌙','⭐','🌍','☀️','🪐'] },
  { theme: 'Music',        emojis: ['🎸','🎹','🎺','🎻','🥁','🎷'] },
  { theme: 'Sports',       emojis: ['🏀','⚽','🎾','🏈','🏓','🏸'] },
  { theme: 'Food',         emojis: ['🍕','🍔','🌮','🍜','🍣','🍩'] },
  { theme: 'Nature',       emojis: ['🌸','🌴','🌊','🌈','🍄','❄️'] },
  { theme: 'Vehicles',     emojis: ['🚗','✈️','🚂','🚢','🏍️','🚁'] },
  { theme: 'Faces',        emojis: ['😀','😎','🤩','😴','🥳','😡'] },
  { theme: 'Ocean',        emojis: ['🐠','🦈','🐙','🦞','🐡','🐬'] },
];

// Track which sets have been played this session
const usedSets = new Set<number>();

const getNextSetIdx = (currentIdx: number | null) => {
  if (usedSets.size >= EMOJI_SETS.length) usedSets.clear(); // reset when all played
  let idx: number;
  do { idx = Math.floor(Math.random() * EMOJI_SETS.length); }
  while (usedSets.has(idx));
  usedSets.add(idx);
  return idx;
};

const generateCards = (setIdx: number) => {
  const { emojis } = EMOJI_SETS[setIdx];
  const pairs = [...emojis, ...emojis];
  return pairs.sort(() => Math.random() - 0.5).map((emoji, i) => ({
    id: i, emoji, flipped: false, matched: false,
  }));
};

const DuckGame = () => {
  const navigate = useNavigate();
  const [setIdx, setSetIdx]       = useState(() => getNextSetIdx(null));
  const [cards, setCards]         = useState(() => generateCards(getNextSetIdx(null)));
  const [flipped, setFlipped]     = useState<number[]>([]);
  const [moves, setMoves]         = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [gameOver, setGameOver]   = useState(false);
  const [timer, setTimer]         = useState(0);
  const [started, setStarted]     = useState(false);
  const [round, setRound]         = useState(1);
  const [bestTime, setBestTime]   = useState<number | null>(null);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const currentSetIdx             = useRef(setIdx);

  useEffect(() => {
    if (!started || gameOver) return;
    const t = setInterval(() => setTimer(v => v+1), 1000);
    return () => clearInterval(t);
  }, [started, gameOver]);

  const handleCardClick = useCallback((id: number) => {
    if (!started) setStarted(true);
    if (flipped.length === 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const newCards = [...cards];
    newCards[id] = { ...newCards[id], flipped: true };
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m+1);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c,i) => (i===a||i===b)?{...c,matched:true}:c));
          setMatchCount(mc => {
            const next = mc+1;
            if (next >= 6) setGameOver(true);
            return next;
          });
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c,i) => (i===a||i===b)?{...c,flipped:false}:c));
          setFlipped([]);
        }, 800);
      }
    }
  }, [cards, flipped, started]);

  const playNext = () => {
    // Update best records
    if (bestTime === null || timer < bestTime) setBestTime(timer);
    if (bestMoves === null || moves < bestMoves) setBestMoves(moves);
    // Get new set
    const newIdx = getNextSetIdx(currentSetIdx.current);
    currentSetIdx.current = newIdx;
    setSetIdx(newIdx);
    setCards(generateCards(newIdx));
    setFlipped([]); setMoves(0); setMatchCount(0);
    setGameOver(false); setTimer(0); setStarted(false);
    setRound(r => r+1);
  };

  const restart = () => {
    const newIdx = getNextSetIdx(currentSetIdx.current);
    currentSetIdx.current = newIdx;
    setSetIdx(newIdx);
    setCards(generateCards(newIdx));
    setFlipped([]); setMoves(0); setMatchCount(0);
    setGameOver(false); setTimer(0); setStarted(false);
    setRound(1); setBestTime(null); setBestMoves(null);
    usedSets.clear();
  };

  const currentTheme = EMOJI_SETS[setIdx]?.theme || 'Memory';

  if (gameOver) return (
    <div className="text-center space-y-6">
      <div className="text-5xl">🎉</div>
      <h1 className="font-display text-3xl font-bold text-foreground">Well Done!</h1>
      <div className="inline-flex flex-col gap-1 bg-muted rounded-xl px-8 py-4">
        <p className="text-4xl font-bold text-primary">{moves} moves</p>
        <p className="text-muted-foreground">in {timer} seconds</p>
        <p className="text-sm text-muted-foreground mt-1">Round {round} — Theme: {currentTheme}</p>
      </div>
      {(bestTime !== null) && (
        <p className="text-sm text-muted-foreground">
          Best: {bestMoves} moves in {bestTime}s
        </p>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <Button variant="outline" onClick={() => navigate('/dashboard/games')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button variant="outline" onClick={restart}>Restart</Button>
        <Button className="gradient-primary text-primary-foreground" onClick={playNext}>
          Next Theme →
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/dashboard/games')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Round {round}</span>
          <span>Moves: {moves}</span>
          <span>Matches: {matchCount}/6</span>
          <span>Time: {timer}s</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-foreground mb-1">Memory Match</h2>
        <p className="text-sm text-primary font-medium mb-1">Theme: {currentTheme}</p>
        <p className="text-xs text-muted-foreground mb-4">
          {EMOJI_SETS.length - usedSets.size} themes remaining
        </p>
      </div>

      {/* Theme selector — play any theme */}
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {EMOJI_SETS.map((s, i) => (
          <button key={i}
            onClick={() => {
              currentSetIdx.current = i;
              setSetIdx(i);
              setCards(generateCards(i));
              setFlipped([]); setMoves(0); setMatchCount(0);
              setGameOver(false); setTimer(0); setStarted(false);
            }}
            style={{
              padding:'4px 10px', borderRadius:999, fontSize:12, cursor:'pointer',
              background: i===setIdx?'hsl(214,60%,55%)':'white',
              color: i===setIdx?'white':'#374151',
              border: i===setIdx?'1.5px solid hsl(214,60%,55%)':'1.5px solid #d1d5db',
              fontWeight: i===setIdx?600:400,
            }}>
            {s.theme}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map(card => (
          <button key={card.id} onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 ${
              card.matched
                ? 'bg-success/20 border-2 border-success scale-95'
                : card.flipped
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-accent border-2 border-border hover:border-primary/50 cursor-pointer'
            }`}>
            {card.flipped || card.matched ? card.emoji : '❓'}
          </button>
        ))}
      </div>

      {bestTime !== null && (
        <p className="text-center text-xs text-muted-foreground">
          Personal best: {bestMoves} moves in {bestTime}s
        </p>
      )}
    </div>
  );
};

export default DuckGame;