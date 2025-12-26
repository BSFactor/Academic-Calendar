import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Check, RefreshCw, XCircle } from "lucide-react";

const ImportStudents: React.FC = () => {
  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || "";
  const [file, setFile] = useState<File | null>(null);
  const [defaultYear, setDefaultYear] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please choose an Excel file to upload.");
    setLoading(true);
    setResult(null);
    setProgress(5);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // backend currently defaults year to 1; include defaultYear as query param
      const token = localStorage.getItem("accessToken");
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/users/import-students/?default_year=${defaultYear}`, {
        method: "POST",
        body: fd,
        headers,
      });
      const data = await res.json().catch(() => ({}));
      // simulate processing progress for a nicer UX
      setProgress(35);
      await new Promise((r) => setTimeout(r, 250));
      setProgress(70);
      if (!res.ok) {
        const err = data.detail || res.statusText;
        toast({ title: "Import failed", description: String(err) });
        setResult({ error: data });
        setProgress(100);
      } else {
        setResult(data);
        setProgress(100);
        const createdCount = Array.isArray(data.created) ? data.created.length : 0;
        toast({ title: `✔ ${createdCount} students created successfully` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Network error", description: String(err) });
      setResult({ error: String(err) });
      setProgress(100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <main className="w-full self-start flex flex-col h-full min-h-0">
        <div className="flex gap-6 flex-1 min-h-0 p-6">
          <div className="w-2/3 bg-white p-6 rounded-b-2xl shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Import Students</h2>
              <div className="text-sm text-gray-500">Upload .xlsx with columns: name, dob, email, student_id</div>
            </div>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Upload File</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer?.files?.[0];
                      if (f) setFile(f);
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`border-2 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'} rounded-md p-6 text-center cursor-pointer`}
                    onClick={() => { const el = document.getElementById('importFileInput') as HTMLInputElement | null; el?.click(); }}
                  >
                    <input id="importFileInput" type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                    {!file ? (
                      <div>
                        <div className="text-lg font-medium">Drag & drop an Excel file here, or click to browse</div>
                        <div className="text-sm text-muted-foreground mt-2">Accepted: .xlsx, .xls</div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-sm">{file.name}</div>
                        <button type="button" onClick={() => setFile(null)} className="text-sm text-red-600">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="block text-sm text-gray-700">Default year</label>
                    <input type="number" min={1} value={defaultYear} onChange={(e) => setDefaultYear(Number(e.target.value))} className="w-24 rounded-md border border-gray-200 px-3 py-2" />
                    <div className="flex-1" />
                    <Button type="submit" variant="default" disabled={loading}>{loading ? "Processing..." : "Upload & Import"}</Button>
                    <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                  </div>
                </form>

                <div className="mt-4">
                  <Progress value={progress} />
                  <div className="mt-2 text-xs text-muted-foreground">Status: {progress < 10 ? 'Waiting' : progress < 50 ? 'Uploading' : progress < 100 ? 'Processing' : 'Done'}</div>
                </div>
              </CardContent>
            </Card>

            {result && (
              <div className="mt-6 space-y-4">
                {/* Summary card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 rounded-md text-center">
                        <div className="text-sm text-muted-foreground">Total rows</div>
                        <div className="mt-2 text-2xl font-bold">{(result.created?.length || 0) + (result.errors?.length || 0)}</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-md text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-green-700"><Check className="w-4 h-4"/> Created</div>
                        <div className="mt-2 text-2xl font-bold text-green-800">{result.created?.length || 0}</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-md text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-yellow-700"><RefreshCw className="w-4 h-4"/> Already existed</div>
                        <div className="mt-2 text-2xl font-bold text-yellow-800">{result.skipped?.length || 0}</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-md text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-red-700"><XCircle className="w-4 h-4"/> Failed</div>
                        <div className="mt-2 text-2xl font-bold text-red-800">{result.errors?.length || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Error table */}
                {result.errors && result.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                              <TableHead>Row</TableHead>
                              <TableHead>Student name</TableHead>
                              <TableHead>Student ID</TableHead>
                              <TableHead>DOB</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.errors.map((e: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>{e.row}</TableCell>
                              <TableCell>{e.name || e.student_name || "-"}</TableCell>
                              <TableCell>{e.student_id || "-"}</TableCell>
                              <TableCell>{e.dob || "-"}</TableCell>
                              <TableCell>{e.error || e.reason || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
                {/* Skipped details (already existed) */}
                {result.skipped && result.skipped.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Already existed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>DOB</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.skipped.map((s: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>{s.row}</TableCell>
                              <TableCell>{s.name || "-"}</TableCell>
                              <TableCell>{s.student_id || "-"}</TableCell>
                              <TableCell>{s.dob || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* instructions side panel removed as requested; content centered above */}
        </div>
      </main>
    </div>
  );
};

export default ImportStudents;
