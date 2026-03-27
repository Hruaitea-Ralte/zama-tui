import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast({ title: "Logged in as Admin" });
      navigate("/");
    } else {
      toast({ title: "Invalid credentials", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Admin Login</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
        </div>
        <Button type="submit" className="w-full">Login</Button>
      </form>
    </div>
  );
}
