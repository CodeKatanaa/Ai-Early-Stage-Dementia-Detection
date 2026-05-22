import { useState, useEffect } from 'react';
import { BookOpen, Calculator, Eye, PenLine, Puzzle, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const exercises = [
  { id: 1, title: 'Word Chain', desc: 'Build a chain of words where each starts with the last letter of the previous word.', icon: BookOpen, type: 'wordchain' as const },
  { id: 2, title: 'Quick Math', desc: 'Solve simple arithmetic problems to sharpen mental calculation.', icon: Calculator, type: 'quickmath' as const },
  { id: 3, title: 'Spot the Difference', desc: 'Find differences between two sequences to train attention to detail.', icon: Eye, type: 'spotdiff' as const },
  { id: 4, title: 'Story Recall', desc: 'Read a short story then answer questions from memory.', icon: PenLine, type: 'storyrecall' as const },
  { id: 5, title: 'Sequence Completion', desc: 'Complete number and letter sequences to train pattern recognition.', icon: Puzzle, type: 'sequence' as const },
  { id: 6, title: 'Mindful Breathing', desc: 'Follow a guided breathing exercise for cognitive relaxation.', icon: Brain, type: 'breathing' as const },
];

const ExercisePage = () => {
  const [active, setActive] = useState<number | null>(null);
  const activeEx = exercises.find(e => e.id === active);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Cognitive Exercises</h1>
      <p className="text-muted-foreground">Practice these exercises regularly to maintain cognitive health.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {exercises.map(ex => (
          <div key={ex.id} className="gradient-card rounded-xl p-6 shadow-card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <ex.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">{ex.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{ex.desc}</p>
                <Button size="sm" className="mt-4 gradient-primary text-primary-foreground" onClick={() => setActive(ex.id)}>Start</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeEx && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-8 max-w-lg w-full shadow-elevated relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setActive(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">{activeEx.title}</h2>
            {activeEx.type === 'breathing' ? (
              <BreathingExercise onClose={() => setActive(null)} />
            ) : (
              <ExerciseContent type={activeEx.type} onClose={() => setActive(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BreathingExercise = ({ onClose }: { onClose: () => void }) => {
  const phases = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const [active, setActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => {
            const next = (p + 1) % 4;
            if (next === 0) setCycles(cy => cy + 1);
            return next;
          });
          return 4;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="text-center space-y-6">
      <p className="text-sm text-muted-foreground">4-4-4-4 box breathing technique. Complete 3 cycles.</p>
      {!active ? (
        <Button className="gradient-primary text-primary-foreground" onClick={() => setActive(true)}>Begin</Button>
      ) : cycles >= 3 ? (
        <div className="space-y-4">
          <p className="text-2xl font-bold text-primary">Great job! 🧘</p>
          <p className="text-muted-foreground">You completed 3 cycles of box breathing.</p>
          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <>
          <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-1000 ${
            phase === 0 ? 'bg-primary/20 scale-110' : phase === 2 ? 'bg-primary/10 scale-90' : 'bg-accent scale-100'
          }`}>
            <span className="text-4xl font-bold text-primary">{count}</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{phases[phase]}</p>
          <p className="text-xs text-muted-foreground">Cycle {cycles + 1} of 3</p>
        </>
      )}
    </div>
  );
};

const ExerciseContent = ({ type, onClose }: { type: string; onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState('');

  if (type === 'wordchain') {
    const chain = answers;
    const lastLetter = chain.length > 0 ? chain[chain.length - 1].slice(-1).toLowerCase() : '';
    const addWord = () => {
      const word = input.trim().toLowerCase();
      if (!word) return;
      if (chain.length > 0 && word[0] !== lastLetter) return;
      setAnswers([...chain, word]);
      setInput('');
    };
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Type a word. The next word must start with the last letter of the previous word. Try to build a chain of 10+!</p>
        {chain.length === 0 && <p className="text-sm text-foreground">Start with any word:</p>}
        {chain.length > 0 && <p className="text-sm text-foreground">Next word must start with: <span className="text-primary font-bold text-lg">"{lastLetter.toUpperCase()}"</span></p>}
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()} placeholder="Type a word..." />
          <Button onClick={addWord} className="gradient-primary text-primary-foreground">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {chain.map((w, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm">{w}</span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Chain length: {chain.length}</p>
        <Button variant="outline" className="w-full mt-2" onClick={onClose}>Done</Button>
      </div>
    );
  }

  if (type === 'quickmath') {
    const problems = [
      { q: '15 + 27 = ?', a: '42' },
      { q: '48 - 19 = ?', a: '29' },
      { q: '6 × 8 = ?', a: '48' },
      { q: '72 ÷ 9 = ?', a: '8' },
      { q: '33 + 47 = ?', a: '80' },
    ];
    const current = problems[step];
    if (step >= problems.length) {
      const correct = answers.filter((a, i) => a === problems[i].a).length;
      return (
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-primary">{correct}/{problems.length} correct!</p>
          <p className="text-muted-foreground">{correct >= 4 ? 'Excellent work!' : correct >= 2 ? 'Good effort!' : 'Keep practicing!'}</p>
          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      );
    }
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Problem {step + 1} of {problems.length}</p>
        <p className="text-3xl font-bold text-foreground">{current.q}</p>
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {
          if (e.key === 'Enter') { setAnswers([...answers, input.trim()]); setInput(''); setStep(s => s + 1); }
        }} placeholder="Your answer" className="text-center text-lg" type="number" />
        <Button className="gradient-primary text-primary-foreground w-full" onClick={() => { setAnswers([...answers, input.trim()]); setInput(''); setStep(s => s + 1); }}>Submit</Button>
      </div>
    );
  }

  if (type === 'spotdiff') {
    const pairs = [
      { a: 'A B C D E F G', b: 'A B C D E F H', answer: 'G → H (7th item)' },
      { a: '1 3 5 7 9 11', b: '1 3 5 8 9 11', answer: '7 → 8 (4th item)' },
      { a: '🍎 🍊 🍋 🍇 🍓', b: '🍎 🍊 🍌 🍇 🍓', answer: '🍋 → 🍌 (3rd item)' },
    ];
    if (step >= pairs.length) {
      return (
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-primary">Well done!</p>
          <p className="text-muted-foreground">You completed all spot-the-difference challenges!</p>
          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      );
    }
    const pair = pairs[step];
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Find the difference between the two sequences:</p>
        <div className="bg-accent rounded-lg p-4 text-center text-lg font-mono tracking-wider text-foreground">{pair.a}</div>
        <div className="bg-accent rounded-lg p-4 text-center text-lg font-mono tracking-wider text-foreground">{pair.b}</div>
        <Button className="gradient-primary text-primary-foreground w-full" onClick={() => setStep(s => s + 1)}>
          {step < pairs.length - 1 ? 'Next' : 'Finish'} — Answer: {pair.answer}
        </Button>
      </div>
    );
  }

  if (type === 'storyrecall') {
    const story = "John went to the bakery on Saturday morning. He bought two loaves of bread, a chocolate cake, and six muffins. On his way home, he stopped at the park where he met his neighbor, Mrs. Chen, walking her cat. They chatted about the upcoming community fair.";
    const questions = [
      { q: 'Where did John go?', options: ['Bakery', 'Grocery', 'Library'], correct: 0 },
      { q: 'What day was it?', options: ['Sunday', 'Saturday', 'Friday'], correct: 1 },
      { q: 'What pet did Mrs. Chen have?', options: ['Dog', 'Bird', 'Cat'], correct: 2 },
    ];
    if (step === 0) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Read this story carefully, then answer questions from memory:</p>
          <div className="bg-accent rounded-lg p-4 text-foreground leading-relaxed">{story}</div>
          <Button className="gradient-primary text-primary-foreground w-full" onClick={() => setStep(1)}>I'm Ready</Button>
        </div>
      );
    }
    const qIdx = step - 1;
    if (qIdx >= questions.length) {
      const correct = answers.filter((a, i) => parseInt(a) === questions[i].correct).length;
      return (
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-primary">{correct}/{questions.length} correct!</p>
          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      );
    }
    const q = questions[qIdx];
    return (
      <div className="space-y-4">
        <p className="text-foreground font-medium">{q.q}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <Button key={i} variant="outline" className="w-full justify-start" onClick={() => {
              setAnswers([...answers, String(i)]);
              setStep(s => s + 1);
            }}>{opt}</Button>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'sequence') {
    const seqs = [
      { q: '2, 4, 6, 8, ?', a: '10' },
      { q: 'A, C, E, G, ?', a: 'I' },
      { q: '1, 1, 2, 3, 5, ?', a: '8' },
      { q: '3, 6, 12, 24, ?', a: '48' },
    ];
    if (step >= seqs.length) {
      const correct = answers.filter((a, i) => a.toLowerCase().trim() === seqs[i].a.toLowerCase()).length;
      return (
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-primary">{correct}/{seqs.length} correct!</p>
          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      );
    }
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">What comes next?</p>
        <p className="text-2xl font-bold text-foreground">{seqs[step].q}</p>
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {
          if (e.key === 'Enter') { setAnswers([...answers, input.trim()]); setInput(''); setStep(s => s + 1); }
        }} placeholder="Your answer" className="text-center text-lg" />
        <Button className="gradient-primary text-primary-foreground w-full" onClick={() => { setAnswers([...answers, input.trim()]); setInput(''); setStep(s => s + 1); }}>Submit</Button>
      </div>
    );
  }

  return <p className="text-muted-foreground">Exercise not found.</p>;
};

export default ExercisePage;
