import { useState, useRef } from 'react';
import { Camera, Save, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    age: String(user?.age || ''),
    email: user?.email || '',
    phone: user?.phone || '',
    caretakerName: user?.caretakerName || '',
    caretakerPhone: user?.caretakerPhone || '',
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile({ avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ ...form, age: parseInt(form.age) });
    setEditing(false);
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>

      <div className="bg-card rounded-xl p-8 shadow-card">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-display font-bold text-primary">{user?.fullName?.charAt(0) || '?'}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user?.fullName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'fullName' },
            { label: 'Age', key: 'age' },
            { label: 'Email', key: 'email' },
            { label: 'Phone', key: 'phone' },
            { label: 'Caretaker Name', key: 'caretakerName' },
            { label: 'Caretaker Phone', key: 'caretakerPhone' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
              {editing ? (
                <Input value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)} />
              ) : (
                <p className="text-foreground font-medium py-2">{(user as any)?.[f.key] || 'N/A'}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {editing ? (
            <div className="flex gap-3">
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
