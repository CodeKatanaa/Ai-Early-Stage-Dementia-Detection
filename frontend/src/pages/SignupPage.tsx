/**
 * SignupPage.tsx  — UPDATED
 * ──────────────────────────
 * Replace src/pages/SignupPage.tsx with this file.
 * signup() is now async and calls the Flask backend.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const SignupPage = () => {
  const navigate     = useNavigate();
  const { signup }   = useAuth();
  const [form, setForm] = useState({
    fullName:"", age:"", email:"", phone:"",
    caretakerName:"", caretakerPhone:"",
    password:"", confirmPassword:"",
  });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { fullName, age, email, phone, caretakerName, caretakerPhone, password, confirmPassword } = form;
    if (!fullName||!age||!email||!phone||!caretakerName||!caretakerPhone||!password||!confirmPassword) {
      setError("All fields are required"); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Invalid email format"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      await signup({ fullName, age: parseInt(age), email, phone, caretakerName, caretakerPhone, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 py-8 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-semibold text-foreground">Create Account</h1>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-elevated">
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <p className="text-destructive text-sm text-center bg-destructive/10 rounded-lg p-2">{error}</p>}
              <div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Full Name" className="pl-10" value={form.fullName} onChange={e => update("fullName", e.target.value)} />
              </div>
              <Input type="number" placeholder="Age" min={1} max={150} value={form.age} onChange={e => update("age", e.target.value)} />
              <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="pl-10" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Phone Number" className="pl-10" value={form.phone} onChange={e => update("phone", e.target.value)} />
              </div>
              <div className="relative"><Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Caretaker Name" className="pl-10" value={form.caretakerName} onChange={e => update("caretakerName", e.target.value)} />
              </div>
              <div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Caretaker Phone" className="pl-10" value={form.caretakerPhone} onChange={e => update("caretakerPhone", e.target.value)} />
              </div>
              <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type={showPw ? "text" : "password"} placeholder="Password" className="pl-10 pr-10" value={form.password} onChange={e => update("password", e.target.value)} />
                <button type="button" className="absolute right-3 top-3 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} />
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;