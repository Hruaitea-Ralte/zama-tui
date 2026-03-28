import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, ShoppingCart, Search, FileDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCustomers, getSales, addSale, deleteSale, updateSaleStatus, Sale, Customer } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const FIXED_RATE = 300;
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], customerId: "", tripQuantity: "", rate: "300", status: "unpaid" as 'paid' | 'unpaid' });
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const reload = () => {
    setSales(getSales());
    setCustomers(getCustomers());
  };
  useEffect(reload, []);

  const filtered = sales
    .filter(s => {
      const matchesSearch = s.customerName.toLowerCase().includes(search.toLowerCase()) || s.date.includes(search);
      const afterStart = !startDate || s.date >= startDate;
      const beforeEnd = !endDate || s.date <= endDate;
      return matchesSearch && afterStart && beforeEnd;
    })
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
    addSale({
      date: form.date,
      customerId: customer.id,
      customerName: customer.name,
      tripQuantity: parseFloat(form.tripQuantity),
      rate: parseFloat(form.rate),
      status: form.status,
    });
    toast({ title: "Sale recorded" });
    setForm({ date: new Date().toISOString().split('T')[0], customerId: "", tripQuantity: "", rate: "300", status: "unpaid" });
    setShowForm(false);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteSale(id);
    toast({ title: "Sale deleted" });
    reload();
  };

  const handleExportPDF = () => {
    if (filtered.length === 0) {
      toast({ title: "No sales to export", variant: "destructive" });
      return;
    }
    const doc = new jsPDF();
    const title = "Sales Report";
    const dateRange = startDate || endDate
      ? `${startDate || "..."} to ${endDate || "..."}`
      : "All dates";

    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date Range: ${dateRange}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [["Date", "Customer", "Trips", "Amount (Rs.)", "Status"]],
      body: filtered.map(s => [
        new Date(s.date).toLocaleDateString(),
        s.customerName,
        String(s.tripQuantity),
        `Rs.${s.totalAmount.toLocaleString()}`,
        (s.status || "unpaid") === "paid" ? "Paid" : "Unpaid",
      ]),
      foot: [[
        "Total", "", 
        String(filtered.reduce((sum, s) => sum + s.tripQuantity, 0)),
        `Rs.${filtered.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}`,
        "",
      ]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    doc.save(`sales-report-${new Date().toISOString().split("T")[0]}.pdf`);
    toast({ title: "PDF exported successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by customer or date..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" /> Add Sale
            </Button>
          )}
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div>
          <Label className="text-xs text-muted-foreground">Start Date</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">End Date</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
        </div>
        {(startDate || endDate) && (
          <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }}>
            Clear
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-heading font-semibold text-foreground">New Sale</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
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
              <Select value={form.tripQuantity} onValueChange={v => setForm({ ...form, tripQuantity: v })}>
                <SelectTrigger><SelectValue placeholder="Select trips" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} Trip{n > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rate (₹)</Label>
              <Input type="number" value={FIXED_RATE} disabled className="opacity-70" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Total: <span className="font-semibold text-foreground">₹{totalCalc.toLocaleString()}</span></p>
              <div className="flex items-center gap-2">
                <Label htmlFor="status-toggle" className="text-sm">Paid</Label>
                <Switch id="status-toggle" checked={form.status === 'paid'} onCheckedChange={checked => setForm({ ...form, status: checked ? 'paid' : 'unpaid' })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </form>
      )}

      {filtered.length > 0 ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Trips</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Status</th>
                  {isAdmin && <th className="text-right p-4 font-medium text-muted-foreground">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-4 text-foreground">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-foreground">{s.customerName}</td>
                    <td className="p-4 text-right text-muted-foreground">{s.tripQuantity}</td>
                    <td className="p-4 text-right text-muted-foreground">₹{s.rate}</td>
                    <td className="p-4 text-right font-semibold text-foreground">₹{s.totalAmount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${(s.status || 'unpaid') === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {(s.status || 'unpaid') === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mb-3 text-primary/30" />
          <p>{search ? "No sales found" : "No sales yet. Log your first delivery!"}</p>
        </div>
      )}
    </div>
  );
}
