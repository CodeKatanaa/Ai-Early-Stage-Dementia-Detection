import { useNavigate } from 'react-router-dom';
import { Calendar, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const DashboardHome = () => {
  const { user, history } = useAuth();
  const navigate = useNavigate();
  const lastTest = history[0];

  const nextTestDate = lastTest
    ? new Date(new Date(lastTest.date).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()
    : 'Take your first test';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Here's your cognitive health overview.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="gradient-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Last Test Date</span>
          </div>
          <p className="text-xl font-semibold text-foreground">{lastTest ? new Date(lastTest.date).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="gradient-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Last Risk Score</span>
          </div>
          <p className="text-xl font-semibold text-foreground">{lastTest ? `${lastTest.overallRisk}% (${lastTest.riskLevel})` : 'N/A'}</p>
        </div>

        <div className="gradient-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Next Recommended</span>
          </div>
          <p className="text-xl font-semibold text-foreground">{nextTestDate}</p>
        </div>
      </div>

      <Button onClick={() => navigate('/screening')} className="gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-xl">
        Take New Screening Test <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default DashboardHome;
