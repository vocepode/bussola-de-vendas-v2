"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Block =
  | { type: "heading"; level?: number; html?: string; text?: string }
  | { type: "paragraph"; html?: string; text?: string }
  | { type: "list"; style?: "bulleted" | "numbered"; items?: Array<{ html?: string; text?: string }> }
  | { type: "callout"; html?: string; text?: string }
  | { type: "divider" }
  | { type: "image"; src?: string; alt?: string; caption?: string | null }
  | { type: "quote"; html?: string; text?: string }
  | { type: "table"; table?: Array<Array<{ html?: string; text?: string }>> }
  | { type: "code"; language?: string | null; code?: string }
  | { type: "embed"; url?: string };

function Html({ html }: { html?: string }) {
  if (!html) return null;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function NotionBlocksRenderer({ blocks }: { blocks: unknown }) {
  const safeBlocks = Array.isArray(blocks) ? (blocks as Block[]) : [];

  if (!safeBlocks.length) return null;

  return (
    <div className="space-y-5">
      {safeBlocks.map((block, idx) => {
        if (!block || typeof block !== "object") return null;
        const type = (block as any).type as Block["type"];

        if (type === "heading") {
          const level = Number((block as any).level ?? 2);
          const Tag = level === 1 ? "h1" : level === 3 ? "h3" : "h2";
          const cls =
            level === 1
              ? "text-3xl font-bold tracking-tight"
              : level === 3
                ? "text-xl font-semibold"
                : "text-2xl font-semibold";
          return (
            <Tag key={idx} className={cls}>
              <Html html={(block as any).html} />
            </Tag>
          );
        }

        if (type === "paragraph") {
          const text = ((block as any).text as string | undefined) ?? "";
          if (!text.trim() && !(block as any).html) return null;
          return (
            <p key={idx} className="leading-7 text-foreground">
              <Html html={(block as any).html} />
            </p>
          );
        }

        if (type === "list") {
          const style = ((block as any).style as "bulleted" | "numbered" | undefined) ?? "bulleted";
          const items = (((block as any).items as any[]) ?? []).filter(Boolean);
          if (!items.length) return null;
          const ListTag = style === "numbered" ? "ol" : "ul";
          return (
            <ListTag
              key={idx}
              className={style === "numbered" ? "list-decimal pl-6 space-y-2" : "list-disc pl-6 space-y-2"}
            >
              {items.map((it, i) => (
                <li key={i} className="leading-7">
                  <Html html={it.html} />
                </li>
              ))}
            </ListTag>
          );
        }

        if (type === "divider") {
          return <hr key={idx} className="my-6 border-border" />;
        }

        if (type === "callout") {
          const text = ((block as any).text as string | undefined) ?? "";
          if (!text.trim() && !(block as any).html) return null;
          return (
            <div key={idx} className="rounded-lg border bg-muted/40 px-4 py-3">
              <div className="text-sm leading-6">
                <Html html={(block as any).html} />
              </div>
            </div>
          );
        }

        if (type === "quote") {
          const text = ((block as any).text as string | undefined) ?? "";
          if (!text.trim() && !(block as any).html) return null;
          return (
            <blockquote key={idx} className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
              <Html html={(block as any).html} />
            </blockquote>
          );
        }

        if (type === "image") {
          const src = (block as any).src as string | undefined;
          if (!src) return null;
          const alt = ((block as any).alt as string | undefined) ?? "";
          const caption = ((block as any).caption as string | null | undefined) ?? null;
          return (
            <figure key={idx} className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="w-full rounded-lg border bg-white" />
              {caption ? <figcaption className="text-xs text-muted-foreground">{caption}</figcaption> : null}
            </figure>
          );
        }

        if (type === "code") {
          const code = ((block as any).code as string | undefined) ?? "";
          if (!code.trim()) return null;
          const language = ((block as any).language as string | null | undefined) ?? null;
          return (
            <div key={idx} className="rounded-lg border bg-muted/30 overflow-hidden">
              {language ? (
                <div className="px-3 py-2 border-b text-xs text-muted-foreground">{language}</div>
              ) : null}
              <pre className="p-3 overflow-x-auto text-sm leading-6">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        if (type === "table") {
          const table = ((block as any).table as any[][] | undefined) ?? [];
          if (!Array.isArray(table) || !table.length) return null;
          const [firstRow, ...restRows] = table;

          const hasHeader = (firstRow ?? []).some((c: any) => typeof c?.html === "string" || typeof c?.text === "string");

          return (
            <div key={idx} className="rounded-lg border bg-white">
              <Table className="text-sm">
                {hasHeader ? (
                  <TableHeader>
                    <TableRow>
                      {(firstRow ?? []).map((cell: any, cIdx: number) => (
                        <TableHead key={cIdx}>
                          <span className="font-medium">
                            <Html html={cell?.html} />
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                ) : null}
                <TableBody>
                  {(hasHeader ? restRows : table).map((row: any[], rIdx: number) => (
                    <TableRow key={rIdx}>
                      {(row ?? []).map((cell: any, cIdx: number) => (
                        <TableCell key={cIdx}>
                          <Html html={cell?.html} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }

        if (type === "embed") {
          const url = (block as any).url as string | undefined;
          if (!url) return null;
          return (
            <div key={idx} className="rounded-lg border p-4">
              <a className="text-primary underline break-all" href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

