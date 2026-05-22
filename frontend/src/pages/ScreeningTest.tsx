import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sceneImage from '@/assets/image.webp';
import { apiAssess } from '@/services/api';

const TOTAL_STEPS = 14;
const SPEECH_TIME = 60;
const COG_TIME = 15;

const P: React.CSSProperties = {
  padding: '12px 28px', background: 'hsl(214,60%,55%)', color: 'white',
  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
};
const O: React.CSSProperties = {
  padding: '10px 20px', background: 'white', color: 'hsl(214,60%,55%)',
  border: '1.5px solid hsl(214,60%,55%)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer',
};
const INP: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
  border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box',
};
const CARD: React.CSSProperties = {
  background: 'white', borderRadius: 16, padding: '28px 32px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 16,
};

// ── WAV conversion (Safari compatible) ──────────────────────────────────────
async function blobToWavBase64(blob: Blob): Promise<string> {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuf = await blob.arrayBuffer();
    const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
    const numCh = audioBuf.numberOfChannels;
    const sr = audioBuf.sampleRate;
    const ns = audioBuf.length;
    const wavBuf = new ArrayBuffer(44 + ns * numCh * 2);
    const view = new DataView(wavBuf);
    const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    ws(0,'RIFF'); view.setUint32(4, 36 + ns * numCh * 2, true);
    ws(8,'WAVE'); ws(12,'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, numCh, true); view.setUint32(24, sr, true);
    view.setUint32(28, sr * numCh * 2, true); view.setUint16(32, numCh * 2, true); view.setUint16(34, 16, true);
    ws(36,'data'); view.setUint32(40, ns * numCh * 2, true);
    let offset = 44;
    for (let i = 0; i < ns; i++) for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, audioBuf.getChannelData(ch)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); offset += 2;
    }
    await audioCtx.close();
    const wb = new Blob([wavBuf], { type: 'audio/wav' });
    const buf = await wb.arrayBuffer();
    return btoa(new Uint8Array(buf).reduce((d, b) => d + String.fromCharCode(b), ''));
  } catch {
    const buf = await blob.arrayBuffer();
    return btoa(new Uint8Array(buf).reduce((d, b) => d + String.fromCharCode(b), ''));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 6 QUESTION VARIANT BANKS — must match backend EXACTLY
// ════════════════════════════════════════════════════════════════════════════

const PASSAGES = [
  `"Every morning, Sarah wakes up at 7 o'clock. She makes herself a cup of tea and reads the newspaper. Then she takes her dog, Max, for a walk in the park. After the walk, she has breakfast with her husband, Tom, before heading to work at the library."`,
  `"Robert enjoys gardening on weekends. Every Saturday he wakes up early and waters his plants before the sun gets too hot. He grows tomatoes, peppers, and herbs in his backyard. In the afternoon he bakes bread and shares it with his neighbours."`,
  `"Meena is a school teacher who travels by bus every day. She leaves home at eight in the morning with a packed lunch. Her school is near a busy market. After classes she stops at the library to return books before going home."`,
  `"James works at the post office from Monday to Friday. He sorts letters in the morning and delivers parcels on his bicycle in the afternoon. On his way home he often buys groceries and cooks dinner for his two children."`,
  `"Priya starts her day with yoga at six in the morning. After breakfast she drops her son at school and goes to her office by train. In the evening she attends a music class and practises the flute for thirty minutes before bed."`,
  `"David is a retired doctor who lives near the sea. Each morning he walks along the beach and collects shells. He reads medical journals in the afternoon and meets his friends for coffee every Thursday at the local café."`,
];

const TASK3_PROMPTS = [
  "Tell me about your typical day from when you wake up until you go to sleep.",
  "Describe your home — the rooms, what is in them, and what you usually do there.",
  "Tell me about your favourite hobby or activity and how you spend time doing it.",
  "Describe a recent trip or outing you took — where you went and what you did.",
  "Tell me about your neighbourhood — the streets, shops, and people around you.",
  "Describe what you usually do on weekends from morning until evening.",
];

const MATH_SETS = [
  { q: `You have <strong>₹1000</strong>. You buy a dozen apples for <strong>₹200</strong> and a tricycle for <strong>₹500</strong>.<br/>How much did you spend? How much is left?`, spent: '700', rem: '300' },
  { q: `You have <strong>₹800</strong>. You buy a school bag for <strong>₹350</strong> and a water bottle for <strong>₹150</strong>.<br/>How much did you spend? How much is left?`, spent: '500', rem: '300' },
  { q: `You have <strong>₹1200</strong>. You spend <strong>₹450</strong> on vegetables and <strong>₹300</strong> on medicine.<br/>How much did you spend? How much is left?`, spent: '750', rem: '450' },
  { q: `You have <strong>₹600</strong>. You buy a book for <strong>₹120</strong> and a pen set for <strong>₹80</strong>.<br/>How much did you spend? How much is left?`, spent: '200', rem: '400' },
  { q: `You have <strong>₹2000</strong>. You pay <strong>₹900</strong> for a phone repair and <strong>₹350</strong> for groceries.<br/>How much did you spend? How much is left?`, spent: '1250', rem: '750' },
  { q: `You have <strong>₹500</strong>. You buy a shirt for <strong>₹180</strong> and socks for <strong>₹70</strong>.<br/>How much did you spend? How much is left?`, spent: '250', rem: '250' },
];

const MEMORY_SETS = [
  [['🍎','Apple'],  ['🖊️','Pen'],       ['👔','Tie'],      ['🏠','House'],    ['🚗','Car']],
  [['🌸','Flower'], ['⌚','Watch'],      ['📚','Book'],     ['🎂','Cake'],     ['🐟','Fish']],
  [['🍋','Lemon'],  ['🔑','Key'],        ['🎩','Hat'],      ['🧲','Magnet'],   ['🌙','Moon']],
  [['🍇','Grapes'], ['✂️','Scissors'],  ['🎸','Guitar'],   ['🌍','Globe'],    ['🐘','Elephant']],
  [['🥥','Coconut'],['💡','Bulb'],       ['🎯','Target'],   ['🌊','Wave'],     ['🏆','Trophy']],
  [['🥭','Mango'],  ['🕐','Clock'],      ['☂️','Umbrella'],['🪑','Chair'],    ['🚂','Train']],
];

const CLOCK_SETS = [
  { display: '10:50 (10 minutes to 11)', h: 330, m: 300 },
  { display: '3:15 (quarter past 3)',    h: 97,  m: 90  },
  { display: '6:30 (half past 6)',       h: 195, m: 180 },
  { display: '9:00 (nine o\'clock)',     h: 270, m: 0   },
  { display: '12:45 (quarter to 1)',     h: 22,  m: 270 },
  { display: '7:20 (twenty past 7)',     h: 220, m: 120 },
];

const SHAPE_SETS = [
  { identify: 'triangle', largest: 'circle'  },
  { identify: 'circle',   largest: 'triangle'},
  { identify: 'square',   largest: 'circle'  },
  { identify: 'triangle', largest: 'square'  },
  { identify: 'circle',   largest: 'square'  },
  { identify: 'square',   largest: 'triangle'},
];

const STORY_SETS = [
  {
    text: <>Mary went to the <strong>market</strong> on Tuesday morning. She bought <strong>three bags</strong> of vegetables and a loaf of bread. On her way home she met her old friend John walking his dog. They talked before Mary caught the <strong>bus</strong> home.</>,
    qs: [
      { q:'1. Where did Mary go?',          opts:['market','store','park','school'],                       ans:'market'  },
      { q:'2. How many bags did she buy?',   opts:['two','three','four','five'],                            ans:'three'   },
      { q:'3. How did Mary get home?',       opts:['walked','bus','taxi','car'],                            ans:'bus'     },
    ],
  },
  {
    text: <>Ravi went to the <strong>hospital</strong> on Monday. He waited for <strong>two hours</strong> to see the doctor. The doctor gave him medicine and told him to rest. Ravi took an <strong>auto</strong> back home.</>,
    qs: [
      { q:'1. Where did Ravi go?',           opts:['hospital','school','market','park'],                    ans:'hospital'    },
      { q:'2. How long did he wait?',         opts:['one hour','two hours','three hours','four hours'],      ans:'two hours'   },
      { q:'3. How did Ravi get home?',        opts:['bus','train','auto','walked'],                          ans:'auto'        },
    ],
  },
  {
    text: <>Sunita visited the <strong>library</strong> on Friday afternoon. She borrowed <strong>four books</strong> about history. She met her teacher <strong>Mrs Sharma</strong> there. Sunita walked home through the park.</>,
    qs: [
      { q:'1. Where did Sunita go?',          opts:['library','hospital','market','school'],                 ans:'library'     },
      { q:'2. How many books did she borrow?', opts:['two','three','four','five'],                           ans:'four'        },
      { q:'3. Who did Sunita meet?',           opts:['her friend','her mother','Mrs Sharma','a stranger'],   ans:'Mrs Sharma'  },
    ],
  },
  {
    text: <>Arun went to the <strong>railway station</strong> on Sunday. He bought a ticket for <strong>Chennai</strong> and waited on platform five. His train was late. He called his <strong>sister</strong> when he boarded.</>,
    qs: [
      { q:'1. Where did Arun go?',            opts:['airport','railway station','bus stand','hotel'],        ans:'railway station' },
      { q:'2. Where was he going?',            opts:['Mumbai','Chennai','Delhi','Kolkata'],                   ans:'Chennai'         },
      { q:'3. Who did he call?',               opts:['brother','mother','sister','friend'],                   ans:'sister'          },
    ],
  },
  {
    text: <>Lakshmi cooked a meal for her family on <strong>Sunday</strong>. She made rice, dal, and <strong>five curries</strong>. Her son helped her. They all ate together and then watched <strong>television</strong>.</>,
    qs: [
      { q:'1. When did Lakshmi cook?',         opts:['Saturday','Sunday','Monday','Friday'],                  ans:'Sunday'      },
      { q:'2. How many curries did she make?',  opts:['three','four','five','six'],                            ans:'five'        },
      { q:'3. What did they do after eating?',  opts:['slept','went out','watched television','played'],       ans:'television'  },
    ],
  },
  {
    text: <>Aisha rode her <strong>bicycle</strong> to the <strong>park</strong> on Saturday morning. She met <strong>six friends</strong> there and they played cricket for two hours. Afterwards they bought ice cream from a nearby shop.</>,
    qs: [
      { q:'1. How did Aisha travel?',           opts:['bus','bicycle','auto','walked'],                        ans:'bicycle'  },
      { q:'2. Where did she go?',               opts:['school','market','park','hospital'],                    ans:'park'     },
      { q:'3. How many friends did she meet?',  opts:['four','five','six','seven'],                            ans:'six'      },
    ],
  },
];

const FLUENCY_SETS = [
  { prompt: 'Name as many ANIMALS as you can',    key: 'animals'     },
  { prompt: 'Name as many FRUITS as you can',     key: 'fruits'      },
  { prompt: 'Name as many VEGETABLES as you can', key: 'vegetables'  },
  { prompt: 'Name as many COUNTRIES as you can',  key: 'countries'   },
  { prompt: 'Name as many SPORTS as you can',     key: 'sports'      },
  { prompt: 'Name as many COLOURS as you can',    key: 'colours'     },
];

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function ScreeningTest() {
  const navigate = useNavigate();

  // Pick one random set index on mount — same set for all questions in this session
  const [setIdx] = useState(() => Math.floor(Math.random() * 6));

  // Current variant data
  const passage   = PASSAGES[setIdx];
  const task3     = TASK3_PROMPTS[setIdx];
  const mathSet   = MATH_SETS[setIdx];
  const memSet    = MEMORY_SETS[setIdx];
  const clockSet  = CLOCK_SETS[setIdx];
  const shapeSet  = SHAPE_SETS[setIdx];
  const storySet  = STORY_SETS[setIdx];
  const fluency   = FLUENCY_SETS[setIdx];

  const [step, setStep]               = useState(0);
  const [speech1, setSpeech1]         = useState('');
  const [speech2, setSpeech2]         = useState('');
  const [speech3, setSpeech3]         = useState('');
  const [dayOfWeek, setDayOfWeek]     = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [location, setLocation]       = useState('');
  const [mathSpent, setMathSpent]     = useState('');
  const [mathRem, setMathRem]         = useState('');
  const [fluencyItems, setFluencyItems] = useState<string[]>([]);
  const [fluencyInput, setFluencyInput] = useState('');
  const [fluencySecs, setFluencySecs]   = useState(60);
  const [fluencyGo, setFluencyGo]       = useState(false);
  const [recall, setRecall]           = useState(['','','','','']);
  const [hourAngle, setHourAngle]     = useState(0);
  const [minAngle, setMinAngle]       = useState(0);
  const [shapeMark, setShapeMark]     = useState('');
  const [shapeBig, setShapeBig]       = useState('');
  const [storyAns, setStoryAns]       = useState(['','','']);
  const [recording, setRecording]     = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [speechDone, setSpeechDone]   = useState(false);
  const [speechSecs, setSpeechSecs]   = useState(SPEECH_TIME);
  const [cogSecs, setCogSecs]         = useState(COG_TIME);
  const [memSecs, setMemSecs]         = useState(10);
  const [storyPhase, setStoryPhase]   = useState<'read'|'answer'>('read');
  const [submitting, setSubmitting]   = useState(false);
  const [dragging, setDragging]       = useState<'hour'|'minute'|null>(null);

  const recRef    = useRef<any>(null);
  const finalRef  = useRef('');
  const sTimerRef = useRef<any>(null);
  const cTimerRef = useRef<any>(null);
  const wordsRef  = useRef<any>({ speech1:0, speech2:0, speech3:0 });
  const audioRef  = useRef<any>({});
  const chunksRef = useRef<Blob[]>([]);
  const mrRef     = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pct = ((step+1)/TOTAL_STEPS)*100;

  // cog timer
  useEffect(()=>{
    clearInterval(cTimerRef.current);
    if(step>=4&&step!==7&&step!==9){
      setCogSecs(COG_TIME);
      cTimerRef.current=setInterval(()=>setCogSecs(v=>{if(v<=1){clearInterval(cTimerRef.current);return 0;}return v-1;}),1000);
    }
    return()=>clearInterval(cTimerRef.current);
  },[step]);

  // fluency timer
  useEffect(()=>{
    if(!fluencyGo||fluencySecs<=0)return;
    const t=setInterval(()=>setFluencySecs(v=>v-1),1000);
    return()=>clearInterval(t);
  },[fluencyGo,fluencySecs]);

  // memory timer
  useEffect(()=>{
    if(step!==7)return;
    if(memSecs<=0){doNext();return;}
    const t=setInterval(()=>setMemSecs(v=>v-1),1000);
    return()=>clearInterval(t);
  },[step,memSecs]);

  // clock canvas
  useEffect(()=>{
    if(step!==11)return;
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext('2d')!;
    const cx=150,cy=150,r=130;
    ctx.clearRect(0,0,300,300);
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='#3b82f6';ctx.lineWidth=3;ctx.stroke();
    for(let i=1;i<=12;i++){
      const a=(i*30-90)*Math.PI/180;
      ctx.fillStyle='#1e293b';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(String(i),cx+(r-20)*Math.cos(a),cy+(r-20)*Math.sin(a));
    }
    const hand=(ang:number,len:number,col:string,w:number)=>{
      const a=(ang-90)*Math.PI/180;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+len*Math.cos(a),cy+len*Math.sin(a));
      ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke();
    };
    hand(hourAngle,60,'#1e293b',4);hand(minAngle,95,'#3b82f6',3);
    ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fillStyle='#1e293b';ctx.fill();
  },[step,hourAngle,minAngle]);

  // ── Recording ──────────────────────────────────────────────────────────────
  const startRec=(field:'speech1'|'speech2'|'speech3')=>{
    if(recRef.current){try{recRef.current.stop();}catch{}}
    finalRef.current='';setTranscript('');setSpeechDone(false);
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(SR){
      const r=new SR();r.continuous=true;r.interimResults=true;r.lang='en-US';
      r.onresult=(e:any)=>{
        for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)finalRef.current+=e.results[i][0].transcript+' ';
        let interim='';for(let i=e.resultIndex;i<e.results.length;i++)if(!e.results[i].isFinal)interim+=e.results[i][0].transcript;
        setTranscript(finalRef.current+interim);
        wordsRef.current[field]=finalRef.current.trim().split(/\s+/).filter(Boolean).length;
        if(field==='speech1')setSpeech1(finalRef.current.trim());
        if(field==='speech2')setSpeech2(finalRef.current.trim());
        if(field==='speech3')setSpeech3(finalRef.current.trim());
      };
      r.onerror=()=>{};
      r.onend=()=>{if(recRef.current===r&&recording){try{r.start();}catch{}}};
      recRef.current=r;r.start();
    }
    chunksRef.current=[];
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
      const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':MediaRecorder.isTypeSupported('audio/mp4')?'audio/mp4':'';
      const mr=mimeType?new MediaRecorder(stream,{mimeType}):new MediaRecorder(stream);
      mr.ondataavailable=(e:any)=>{if(e.data.size>0)chunksRef.current.push(e.data);};
      mr.onstop=async()=>{
        stream.getTracks().forEach((t:any)=>t.stop());
        try{const blob=new Blob(chunksRef.current,{type:mr.mimeType});const b64=await blobToWavBase64(blob);audioRef.current[field]=b64;}catch{}
      };
      mr.start(1000);mrRef.current=mr;
    }).catch(()=>{});
    clearInterval(sTimerRef.current);setSpeechSecs(SPEECH_TIME);
    sTimerRef.current=setInterval(()=>setSpeechSecs(v=>{if(v<=1){clearInterval(sTimerRef.current);stopRec(field);return 0;}return v-1;}),1000);
    setRecording(true);
  };

  const stopRec=(field:'speech1'|'speech2'|'speech3')=>{
    if(recRef.current){recRef.current.onend=null;try{recRef.current.stop();}catch{};recRef.current=null;}
    if(mrRef.current){try{mrRef.current.stop();}catch{};mrRef.current=null;}
    clearInterval(sTimerRef.current);
    wordsRef.current[field]=finalRef.current.trim().split(/\s+/).filter(Boolean).length;
    if(field==='speech1')setSpeech1(finalRef.current.trim());
    if(field==='speech2')setSpeech2(finalRef.current.trim());
    if(field==='speech3')setSpeech3(finalRef.current.trim());
    setRecording(false);setSpeechDone(true);
  };

  const resetRec=(field:'speech1'|'speech2'|'speech3')=>{
    finalRef.current='';setTranscript('');setSpeechDone(false);setSpeechSecs(SPEECH_TIME);
    wordsRef.current[field]=0;
    if(field==='speech1')setSpeech1('');
    if(field==='speech2')setSpeech2('');
    if(field==='speech3')setSpeech3('');
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const doNext=()=>{
    clearInterval(sTimerRef.current);clearInterval(cTimerRef.current);
    if(recRef.current){recRef.current.onend=null;try{recRef.current.stop();}catch{};recRef.current=null;}
    if(mrRef.current){try{mrRef.current.stop();}catch{};mrRef.current=null;}
    setRecording(false);setSpeechDone(false);setTranscript('');setSpeechSecs(SPEECH_TIME);
    if(step+1>=TOTAL_STEPS){doSubmit();return;}
    setStep(s=>s+1);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const doSubmit=async()=>{
    setSubmitting(true);
    const tw=wordsRef.current.speech1+wordsRef.current.speech2+wordsRef.current.speech3;
    try{
      const res=await apiAssess({
        transcripts:{speech1,speech2,speech3},
        audioClips:audioRef.current,
        cognitiveAnswers:{
          dayOfWeek,currentYear,location,
          mathSpent,mathRemaining:mathRem,
          animals:fluencyItems,
          objectRecall:recall,
          clockHourAngle:hourAngle,clockMinuteAngle:minAngle,
          shapeClicked:shapeMark,largestShape:shapeBig,
          storyAnswers:storyAns,
        },
        // Tell backend which variant set was used so it checks correct answers
        sessionMeta:{
          setIdx,
          mathExpected:{spent:mathSet.spent,rem:mathSet.rem},
          memoryObjects:memSet.map(([,label])=>label as string),
          clockTarget:{h:clockSet.h,m:clockSet.m},
          shapeExpected:{identify:shapeSet.identify,largest:shapeSet.largest},
          storyExpected:storySet.qs.map(q=>q.ans),
          fluencyCategory:fluency.key,
        },
      });
      navigate('/results',{state:res});
    }catch{
      const sr=tw===0?95:tw<10?75:tw<40?45:20;
      const ov=Math.round(sr*0.7+70*0.3);
      navigate('/results',{state:{id:Date.now().toString(),date:new Date().toISOString(),speechScore:sr,cognitiveScore:70,overallRisk:ov,riskLevel:ov<=40?'Low':ov<=70?'Moderate':'High'}});
    }
  };

  // ── UI helpers ──────────────────────────────────────────────────────────────
  const CogBar=()=>(
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
      <div style={{padding:'4px 12px',borderRadius:999,fontSize:13,fontWeight:700,background:cogSecs<=5?'#fee2e2':cogSecs<=10?'#ffedd5':'#eff6ff',color:cogSecs<=5?'#dc2626':cogSecs<=10?'#ea580c':'#2563eb',border:`1px solid ${cogSecs<=5?'#fca5a5':cogSecs<=10?'#fdba74':'#bfdbfe'}`}}>⏱ {cogSecs}s</div>
      <div style={{flex:1,height:6,background:'#e2e8f0',borderRadius:3}}><div style={{height:'100%',borderRadius:3,background:cogSecs<=5?'#ef4444':cogSecs<=10?'#f97316':'#3b82f6',width:`${(cogSecs/COG_TIME)*100}%`,transition:'width 1s linear'}}/></div>
      <span style={{fontSize:12,color:'#94a3b8'}}>Answer within {COG_TIME}s</span>
    </div>
  );

  const Mic=({field}:{field:'speech1'|'speech2'|'speech3'})=>(
    <div style={{textAlign:'center'}}>
      {(recording||speechDone)&&(
        <div style={{display:'flex',alignItems:'center',gap:10,maxWidth:360,margin:'0 auto 14px'}}>
          <div style={{padding:'3px 10px',borderRadius:999,fontSize:12,fontWeight:700,background:speechSecs<=10?'#fee2e2':'#eff6ff',color:speechSecs<=10?'#dc2626':'#2563eb',border:`1px solid ${speechSecs<=10?'#fca5a5':'#bfdbfe'}`}}>⏱ {speechSecs}s</div>
          <div style={{flex:1,height:5,background:'#e2e8f0',borderRadius:3}}><div style={{height:'100%',borderRadius:3,background:'#3b82f6',width:`${((SPEECH_TIME-speechSecs)/SPEECH_TIME)*100}%`,transition:'width 1s'}}/></div>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
        {!recording&&!speechDone&&(<button style={{width:72,height:72,borderRadius:'50%',background:'white',border:'2px solid #3b82f6',cursor:'pointer',fontSize:30}} onClick={()=>startRec(field)}>🎙</button>)}
        {recording&&(<button style={{width:72,height:72,borderRadius:'50%',background:'#fee2e2',border:'2px solid #ef4444',cursor:'pointer',fontSize:30}} onClick={()=>stopRec(field)}>⏹</button>)}
        {speechDone&&!recording&&(<button style={O} onClick={()=>resetRec(field)}>🔄 Re-record</button>)}
      </div>
      <p style={{fontSize:13,color:'#94a3b8',marginTop:10}}>
        {recording?'🔴 Recording… click ⏹ to stop':speechDone?`✅ Recorded (${(wordsRef.current as any)[field]||0} words). Continue or re-record.`:'👆 Click microphone to start (60 seconds)'}
      </p>
      {transcript&&(
        <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:'10px 14px',maxWidth:480,margin:'10px auto 0',textAlign:'left',fontSize:14,lineHeight:1.7,maxHeight:110,overflowY:'auto'}}>
          <p style={{fontSize:11,color:'#94a3b8',marginBottom:3,fontWeight:600}}>What you said:</p>
          {transcript}
        </div>
      )}
    </div>
  );

  const OptBtn=({label,val,cur,set}:{label:string;val:string;cur:string;set:(v:string)=>void})=>(
    <button onClick={()=>set(val)} style={{padding:'10px 18px',borderRadius:8,fontSize:14,fontWeight:500,cursor:'pointer',background:cur===val?'#3b82f6':'white',color:cur===val?'white':'#374151',border:cur===val?'1.5px solid #3b82f6':'1.5px solid #d1d5db'}}>{label}</button>
  );

  // ── Steps ───────────────────────────────────────────────────────────────────
  const renderStep=()=>{
    switch(step){
      case 0:return(
        <div style={{textAlign:'center'}}>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Phase 1: Speech Analysis</h2>
          <h3 style={{fontSize:17,fontWeight:600,marginBottom:16,color:'#475569'}}>Task 1 of 3 — Describe the Image</h3>
          <img src={sceneImage} alt="Scene" style={{maxWidth:420,width:'100%',borderRadius:12,marginBottom:16}}/>
          <p style={{color:'#475569',marginBottom:20}}>Describe <strong>everything</strong> you see — people, objects, actions.</p>
          <Mic field="speech1"/>
        </div>
      );
      case 1:return(
        <div style={{textAlign:'center'}}>
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:16}}>Task 2 of 3 — Read the Passage Aloud</h3>
          <div style={{background:'#f1f5f9',borderRadius:12,padding:'18px 22px',maxWidth:500,margin:'0 auto 20px',textAlign:'left',fontSize:15,lineHeight:1.9,fontStyle:'italic',borderLeft:'4px solid #3b82f6'}}>
            {passage}
          </div>
          <p style={{color:'#475569',marginBottom:20}}>Read the passage above <strong>aloud</strong> clearly.</p>
          <Mic field="speech2"/>
        </div>
      );
      case 2:return(
        <div style={{textAlign:'center'}}>
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:16}}>Task 3 of 3 — Speak Freely</h3>
          <p style={{color:'#475569',marginBottom:20,fontSize:16,fontWeight:500}}>{task3}</p>
          <Mic field="speech3"/>
        </div>
      );
      case 3:return(
        <div style={{textAlign:'center',padding:'40px 0'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'hsl(214,60%,55%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,color:'white',margin:'0 auto 20px'}}>✓</div>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Speech Analysis Complete!</h2>
          <p style={{color:'#64748b'}}>Now moving to the <strong>Cognitive Assessment</strong>.</p>
          <p style={{color:'#94a3b8',fontSize:13,marginTop:8}}>Each question has a {COG_TIME}-second timer.</p>
        </div>
      );
      case 4:return(
        <div style={{textAlign:'center'}}>
          <CogBar/>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>What day of the week is it today?</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
            {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d=>(
              <OptBtn key={d} label={d} val={d} cur={dayOfWeek} set={setDayOfWeek}/>
            ))}
          </div>
        </div>
      );
      case 5:return(
        <div style={{textAlign:'center'}}>
          <CogBar/>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>What is the current year?</h3>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            {['2023','2024','2025','2026'].map(y=><OptBtn key={y} label={y} val={y} cur={currentYear} set={setCurrentYear}/>)}
          </div>
        </div>
      );
      case 6:return(
        <div style={{textAlign:'center',maxWidth:400,margin:'0 auto'}}>
          <CogBar/>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>What state or city are you currently in?</h3>
          <input style={INP} placeholder="Type your answer..." value={location} onChange={e=>setLocation(e.target.value)} autoFocus/>
        </div>
      );
      case 7:return(
        <div style={{textAlign:'center'}}>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Remember these 5 objects</h3>
          <p style={{color:'#64748b',marginBottom:8}}>You will be asked about them later. Time: <strong>{memSecs}s</strong></p>
          <div style={{background:'#e2e8f0',borderRadius:4,height:6,maxWidth:240,margin:'0 auto 20px'}}>
            <div style={{height:'100%',borderRadius:4,background:'#3b82f6',width:`${(memSecs/10)*100}%`,transition:'width 1s'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:28,fontSize:44,padding:'16px 0'}}>
            {memSet.map(([icon,label])=>(
              <div key={label as string} style={{textAlign:'center'}}>
                <div>{icon}</div><p style={{fontSize:12,marginTop:6}}>{label as string}</p>
              </div>
            ))}
          </div>
          <button style={O} onClick={()=>doNext()}>I've memorized them →</button>
        </div>
      );
      case 8:return(
        <div style={{textAlign:'center',maxWidth:420,margin:'0 auto'}}>
          <CogBar/>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>Math Problem</h3>
          <div style={{background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:10,padding:'14px 18px',marginBottom:20,textAlign:'left',lineHeight:1.8}}
            dangerouslySetInnerHTML={{__html:mathSet.q}}/>
          <div style={{display:'flex',gap:12}}>
            <input style={INP} type="number" placeholder="Amount Spent (₹)" value={mathSpent} onChange={e=>setMathSpent(e.target.value)}/>
            <input style={INP} type="number" placeholder="Amount Left (₹)" value={mathRem} onChange={e=>setMathRem(e.target.value)}/>
          </div>
        </div>
      );
      case 9:return(
        <div style={{textAlign:'center',maxWidth:420,margin:'0 auto'}}>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{fluency.prompt}</h3>
          <p style={{color:'#64748b',marginBottom:12,fontSize:14}}>You have 1 minute. Type each one and press Enter.</p>
          <div style={{fontSize:48,fontWeight:700,color:fluencySecs<=10?'#ef4444':'#3b82f6',marginBottom:12}}>{fluencySecs}s</div>
          {!fluencyGo&&fluencySecs===60&&<button style={P} onClick={()=>setFluencyGo(true)}>▶ Start Timer</button>}
          {fluencyGo&&(
            <div>
              <input style={INP} placeholder={`Type one and press Enter`} value={fluencyInput}
                onKeyDown={e=>{if(e.key==='Enter'&&fluencyInput.trim()){setFluencyItems(a=>[...a,fluencyInput.trim()]);setFluencyInput('');}}}
                onChange={e=>setFluencyInput(e.target.value)} autoFocus/>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginTop:12}}>
                {fluencyItems.map((a,i)=><span key={i} style={{padding:'4px 12px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:999,fontSize:13,color:'#2563eb'}}>{a}</span>)}
              </div>
            </div>
          )}
          {!fluencyGo&&fluencySecs<=0&&<p style={{color:'#64748b'}}>Time's up! You named <strong>{fluencyItems.length}</strong> items.</p>}
        </div>
      );
      case 10:return(
        <div style={{textAlign:'center',maxWidth:400,margin:'0 auto'}}>
          <CogBar/>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Object Recall</h3>
          <p style={{color:'#64748b',marginBottom:16}}>What were the <strong>5 objects</strong> you memorised?</p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[0,1,2,3,4].map(i=><input key={i} style={INP} placeholder={`Object ${i+1}`} value={recall[i]} onChange={e=>{const r=[...recall];r[i]=e.target.value;setRecall(r);}}/>)}
          </div>
        </div>
      );
      case 11:return(
        <div style={{textAlign:'center'}}>
          <CogBar/>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Draw a Clock</h3>
          <p style={{color:'#64748b',marginBottom:14}}>Set the clock to show <strong>{clockSet.display}</strong>. Drag the hands.</p>
          <div style={{display:'flex',justifyContent:'center'}}>
            <canvas ref={canvasRef} width={300} height={300}
              style={{border:'1px solid #e2e8f0',borderRadius:'50%',cursor:'crosshair',background:'white'}}
              onMouseDown={e=>{const rect=canvasRef.current!.getBoundingClientRect();const x=e.clientX-rect.left-150,y=e.clientY-rect.top-150;setDragging(Math.sqrt(x*x+y*y)<70?'hour':'minute');}}
              onMouseMove={e=>{if(!dragging)return;const rect=canvasRef.current!.getBoundingClientRect();const x=e.clientX-rect.left-150,y=e.clientY-rect.top-150;const a=Math.atan2(y,x)*180/Math.PI+90;if(dragging==='hour')setHourAngle(a);else setMinAngle(a);}}
              onMouseUp={()=>setDragging(null)} onMouseLeave={()=>setDragging(null)}/>
          </div>
          <p style={{fontSize:12,color:'#94a3b8',marginTop:10}}>Click near centre = hour hand · outer area = minute hand</p>
        </div>
      );
      case 12:return(
        <div>
          <CogBar/>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:16,textAlign:'center'}}>Shape Task</h3>
          {/* Q1 — identify shape */}
          <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:16}}>
            <p style={{fontWeight:600,marginBottom:12}}>❓ Q1: Click on the <strong>{shapeSet.identify.charAt(0).toUpperCase()+shapeSet.identify.slice(1)}</strong></p>
            <div style={{display:'flex',justifyContent:'center',alignItems:'flex-end',gap:32}}>
              {(['triangle','circle','square'] as const).map(shape=>{
                const isTarget=shape===shapeSet.identify;
                const isMarked=shapeMark===shape;
                return(
                  <div key={shape} style={{textAlign:'center',cursor:isTarget?'pointer':'default'}} onClick={()=>isTarget&&setShapeMark(shape)}>
                    {shape==='triangle'&&<svg width={90} height={80} viewBox="0 0 90 80"><polygon points="45,5 85,75 5,75" fill={isMarked?'#3b82f6':'none'} stroke="#3b82f6" strokeWidth={2.5}/>{isMarked&&<text x="45" y="52" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">✕</text>}</svg>}
                    {shape==='circle'&&<svg width={90} height={90} viewBox="0 0 90 90"><circle cx={45} cy={45} r={40} fill={isMarked?'#7c3aed':'none'} stroke="#7c3aed" strokeWidth={2.5}/>{isMarked&&<text x="45" y="50" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">✕</text>}</svg>}
                    {shape==='square'&&<svg width={70} height={70} viewBox="0 0 70 70"><rect x={5} y={5} width={60} height={60} fill={isMarked?'#16a34a':'none'} stroke="#16a34a" strokeWidth={2.5}/>{isMarked&&<text x="35" y="40" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">✕</text>}</svg>}
                    <p style={{fontSize:12,color:'#64748b'}}>{shape.charAt(0).toUpperCase()+shape.slice(1)}{isTarget?' ← click':''}</p>
                    {isMarked&&<p style={{fontSize:12,color:'#16a34a',fontWeight:600}}>✅ Marked!</p>}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Q2 — largest shape */}
          <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <p style={{fontWeight:600,marginBottom:12}}>❓ Q2: Click on the <strong>largest</strong> shape</p>
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:24,flexWrap:'wrap'}}>
              {([['triangle',70,'#3b82f6'],['circle',130,'#7c3aed'],['square',60,'#16a34a']] as [string,number,string][]).map(([key,size,col])=>(
                <div key={key} style={{textAlign:'center',cursor:'pointer'}} onClick={()=>setShapeBig(key)}>
                  {key==='triangle'&&<svg width={size} height={Math.round(size*0.88)} viewBox="0 0 70 62"><polygon points="35,4 66,58 4,58" fill={shapeBig===key?col:'none'} stroke={col} strokeWidth={2}/></svg>}
                  {key==='circle'&&<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={size/2-3} fill={shapeBig===key?col:'none'} stroke={col} strokeWidth={2}/></svg>}
                  {key==='square'&&<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><rect x={3} y={3} width={size-6} height={size-6} fill={shapeBig===key?col:'none'} stroke={col} strokeWidth={2}/></svg>}
                  <p style={{fontSize:12,color:'#64748b',marginTop:4}}>{key.charAt(0).toUpperCase()+key.slice(1)}</p>
                  {shapeBig===key&&<p style={{fontSize:12,color:'#2563eb',fontWeight:600}}>✓ Selected</p>}
                </div>
              ))}
            </div>
            {shapeBig&&<p style={{color:'#16a34a',textAlign:'center',marginTop:10,fontWeight:600}}>✅ You selected: {shapeBig}</p>}
          </div>
        </div>
      );
      case 13:
        if(storyPhase==='read')return(
          <div style={{textAlign:'center',maxWidth:520,margin:'0 auto'}}>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>Story Memory</h3>
            <p style={{color:'#64748b',marginBottom:14}}>Read carefully — questions follow.</p>
            <div style={{background:'#f1f5f9',borderRadius:12,padding:'18px 22px',textAlign:'left',lineHeight:1.9,fontSize:15,marginBottom:20}}>
              {storySet.text}
            </div>
            <button style={P} onClick={()=>setStoryPhase('answer')}>I'm Ready — Answer Questions →</button>
          </div>
        );
        return(
          <div style={{maxWidth:480,margin:'0 auto'}}>
            <CogBar/>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:16,textAlign:'center'}}>Story Questions</h3>
            {storySet.qs.map(({q,opts,ans},idx)=>(
              <div key={idx} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:16,marginBottom:12}}>
                <p style={{fontWeight:600,marginBottom:10}}>{q}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {opts.map(o=><button key={o} onClick={()=>{const s=[...storyAns];s[idx]=o;setStoryAns(s);}} style={{padding:'8px 16px',borderRadius:8,fontSize:14,cursor:'pointer',fontWeight:500,background:storyAns[idx]===o?'#3b82f6':'white',color:storyAns[idx]===o?'white':'#374151',border:storyAns[idx]===o?'1.5px solid #3b82f6':'1.5px solid #d1d5db'}}>{o.charAt(0).toUpperCase()+o.slice(1)}</button>)}
                </div>
              </div>
            ))}
          </div>
        );
      default:return null;
    }
  };

  if(submitting)return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,background:'#f8fafc'}}>
      <div style={{fontSize:64}}>🧠</div>
      <h2 style={{fontSize:24,fontWeight:700}}>Analysing your responses…</h2>
      <p style={{color:'#64748b'}}>Running ML model — please wait</p>
      <div style={{width:200,height:6,background:'#e2e8f0',borderRadius:3}}><div style={{width:'70%',height:'100%',background:'#3b82f6',borderRadius:3}}/></div>
    </div>
  );

  return(
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <div style={{position:'fixed',top:0,left:0,right:0,height:4,background:'#e2e8f0',zIndex:999}}>
        <div style={{height:'100%',background:'#3b82f6',width:`${pct}%`,transition:'width 0.4s'}}/>
      </div>
      <div style={{maxWidth:720,margin:'0 auto',padding:'60px 24px 80px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <button style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:14}} onClick={()=>navigate('/dashboard')}>← Back to Dashboard</button>
          <span style={{fontSize:13,color:'#94a3b8'}}>Step {step+1} of {TOTAL_STEPS}</span>
        </div>
        <div style={CARD}>{renderStep()}</div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:12}}>
          {step!==7&&!(step===9&&(fluencyGo&&fluencySecs>0))&&(
            <button style={P} onClick={doNext}>
              {step>=TOTAL_STEPS-1?'View Results ✓':'Continue →'}
            </button>
          )}
          {step===9&&!fluencyGo&&fluencySecs<=0&&(
            <button style={P} onClick={doNext}>Continue →</button>
          )}
        </div>
      </div>
    </div>
  );
}