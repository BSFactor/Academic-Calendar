import React, { useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "@/components/LeftSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function BulkUploadStudents() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [summary, setSummary] = useState<{ total?: number; created?: number; updated?: number; failed?: number; errors?: Array<any> } | null>(null);
  const [stage, setStage] = useState<'idle'|'uploading'|'processing'|'done'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const navigate = useNavigate();

  const onDrop = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    // Quick CSV preview when possible
    if (f.name.toLowerCase().endsWith('.csv') || f.type.includes('text')) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || '');
          const lines = text.split(/\r?\n/).filter(Boolean).slice(0, 10);
          const rows = lines.map((l) => l.split(/,|;|\t/).map((c) => c.trim()));
          setPreviewRows(rows);
        } catch (e) { setPreviewRows([]); }
      };
      reader.readAsText(f);
    } else {
      setPreviewRows([]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) onDrop(f);
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    if (ev.dataTransfer.files && ev.dataTransfer.files[0]) onDrop(ev.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setSummary(null);
    setStage('uploading');
    setProgress(8);
    const prog = setInterval(() => setProgress((p) => Math.min(95, p + Math.floor(Math.random() * 8) + 2)), 600);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/users/bulk-upload-students/", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      setResult({ status: res.status, body: data });
      clearInterval(prog as unknown as number);
      setStage('processing');
      setProgress(96);

      const normalized = {
        total: data.total ?? data.count ?? (Array.isArray(data.errors) ? (data.errors.length + (data.created||0) + (data.updated||0)) : undefined),
        created: data.created ?? data.created_count ?? data.success ?? 0,
        updated: data.updated ?? data.updated_count ?? 0,
        failed: data.failed ?? data.failed_count ?? (Array.isArray(data.errors) ? data.errors.length : 0),
        errors: data.errors ?? data.failures ?? []
      };

      setTimeout(() => {
        setSummary(normalized);
        setStage('done');
        setProgress(100);
        if ((normalized.created || 0) > 0) {
          toast.success(`✔ ${normalized.created} students created successfully`);
        }
        if ((normalized.failed || 0) > 0) {
          toast.error(`${normalized.failed} rows failed to import`);
        }
      }, 600);
    } catch (err) {
      clearInterval(prog as unknown as number);
      setResult({ error: String(err) });
      setStage('done');
      setProgress(100);
      toast.error(`Upload failed: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => { setFile(null); setPreviewRows([]); setResult(null); };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <LeftSidebar />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-white via-sky-50 to-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Bulk Upload Students</h1>
                <p className="text-sm text-gray-500 mt-1">Upload student lists in CSV or Excel format. Use the template for correct columns.</p>
              </div>
              <div className="flex items-center gap-2">
                <a href="/static/templates/students_upload_template.csv" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black">
                  <Download className="w-4 h-4" /> Download template
                </a>
              </div>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center hover:border-gray-300 transition"
                >
                  <UploadCloud className="mx-auto mb-4 w-12 h-12 text-sky-500" />
                  <div className="text-lg font-medium">Drag & drop your file here</div>
                  <div className="text-sm text-gray-500 mt-2">CSV, XLSX, or XLS — max 10MB</div>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="sr-only" />
                      <Button type="button" onClick={() => inputRef.current?.click()}>Select a file</Button>
                    </label>
                    {file && (
                      <div className="text-sm text-gray-600">{file.name} · {(file.size/1024).toFixed(1)} KB</div>
                    )}
                    {file && (
                      <button type="button" onClick={clearFile} className="text-sm text-red-600 hover:underline">Remove</button>
                    )}
                  </div>
                </div>

                {previewRows.length > 0 && (
                  <div className="overflow-auto rounded-md border border-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {previewRows[0].map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.slice(1).map((r, ri) => (
                          <tr key={ri} className="even:bg-white odd:bg-gray-50">
                            {r.map((c, ci) => <td key={ci} className="px-3 py-2">{c}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={!file || loading}>{loading ? 'Uploading...' : 'Upload students'}</Button>
                  <Button variant="ghost" onClick={() => navigate('/profile')}>Back</Button>
                  {result && <div className="ml-auto text-sm text-gray-600">Status: {String(result.status || '')}</div>}
                </div>

                {stage !== 'idle' && (
                  <div className="mt-4 space-y-4">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 bg-sky-500 transition-all`} style={{ width: `${progress}%` }} />
                    </div>

                    {summary && (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-1 rounded-lg border p-3 bg-white">
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-500"/> Total rows</div>
                          <div className="mt-2 text-lg font-medium">{summary.total ?? '-'}</div>
                        </div>
                        <div className="col-span-1 rounded-lg border p-3 bg-white">
                          <div className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle className="w-4 h-4 text-emerald-500"/> Created</div>
                          <div className="mt-2 text-lg font-medium text-emerald-600">{summary.created ?? 0}</div>
                        </div>
                        <div className="col-span-1 rounded-lg border p-3 bg-white">
                          <div className="flex items-center gap-2 text-sm text-gray-600">Updated</div>
                          <div className="mt-2 text-lg font-medium">{summary.updated ?? 0}</div>
                        </div>
                        <div className="col-span-1 rounded-lg border p-3 bg-white">
                          <div className="flex items-center gap-2 text-sm text-red-600"><XCircle className="w-4 h-4 text-red-500"/> Failed</div>
                          <div className="mt-2 text-lg font-medium text-red-600">{summary.failed ?? 0}</div>
                        </div>
                      </div>
                    )}

                    {summary && summary.failed && Array.isArray(summary.errors) && summary.errors.length > 0 && (
                      <div className="rounded-md bg-white border p-3">
                        <div className="text-sm font-medium mb-2">Import errors</div>
                        <div className="overflow-auto max-h-64">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Row</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Student</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Reason</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.errors.map((err: any, i: number) => (
                                <tr key={i} className="even:bg-white odd:bg-gray-50">
                                  <td className="px-3 py-2 align-top">{err.row ?? err.row_number ?? err.index ?? i + 1}</td>
                                  <td className="px-3 py-2 align-top">{err.name ?? err.student_name ?? (err.record && (err.record.name || err.record.full_name)) ?? '-'}</td>
                                  <td className="px-3 py-2 align-top text-sm text-red-600">{err.reason ?? err.error ?? JSON.stringify(err)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {result && !summary && (
                      <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100">
                        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result.body || result.error || result, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
