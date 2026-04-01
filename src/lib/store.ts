export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  tripQuantity: number;
  rate: number;
  totalAmount: number;
  status: 'paid' | 'unpaid';
}

const CUSTOMERS_KEY = 'water_delivery_customers';
const SALES_KEY = 'water_delivery_sales';

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function addCustomer(customer: Omit<Customer, 'id'>): Customer {
  const customers = getCustomers();
  const newCustomer = { ...customer, id: crypto.randomUUID() };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
}

export function updateCustomer(id: string, data: Omit<Customer, 'id'>) {
  const customers = getCustomers().map(c => c.id === id ? { ...c, ...data } : c);
  saveCustomers(customers);
  // Also update customer name in sales
  const sales = getSales().map(s => s.customerId === id ? { ...s, customerName: data.name } : s);
  saveSales(sales);
}

export function deleteCustomer(id: string) {
  saveCustomers(getCustomers().filter(c => c.id !== id));
}

export function getSales(): Sale[] {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSales(sales: Sale[]) {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

export function addSale(sale: Omit<Sale, 'id' | 'totalAmount'>): Sale {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: crypto.randomUUID(),
    totalAmount: sale.tripQuantity * sale.rate,
    status: sale.status || 'unpaid',
  };
  sales.push(newSale);
  saveSales(sales);
  return newSale;
}

export function updateSaleStatus(id: string, status: 'paid' | 'unpaid') {
  const sales = getSales().map(s => s.id === id ? { ...s, status } : s);
  saveSales(sales);
}

export function updateSale(id: string, data: Omit<Sale, 'id' | 'totalAmount'>) {
  const sales = getSales().map(s => s.id === id ? { ...s, ...data, totalAmount: data.tripQuantity * data.rate } : s);
  saveSales(sales);
}

export function deleteSale(id: string) {
  saveSales(getSales().filter(s => s.id !== id));
}

// Dashboard helpers
export function getTodaySales(): Sale[] {
  const today = new Date().toISOString().split('T')[0];
  return getSales().filter(s => s.date === today);
}

export function getWeekSales(): Sale[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return getSales().filter(s => new Date(s.date) >= startOfWeek);
}

export function getMonthSales(): Sale[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return getSales().filter(s => new Date(s.date) >= startOfMonth);
}

export function getSalesMetrics(sales: Sale[]) {
  return {
    totalAmount: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    totalTrips: sales.reduce((sum, s) => sum + s.tripQuantity, 0),
    count: sales.length,
  };
}

// Get last 7 days sales data for chart
export function getWeeklyChartData() {
  const sales = getSales();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySales = sales.filter(s => s.date === dateStr);
    const metrics = getSalesMetrics(daySales);
    days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: metrics.totalAmount,
      trips: metrics.totalTrips,
    });
  }
  return days;
}
