import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, TestResult } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, addTestResult } = useAuth();
  const result = location.state as TestResult;
  const savedRef = useRef(false);

  useEffect(() => {
    if (result && !savedRef.current) {
      savedRef.current = true;
      addTestResult(result);
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No results to display.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const riskColor = result.riskLevel === 'Low' ? 'hsl(150, 60%, 40%)' : result.riskLevel === 'Moderate' ? 'hsl(40, 90%, 55%)' : 'hsl(0, 72%, 55%)';
  const riskBg = result.riskLevel === 'Low' ? 'bg-success/10 text-success' : result.riskLevel === 'Moderate' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger';

  const gaugeData = [
    { name: 'Risk', value: result.overallRisk },
    { name: 'Remaining', value: 100 - result.overallRisk },
  ];

  const barData = [
    { name: 'Speech Risk', score: result.speechScore },
    { name: 'Cognitive Risk', score: result.cognitiveScore },
  ];

  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 3);

  const getMessage = () => {
    if (result.riskLevel === 'Low') return 'Your results suggest low risk. Continue healthy habits. Return for reassessment in 3 months.';
    if (result.riskLevel === 'Moderate') return 'Your results suggest moderate risk. We recommend consulting a specialist. Return in 3 months.';
    return 'Your results suggest high risk. Please consult a doctor or neurologist as soon as possible.';
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('MindGuard Screening Report', 20, 25);
      doc.setFontSize(12);
      doc.text(`Name: ${user?.fullName || 'N/A'}`, 20, 40);
      doc.text(`Date: ${new Date(result.date).toLocaleDateString()}`, 20, 50);
      doc.text(`Overall Risk: ${result.overallRisk}% (${result.riskLevel})`, 20, 65);
      doc.text(`Speech Risk Score: ${result.speechScore}%`, 20, 75);
      doc.text(`Cognitive Risk Score: ${result.cognitiveScore}%`, 20, 85);
      doc.text('', 20, 95);
      doc.text('Recommendation:', 20, 105);
      const lines = doc.splitTextToSize(getMessage(), 170);
      doc.text(lines, 20, 115);
      doc.text(`Next Assessment: ${nextDate.toLocaleDateString()}`, 20, 140);
      doc.save('mindguard-report.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Your Screening Results</h1>
        <p className="text-muted-foreground mb-8">Assessment completed on {new Date(result.date).toLocaleDateString()}</p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Overall Risk</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={gaugeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={180} endAngle={0} dataKey="value">
                  <Cell fill={riskColor} />
                  <Cell fill="hsl(220, 20%, 90%)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="-mt-8">
              <span className="text-4xl font-bold" style={{ color: riskColor }}>{result.overallRisk}%</span>
              <p className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-semibold ${riskBg}`}>{result.riskLevel} Risk</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? 'hsl(214, 60%, 55%)' : 'hsl(248, 76%, 67%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl p-6 mb-8 ${riskBg}`}>
          <p className="text-lg font-medium">{getMessage()}</p>
        </div>

        {result.riskLevel !== 'Low' && (
          <div className="bg-card rounded-2xl p-8 shadow-card mb-8 space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Recommended Actions</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Schedule an appointment with a neurologist</li>
              <li>• Engage in regular cognitive exercises</li>
              <li>• Maintain a healthy diet and exercise routine</li>
              <li>• Keep a daily journal to track cognitive changes</li>
              <li>• Stay socially active and engaged</li>
            </ul>
            <div className="pt-4">
              <Button variant="outline" onClick={() => window.open('https://www.google.com/maps/search/neurologist+near+me', '_blank')}>
                <MapPin className="h-4 w-4 mr-2" /> Find Nearby Specialists
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Button className="gradient-primary text-primary-foreground" onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" /> Next Test: {nextDate.toLocaleDateString()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
