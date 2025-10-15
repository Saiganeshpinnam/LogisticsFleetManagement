import { useEffect, useState } from "react";
import axios from "../services/api";
import Navbar from "../components/Navbar";

export default function Reports() {
  const [report, setReport] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const res = await axios.get("/reports/summary");
    setReport(res.data);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Reports</h2>
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full border">
            <thead className="bg-blue-100">
              <tr>
                <th>Driver</th>
                <th>Avg Delivery Time</th>
                <th>Vehicle Utilization</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i} className="text-center border-t">
                  <td>{r.driver}</td>
                  <td>{r.avgDeliveryTime} mins</td>
                  <td>{r.vehicleUtilization}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
