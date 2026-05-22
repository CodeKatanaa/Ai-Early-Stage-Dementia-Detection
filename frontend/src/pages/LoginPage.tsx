/**
 * LoginPage.tsx  — UPDATED
 * ──────────────────────────
 * Replace src/pages/LoginPage.tsx with this file.
 * login() is now async and calls the Flask backend.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const LoginPage = () => {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const { toast }      = useToast();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("All fields required"); return; }
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) navigate("/dashboard");
      else    setError("Invalid email or password. Please sign up first.");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-semibold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-1">Sign in to continue your journey</p>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-elevated">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-destructive text-sm text-center bg-destructive/10 rounded-lg p-2">{error}</p>}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type={showPw ? "text" : "password"} placeholder="Password" className="pl-10 pr-10" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-3 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Logging in…" : "Login"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;