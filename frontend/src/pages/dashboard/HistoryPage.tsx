/**
 * HistoryPage.tsx — UPDATED
 * ──────────────────────────
 * Replace src/pages/dashboard/HistoryPage.tsx with this file.
 * Reads history from AuthContext (which now fetches from Flask backend).
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, TrendingUp, Brain, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const riskColor = (level: string) => {
  if (level === "Low")      return "text-success bg-success/10";
  if (level === "Moderate") return "text-warning bg-warning/10";
  return "text-danger bg-danger/10";
};

const HistoryPage = () => {
  const { history, refreshHistory } = useAuth() as any;
  const navigate = useNavigate();

  useEffect(() => {
    refreshHistory?.();
  }, []);

  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Brain className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">No assessments yet</h2>
        <p className="text-muted-foreground mb-6">Complete your first screening test to see results here.</p>
        <button className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground font-medium"
          onClick={() => navigate("/screening")}>Start Screening</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Assessment History</h1>
        <p className="text-muted-foreground mt-1">{history.length} assessment{history.length !== 1 ? "s" : ""} recorded</p>
      </div>

      <div className="space-y-4">
        {history.map((result: any, i: number) => (
          <div key={result.id || i}
            className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Assessment #{history.length - i}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(result.date).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${riskColor(result.riskLevel)}`}>
                {result.riskLevel} Risk
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <ScoreCard icon={<Activity className="h-4 w-4" />}
                label="Speech Risk" value={`${result.speechScore?.toFixed(1) ?? "—"}%`} />
              <ScoreCard icon={<Brain className="h-4 w-4" />}
                label="Cognitive Risk" value={`${result.cognitiveScore?.toFixed(1) ?? "—"}%`} />
              <ScoreCard icon={<TrendingUp className="h-4 w-4" />}
                label="Overall Risk" value={`${result.overallRisk?.toFixed(1) ?? "—"}%`} />
            </div>

            {result.dementiaProb !== undefined && (
              <p className="mt-3 text-xs text-muted-foreground">
                ML dementia probability: <strong>{(result.dementiaProb * 100).toFixed(1)}%</strong>
                {result.modelUsed && <span className="ml-2">· model: {result.modelUsed}</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ScoreCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-accent rounded-xl p-3 text-center">
    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <div className="text-lg font-bold text-foreground">{value}</div>
  </div>
);

export default HistoryPage;