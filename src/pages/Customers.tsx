import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, Customer } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const reload = () => setCustomers(getCustomers());
  useEffect(reload, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    if (editing) {
      updateCustomer(editing.id, form);
      toast({ title: "Customer updated" });
    } else {
      addCustomer(form);
      toast({ title: "Customer added" });
    }
    setForm({ name: "", phone: "", address: "" });
    setEditing(null);
    setShowForm(false);
    reload();
  };

  const startEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, address: c.address });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    toast({ title: "Customer deleted" });
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        {isAdmin && (
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", phone: "", address: "" }); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Customer
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-heading font-semibold text-foreground">{editing ? "Edit" : "Add"} Customer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editing ? "Update" : "Add"}</Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </form>
      )}

      {filtered.length > 0 ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Address</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{c.name}</td>
                    <td className="p-4 text-muted-foreground">{c.phone}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{c.address || "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(c)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mb-3 text-primary/30" />
          <p>{search ? "No customers found" : "No customers yet. Add your first customer!"}</p>
        </div>
      )}
    </div>
  );
}
