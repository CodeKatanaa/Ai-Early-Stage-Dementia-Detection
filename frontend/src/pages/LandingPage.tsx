import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ClipboardCheck, BarChart3, UserCheck, Menu, X, Mail, User, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/hero-brain.jpg';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const handleStartScreening = () => {
    navigate(isAuthenticated ? '/screening' : '/login');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-display text-lg font-semibold text-foreground">ScreeningTool</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                <Button onClick={() => navigate('/signup')}>Sign Up</Button>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-card border-b border-border px-4 py-4 space-y-3">
            <a href="#about" className="block text-sm text-muted-foreground" onClick={() => setMobileMenu(false)}>About Us</a>
            <a href="#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setMobileMenu(false)}>How It Works</a>
            <a href="#contact" className="block text-sm text-muted-foreground" onClick={() => setMobileMenu(false)}>Contact Us</a>
            <div className="flex gap-2 pt-2">
              {isAuthenticated ? (
                <Button className="w-full" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              ) : (
                <>
                  <Button variant="ghost" className="flex-1" onClick={() => navigate('/login')}>Login</Button>
                  <Button className="flex-1" onClick={() => navigate('/signup')}>Sign Up</Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-16 min-h-[90vh] flex items-center gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Early Stage Dementia<br />
            <span className="text-gradient">Detection</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A simple, compassionate screening tool to help detect early signs of dementia.
          </p>
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground px-10 py-6 text-lg rounded-xl shadow-elevated hover:opacity-90 transition-opacity animate-fade-in"
            style={{ animationDelay: '0.4s' }}
            onClick={handleStartScreening}
          >
            Start Screening Test
          </Button>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-20 bg-card">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">About Us</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            ScreeningTool is a compassionate early-stage dementia screening platform designed to make cognitive health assessments accessible to everyone. Our tool combines speech analysis with cognitive assessments to provide a preliminary risk evaluation. Early detection is key to managing dementia — our mission is to empower individuals and their families with the knowledge they need to take proactive steps toward care.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-14">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: ClipboardCheck, title: 'Take the Test', desc: 'Complete a series of speech and cognitive tasks from the comfort of your home.' },
              { icon: BarChart3, title: 'Get Your Score', desc: 'Receive a comprehensive risk assessment with detailed breakdowns of your performance.' },
              { icon: UserCheck, title: 'Consult a Specialist', desc: 'Based on your results, get personalized recommendations and find specialists near you.' },
            ].map((step, i) => (
              <div key={i} className="gradient-card rounded-2xl p-8 shadow-card text-center hover:shadow-elevated transition-shadow">
                <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-5">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact" className="py-20 bg-card">
        <div className="container mx-auto px-4 max-w-lg">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-10">Contact Us</h2>
          {contactSent ? (
            <div className="text-center p-8 rounded-xl bg-accent">
              <p className="text-accent-foreground font-medium">Thank you! Your message has been sent.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Your Name" className="pl-10" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Your Email" className="pl-10" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea placeholder="Your Message" className="pl-10 min-h-[120px]" value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">ScreeningTool</span>
          </div>
          <p>© {new Date().getFullYear()} ScreeningTool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
