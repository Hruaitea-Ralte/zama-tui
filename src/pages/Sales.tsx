import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Pencil, ShoppingCart, Search, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCustomers, getSales, addSale, deleteSale, updateSale, Sale, Customer } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { exportSalesPdf } from "@/lib/exportSalesPdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const FIXED_RATE = 300;
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], customerId: "", tripQuantity: "", rate: "300", status: "unpaid" as 'paid' | 'unpaid' });
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState({ start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const reload = () => {
    setSales(getSales());
    setCustomers(getCustomers());
  };
  useEffect(reload, []);

  const filtered = sales
    .filter(s => s.customerName.toLowerCase().includes(search.toLowerCase()) || s.date.includes(search))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const totalCalc = useMemo(() => {
    const qty = parseFloat(form.tripQuantity) || 0;
    const rate = parseFloat(form.rate) || 0;
    return qty * rate;
  }, [form.tripQuantity, form.rate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === form.customerId);
    if (!customer || !form.tripQuantity || !form.rate) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (editing) {
      updateSale(editing.id, {
        date: form.date,
        customerId: customer.id,
        customerName: customer.name,
        tripQuantity: parseFloat(form.tripQuantity),
        rate: parseFloat(form.rate),
        status: form.status,
      });
      toast({ title: "Sale updated" });
    } else {
      addSale({
        date: form.date,
        customerId: customer.id,
        customerName: customer.name,
        tripQuantity: parseFloat(form.tripQuantity),
        rate: parseFloat(form.rate),
        status: form.status,
      });
      toast({ title: "Sale recorded" });
    }
    setForm({ date: new Date().toISOString().split('T')[0], customerId: "", tripQuantity: "", rate: "300", status: "unpaid" });
    setEditing(null);
    setShowForm(false);
    reload();
  };

  const startEdit = (s: Sale) => {
    setEditing(s);
    setForm({
      date: s.date,
      customerId: s.customerId,
      tripQuantity: String(s.tripQuantity),
      rate: String(s.rate),
      status: s.status || 'unpaid',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ date: new Date().toISOString().split('T')[0], customerId: "", tripQuantity: "", rate: "300", status: "unpaid" });
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteSale(deleteId);
      toast({ title: "Sale deleted" });
      setDeleteId(null);
      reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {isAdmin && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by customer or date..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        )}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" title="Export PDF">
                  <Download className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs">
                <DialogHeader>
                  <DialogTitle>Export Sales PDF</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={exportRange.start} onChange={e => setExportRange(p => ({ ...p, start: e.target.value }))} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={exportRange.end} onChange={e => setExportRange(p => ({ ...p, end: e.target.value }))} />
                  </div>
                  <Button className="w-full" onClick={() => { exportSalesPdf(exportRange.start, exportRange.end); setExportOpen(false); toast({ title: "PDF exported" }); }}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {isAdmin && !showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Sale
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-heading font-semibold text-foreground">{editing ? "Edit Sale" : "New Sale"}</h3>
          <div className="space-y-4">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date ? (() => { const d = new Date(form.date + 'T00:00:00'); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.date ? new Date(form.date + 'T00:00:00') : undefined} onSelect={(d) => d && setForm(f => ({ ...f, date: format(d, 'yyyy-MM-dd') }))} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Customer *</Label>
              <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && <p className="text-xs text-muted-foreground mt-1">Add customers first</p>}
            </div>
            <div>
              <Label>Trip Quantity *</Label>
              <div className="flex items-center gap-3 mt-1">
                <Button type="button" size="icon" variant="outline" className="h-9 w-9"
                  disabled={parseFloat(form.tripQuantity || "0") <= 0.5}
                  onClick={() => setForm(f => ({ ...f, tripQuantity: String(Math.max(0.5, (parseFloat(f.tripQuantity) || 1) - 0.5)) }))}>
                  <span className="text-lg font-bold">−</span>
                </Button>
                <span className="min-w-[3rem] text-center font-semibold text-foreground text-lg">{form.tripQuantity || "0"}</span>
                <Button type="button" size="icon" variant="outline" className="h-9 w-9"
                  disabled={parseFloat(form.tripQuantity || "0") >= 10}
                  onClick={() => setForm(f => ({ ...f, tripQuantity: String(Math.min(10, (parseFloat(f.tripQuantity) || 0) + 0.5)) }))}>
                  <span className="text-lg font-bold">+</span>
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total: <span className="font-semibold text-foreground">₹{totalCalc.toLocaleString()}</span></p>
            <div className="flex items-center gap-2">
              <Label htmlFor="status-toggle" className="text-sm">Paid</Label>
              <Switch id="status-toggle" checked={form.status === 'paid'} onCheckedChange={checked => setForm({ ...form, status: checked ? 'paid' : 'unpaid' })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">{editing ? "Update" : "Save"}</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        </form>
      )}

      {isAdmin && (filtered.length > 0 ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs table-fixed">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-1.5 py-2 font-medium text-muted-foreground w-[58px]">Date</th>
                  <th className="text-left px-1.5 py-2 font-medium text-muted-foreground">Customer</th>
                  <th className="text-right px-1 py-2 font-medium text-muted-foreground w-[32px]">Trips</th>
                  <th className="text-right px-1 py-2 font-medium text-muted-foreground w-[50px]">Amt</th>
                  <th className="text-center px-1 py-2 font-medium text-muted-foreground w-[40px]">Status</th>
                  <th className="text-right px-0.5 py-2 font-medium text-muted-foreground w-[52px]"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const d = new Date(s.date);
                  return (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-1.5 py-1.5 text-foreground whitespace-nowrap">{`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`}</td>
                      <td className="px-1.5 py-1.5 font-medium text-foreground truncate">{s.customerName}</td>
                      <td className="px-1 py-1.5 text-right text-muted-foreground">{s.tripQuantity}</td>
                      <td className="px-1 py-1.5 text-right font-semibold text-foreground">₹{s.totalAmount.toLocaleString()}</td>
                      <td className="px-1 py-1.5 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${(s.status || 'unpaid') === 'paid' ? 'bg-green-500' : 'bg-red-500'}`} title={(s.status || 'unpaid') === 'paid' ? 'Paid' : 'Unpaid'} />
                      </td>
                      <td className="px-0.5 py-1.5 text-right whitespace-nowrap">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(s)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="w-3 h-3" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mb-3 text-primary/30" />
          <p>{search ? "No sales found" : "No sales yet. Log your first delivery!"}</p>
        </div>
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sale</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this sale? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
