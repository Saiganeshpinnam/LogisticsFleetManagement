import { useEffect, useState } from "react";
import axios from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../services/socket";

export default function Reports() {
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    loadReports();

    // Subscribe to real-time updates
    socket.emit("subscribe-admins");
    socket.on("deliveries-updated", loadReports);

    return () => {
      socket.off("deliveries-updated", loadReports);
      socket.emit("unsubscribe-admins");
    };
  }, []);

  const loadReports = async () => {
    try {
      const [summaryRes, avgTimeRes] = await Promise.all([
        axios.get("/reports/summary"),
        axios.get("/reports/avg-delivery-time-per-driver")
      ]);
      setSummary(summaryRes.data);
      setReport(avgTimeRes.data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Reports</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-yellow-600">Pending</h3>
            <p className="text-2xl font-bold">{summary.pending || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-blue-600">Assigned</h3>
            <p className="text-2xl font-bold">{summary.assigned || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-orange-600">On Route</h3>
            <p className="text-2xl font-bold">{summary.on_route || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-green-600">Delivered</h3>
            <p className="text-2xl font-bold">{summary.delivered || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Driver Performance</h3>
          <table className="w-full border">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left">Driver</th>
                <th className="px-4 py-2 text-left">Avg Delivery Time</th>
                <th className="px-4 py-2 text-left">Deliveries Completed</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{r.driverName}</td>
                  <td className="px-4 py-2">{Math.round(r.avg_seconds / 60)} mins</td>
                  <td className="px-4 py-2">{r.deliveries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
