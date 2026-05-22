import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VoiceAssistant = () => {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const lastTextRef = useRef('');

  const speakText = useCallback((text: string) => {
    if (!enabled || !text || text === lastTextRef.current) return;
    lastTextRef.current = text;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synthRef.current.speak(utterance);
  }, [enabled]);

  // Read page content when route changes
  useEffect(() => {
    if (!enabled) {
      synthRef.current.cancel();
      setSpeaking(false);
      lastTextRef.current = '';
      return;
    }

    const timer = setTimeout(() => {
      const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
      const headings = main.querySelectorAll('h1, h2, h3');
      const texts: string[] = [];
      headings.forEach(h => {
        if (h.textContent) texts.push(h.textContent.trim());
      });
      const paragraphs = main.querySelectorAll('p');
      paragraphs.forEach(p => {
        if (p.textContent) texts.push(p.textContent.trim());
      });
      const content = texts.slice(0, 5).join('. ');
      if (content) speakText(content);
    }, 800);

    return () => clearTimeout(timer);
  }, [enabled, speakText]);

  // Listen for route changes
  useEffect(() => {
    if (!enabled) return;
    lastTextRef.current = '';
  }, [enabled]);

  const toggle = () => {
    if (enabled) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
    setEnabled(!enabled);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Button
  onClick={toggle}
  size="lg"
  className={`flex items-center justify-center rounded-full w-14 h-14 shadow-elevated p-0 ${
    enabled
      ? speaking
        ? 'bg-primary text-primary-foreground animate-pulse'
        : 'bg-primary text-primary-foreground'
      : 'bg-card text-muted-foreground border border-border hover:text-foreground'
  }`}
  title={enabled ? 'Disable Voice Assistant' : 'Enable Voice Assistant'}
>
  {enabled ? (
    <Volume2 className="w-7 h-7" />
  ) : (
    <VolumeX className="w-7 h-7" />
  )}
</Button>
      {enabled && (
        <span className="absolute -top-8 right-0 text-xs bg-card text-foreground px-2 py-1 rounded shadow whitespace-nowrap">
          Voice Assistant ON
        </span>
      )}
    </div>
  );
};

export default VoiceAssistant;
