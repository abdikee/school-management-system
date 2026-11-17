import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Bell, BookOpen, GraduationCap, Loader2, MessageSquare, Search as SearchIcon, Users } from "lucide-react";
import { searchApi } from "@/services/api";
import type { SearchResult, SearchResultType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const labels: Record<SearchResultType, string> = {
  user: "People",
  class: "Classes",
  subject: "Subjects",
  message: "Messages",
  announcement: "Announcements",
};

const icons: Record<SearchResultType, typeof Users> = {
  user: Users,
  class: GraduationCap,
  subject: BookOpen,
  message: MessageSquare,
  announcement: Bell,
};

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [input, setInput] = useState(query);

  useEffect(() => setInput(query), [query]);

  const resultsQuery = useQuery({
    queryKey: ["global-search", query],
    queryFn: () => searchApi.search(query),
    enabled: query.length >= 2,
  });

  const groups = useMemo(() => {
    const grouped = new Map<SearchResultType, SearchResult[]>();
    for (const result of resultsQuery.data?.results ?? []) {
      const current = grouped.get(result.type) ?? [];
      grouped.set(result.type, [...current, result]);
    }
    return [...grouped.entries()];
  }, [resultsQuery.data]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = input.trim();
    if (normalized.length >= 2) setSearchParams({ q: normalized });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Search</h1>
        <p className="mt-2 text-slate-500">Find people, classes, subjects, messages, and announcements available to you.</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                autoFocus
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search the school workspace..."
                className="pl-10"
                aria-label="Search the school workspace"
              />
            </div>
            <Button type="submit" disabled={input.trim().length < 2}>Search</Button>
          </form>
        </CardContent>
      </Card>

      {query.length < 2 && (
        <Card>
          <CardContent className="py-16 text-center">
            <SearchIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900">Start with at least two characters</p>
            <p className="mt-1 text-sm text-slate-500">Search results are limited to information your role can access.</p>
          </CardContent>
        </Card>
      )}

      {query.length >= 2 && resultsQuery.isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Searching workspace...
        </div>
      )}

      {query.length >= 2 && resultsQuery.isError && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="font-medium text-slate-900">Search is unavailable right now.</p>
            <Button className="mt-4" onClick={() => resultsQuery.refetch()}>Try again</Button>
          </CardContent>
        </Card>
      )}

      {query.length >= 2 && !resultsQuery.isLoading && !resultsQuery.isError && groups.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <SearchIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900">No results for “{query}”</p>
            <p className="mt-1 text-sm text-slate-500">Try a name, class, subject, or announcement keyword.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {groups.map(([type, results]) => {
          const Icon = icons[type];
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Icon className="h-5 w-5 text-emerald-700" /> {labels[type]}</CardTitle>
                <CardDescription>{results.length} result{results.length === 1 ? "" : "s"}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {results.map((result) => (
                  <Link key={`${result.type}-${result.id}`} to={result.href} className="group rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{result.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{result.description}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-emerald-700" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
