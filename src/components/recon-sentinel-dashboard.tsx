"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getNewSuggestionsAction, getSummaryAction, startInvestigationAction } from "@/lib/actions";
import type { Finding, FindingType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./icons";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

const investigationFormSchema = z.object({
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters.")
    .max(50, "Subject must be 50 characters or less."),
});

type LoadingState = "idle" | "loading-queries" | "searching" | "loading-suggestions" | "summarizing";

// Mock data generation
const MOCK_FINDINGS = [
  { type: "person", text: "Known associate: Jane Smith", icon: Users },
  { type: "social", text: "LinkedIn profile found", icon: User },
  { type: "place", text: "Last seen location: Downtown Cafe", icon: MapPin },
  { type: "organization", text: "Works at: Acme Corporation", icon: Building2 },
  { type: "document", text: "Public record of property ownership found", icon: FileText },
  { type: "other", text: "Interest in vintage cars noted from forum posts", icon: Sparkles },
];

const getFindingIcon = (type: FindingType): LucideIcon => {
  switch (type) {
    case "person": return Users;
    case "place": return MapPin;
    case "organization": return Building2;
    case "document": return FileText;
    case "social": return User;
    default: return Globe;
  }
};

export default function ReconSentinelDashboard() {
  const [isPending, startTransition] = useTransition();
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [subject, setSubject] = useState<string | null>(null);
  const [queries, setQueries] = useState<string[]>([]);
  const [completedQueries, setCompletedQueries] = useState<Set<string>>(new Set());
  const [findings, setFindings] = useState<Finding[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof investigationFormSchema>>({
    resolver: zodResolver(investigationFormSchema),
    defaultValues: { subject: "" },
  });

  const handleStartInvestigation = (values: z.infer<typeof investigationFormSchema>) => {
    setLoadingState("loading-queries");
    startTransition(async () => {
      const result = await startInvestigationAction(values);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        setLoadingState("idle");
      } else {
        setSubject(values.subject);
        setQueries(result.queries);
        setFindings([]);
        setSummary(null);
        setCompletedQueries(new Set());
        setLoadingState("idle");
        toast({
          title: "Investigation Started",
          description: `Generated ${result.queries.length} initial queries for "${values.subject}".`,
        });
      }
    });
  };

  const handleRunSearch = (query: string) => {
    if (completedQueries.has(query)) return;
    setLoadingState("searching");
    startTransition(() => {
        setTimeout(() => {
            const mockFindingTemplate = MOCK_FINDINGS[Math.floor(Math.random() * MOCK_FINDINGS.length)];
            const newFinding: Finding = {
                id: `finding-${Date.now()}-${Math.random()}`,
                type: mockFindingTemplate.type as FindingType,
                title: mockFindingTemplate.text,
                content: `Based on the query: "${query}"`,
                sourceQuery: query,
                icon: getFindingIcon(mockFindingTemplate.type as FindingType),
            };
            setFindings(prev => [newFinding, ...prev]);
            setCompletedQueries(prev => new Set(prev).add(query));
            setLoadingState("idle");
        }, 1500 + Math.random() * 1000);
    });
  };

  const handleGetSuggestions = () => {
    setLoadingState("loading-suggestions");
    const existingData = findings.map(f => `${f.title}: ${f.content}`).join('\n');
    startTransition(async () => {
        const result = await getNewSuggestionsAction(existingData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else if (result.suggestedSearchTerms) {
            const newQueries = result.suggestedSearchTerms.filter(q => !queries.includes(q));
            setQueries(prev => [...prev, ...newQueries]);
            toast({ title: "New Queries Added", description: `Discovered ${newQueries.length} new avenues of investigation.` });
        }
        setLoadingState("idle");
    });
  };

  const handleGetSummary = () => {
    setLoadingState("summarizing");
    const aggregatedData = findings.map(f => `${f.title}: ${f.content}`).join('\n');
    startTransition(async () => {
        const result = await getSummaryAction(aggregatedData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            setSummary(result.summary);
            toast({ title: "Profile Summarized", description: "AI has generated a profile summary." });
        }
        setLoadingState("idle");
    });
  };
  
  const isInvestigationActive = subject !== null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
           <Avatar>
            <AvatarImage src="https://picsum.photos/seed/1/100/100" data-ai-hint="person face" />
            <AvatarFallback>OS</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 container py-6 md:py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-8">
            <Card>
              <CardHeader>
                <CardTitle>New Investigation</CardTitle>
                <CardDescription>Enter a subject to begin.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleStartInvestigation)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending && loadingState === 'loading-queries'}>
                      {isPending && loadingState === 'loading-queries' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Start Investigation
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {isInvestigationActive && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Queries</CardTitle>
                  <CardDescription>Run searches to gather data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {queries.map((query, index) => (
                        <div key={index} className="flex items-center gap-2">
                           <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => handleRunSearch(query)}
                            disabled={(isPending && loadingState === 'searching') || completedQueries.has(query)}
                          >
                             {isPending && loadingState === 'searching' && !completedQueries.has(query) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            <span className="flex-1 truncate">{query}</span>
                            {completedQueries.has(query) && <div className="w-2 h-2 rounded-full bg-accent" />}
                           </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
            {!isInvestigationActive ? (
                <Card className="flex flex-col items-center justify-center text-center py-20 lg:py-32">
                    <CardHeader>
                        <div className="mx-auto bg-secondary p-4 rounded-full">
                            <ShieldCheck className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="mt-4 text-2xl">Welcome to Recon Sentinel</CardTitle>
                        <CardDescription className="max-w-md mx-auto">
                        Your automated OSINT analysis tool. Start an investigation to begin gathering intelligence from open sources.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <>
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Investigation for: <span className="text-primary">{subject}</span></CardTitle>
                            <CardDescription>Aggregated findings and insights.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                         <Button variant="outline" onClick={handleGetSuggestions} disabled={isPending || findings.length < 2}>
                                {isPending && loadingState === 'loading-suggestions' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Get Suggestions
                            </Button>
                            <Button onClick={handleGetSummary} disabled={isPending || findings.length < 3}>
                                {isPending && loadingState === 'summarizing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Summarize Profile
                            </Button>
                        </div>
                    </CardHeader>
                    {summary && (
                        <CardContent>
                            <Separator className="my-4" />
                            <h3 className="font-semibold text-lg mb-2">AI Profile Summary</h3>
                            <p className="text-muted-foreground text-sm">{summary}</p>
                        </CardContent>
                    )}
                </Card>


                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <h2 className="text-xl font-semibold tracking-tight md:col-span-2 lg:col-span-3">Findings ({findings.length})</h2>

                    {findings.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-muted-foreground">No findings yet. Run some queries to get started.</p>
                        </div>
                    )}
                    
                    {findings.map((finding) => (
                        <Card key={finding.id} className="flex flex-col hover:border-primary/50 transition-colors">
                            <CardHeader className="flex-row items-start gap-4 space-y-0">
                                <div className="bg-secondary p-3 rounded-full">
                                    <finding.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{finding.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{finding.content}</p>
                                <Badge variant="secondary" className="mt-4">{finding.type}</Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
