import type { ReactNode } from "react";

export function AdminDataTable({
  headers,
  children,
  emptyMessage,
}: {
  headers: string[];
  children: ReactNode;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
      {!children && emptyMessage && (
        <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  );
}

export function AdminPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
