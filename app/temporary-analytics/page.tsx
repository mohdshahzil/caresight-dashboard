"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function TemporaryAnalyticsPage() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function handleParse() {
    setError(null);
    try {
      const obj = JSON.parse(input);
      setParsed(obj);
    } catch (e: any) {
      setParsed(null);
      setError("Invalid JSON: " + e.message);
    }
  }

  function renderValue(key: string, value: any, path: string) {
    if (value === null || typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
      return <span className="text-gray-900">{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      return (
        <div>
          <span className="text-blue-700">Array[{value.length}]</span>
          {value.length > 0 && (
            <Button size="sm" variant="ghost" className="ml-2 px-2 py-0 text-xs" onClick={() => setExpanded(e => ({ ...e, [path]: !e[path] }))}>
              {expanded[path] ? "Hide" : "Show"}
            </Button>
          )}
          {expanded[path] && (
            <div className="ml-4 mt-1 border-l pl-2">
              {value.map((v, i) => (
                <div key={i} className="mb-1">
                  <span className="text-gray-500">[{i}]</span>: {renderValue(`${key}[${i}]`, v, `${path}[${i}]`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (typeof value === "object") {
      return (
        <div>
          <span className="text-green-700">Object</span>
          <Button size="sm" variant="ghost" className="ml-2 px-2 py-0 text-xs" onClick={() => setExpanded(e => ({ ...e, [path]: !e[path] }))}>
            {expanded[path] ? "Hide" : "Show"}
          </Button>
          {expanded[path] && (
            <div className="ml-4 mt-1 border-l pl-2">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(value).map(([k, v]) => (
                    <tr key={k}>
                      <td className="font-medium pr-2 align-top text-gray-700">{k}</td>
                      <td>{renderValue(k, v, `${path}.${k}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
    return <span className="text-gray-500">(unknown)</span>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Temporary Data Analytics</CardTitle>
          <CardDescription>
            Paste a raw API response (JSON) below. The page will parse it and show a table of all available data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={10}
            placeholder="Paste API response JSON here..."
            className="mb-4 font-mono"
          />
          <Button onClick={handleParse} className="mb-2">Parse & Analyze</Button>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {parsed && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border-b">Field</th>
                    <th className="text-left p-2 border-b">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(parsed).map(([key, value]) => (
                    <tr key={key} className="align-top border-b">
                      <td className="font-semibold p-2 text-gray-700 w-1/4">{key}</td>
                      <td className="p-2">{renderValue(key, value, key)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
