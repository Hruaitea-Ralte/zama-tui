import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getSales, getSalesMetrics } from "./store";

export function exportSalesPdf(startDate: string, endDate: string) {
  const allSales = getSales();
  const filtered = allSales
    .filter(s => s.date >= startDate && s.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const metrics = getSalesMetrics(filtered);

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Zama Tui - Sales Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Period: ${startDate} to ${endDate}`, 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

  autoTable(doc, {
    startY: 40,
    head: [["Date", "Customer", "Trips", "Rate", "Total", "Status"]],
    body: filtered.map(s => [
      s.date,
      s.customerName,
      String(s.tripQuantity),
      `Rs.${s.rate}`,
      `Rs.${s.totalAmount.toLocaleString()}`,
      (s.status || "unpaid") === "paid" ? "Paid" : "Unpaid",
    ]),
    foot: [["", "Total", String(metrics.totalTrips), "", `Rs.${metrics.totalAmount.toLocaleString()}`, ""]],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: "bold" },
  });

  doc.save(`sales-report-${startDate}-to-${endDate}.pdf`);
}
