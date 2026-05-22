import { Link, useNavigate } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-semibold text-foreground">ScreeningTool</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
          <Link to="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          <Link to="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
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
          <Link to="/#about" className="block text-sm text-muted-foreground" onClick={() => setMobileMenu(false)}>About Us</Link>
          <Link to="/#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setMobileMenu(false)}>How It Works</Link>
          <Link to="/#contact" className="block text-sm text-muted-foreground" onClick={() => setMobileMenu(false)}>Contact Us</Link>
          <div className="flex gap-2 pt-2">
            {isAuthenticated ? (
              <Button className="w-full" onClick={() => { navigate('/dashboard'); setMobileMenu(false); }}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" className="flex-1" onClick={() => { navigate('/login'); setMobileMenu(false); }}>Login</Button>
                <Button className="flex-1" onClick={() => { navigate('/signup'); setMobileMenu(false); }}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
