import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { EduLanguage } from "@/pages/Education";

type ProfileId = "good" | "bad";

type Criterion = {
  id: string;
  shortLabel: string;
  label: string;
};

type RiskCopy = {
  label: string;
  summary: string;
  panelToneClass: string;
};

const CRITERIA: Criterion[] = [
  {
    id: "domain_limited",
    shortLabel: "Domain",
    label: "Domain-limited knowledge base (approved GMP sources only)",
  },
  {
    id: "validated",
    shortLabel: "Validation",
    label: "Validation evidence and challenge tests",
  },
  {
    id: "consistent",
    shortLabel: "Consistency",
    label: "Consistent output behavior for repeated queries",
  },
  {
    id: "traceable",
    shortLabel: "Traceability",
    label: "Transparent source references and traceability",
  },
  {
    id: "audit_trail",
    shortLabel: "Audit Trail",
    label: "Query/response audit trail with user and timestamp",
  },
  {
    id: "security",
    shortLabel: "Security",
    label: "Data security and access control safeguards",
  },
  {
    id: "human_oversight",
    shortLabel: "Oversight",
    label: "Human oversight with clear intended-use boundaries",
  },
  {
    id: "monitoring",
    shortLabel: "Monitoring",
    label: "Ongoing monitoring and controlled updates",
  },
];

const PROFILE_LABELS: Record<ProfileId, string> = {
  good: "Good implementation",
  bad: "Bad implementation",
};

const PROFILE_VALUES: Record<ProfileId, Record<string, boolean>> = {
  good: {
    domain_limited: true,
    validated: true,
    consistent: true,
    traceable: true,
    audit_trail: true,
    security: true,
    human_oversight: true,
    monitoring: true,
  },
  bad: {
    domain_limited: false,
    validated: false,
    consistent: false,
    traceable: false,
    audit_trail: false,
    security: false,
    human_oversight: false,
    monitoring: false,
  },
};

const RISK_COPY: Record<number, RiskCopy> = {
  0: {
    label: "0 - No risk whatsoever",
    summary: "No risk whatsoever, we can chill.",
    panelToneClass: "border-emerald-300/70 bg-emerald-50/70",
  },
  1: {
    label: "1 - Low risk",
    summary: "Low risk. Keep normal oversight and periodic checks.",
    panelToneClass: "border-emerald-300/70 bg-emerald-50/50",
  },
  2: {
    label: "2 - Controlled risk",
    summary: "Controlled risk. Monitor trends and verify critical responses.",
    panelToneClass: "border-lime-300/70 bg-lime-50/70",
  },
  3: {
    label: "3 - Moderate risk",
    summary: "Moderate risk. Increase sampling and challenge testing.",
    panelToneClass: "border-amber-300/70 bg-amber-50/80",
  },
  4: {
    label: "4 - High risk",
    summary: "High risk. Escalate review and inspect implementation controls.",
    panelToneClass: "border-orange-300/70 bg-orange-50/80",
  },
  5: {
    label: "5 - Critical risk",
    summary: "We need to inspect, NOW.",
    panelToneClass: "border-red-300/80 bg-red-50/80",
  },
};

const toRiskLevel = (xCount: number, total: number) => {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(5, Math.round((xCount / total) * 5)));
};

interface GoodBadSummaryPanelProps {
  language?: EduLanguage;
}

export const GoodBadSummaryPanel = ({ language = "en" }: GoodBadSummaryPanelProps) => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileId>("good");
  const [overrides, setOverrides] = useState<Partial<Record<string, boolean>>>({});

  const baseValues = PROFILE_VALUES[selectedProfile];

  const effectiveValues = useMemo(
    () =>
      CRITERIA.reduce<Record<string, boolean>>((acc, criterion) => {
        const override = overrides[criterion.id];
        acc[criterion.id] = override ?? baseValues[criterion.id] ?? false;
        return acc;
      }, {}),
    [baseValues, overrides]
  );

  const checksCount = useMemo(
    () => CRITERIA.filter((criterion) => effectiveValues[criterion.id]).length,
    [effectiveValues]
  );
  const xCount = CRITERIA.length - checksCount;
  const riskLevel = toRiskLevel(xCount, CRITERIA.length);
  const riskPercent = (riskLevel / 5) * 100;
  const hasOverrides = Object.keys(overrides).length > 0;
  const riskCopy = RISK_COPY[riskLevel];
  const isDe = language === "de";

  const deRiskLabel: Record<number, string> = {
    0: "0 - Kein Risiko",
    1: "1 - Niedriges Risiko",
    2: "2 - Kontrolliertes Risiko",
    3: "3 - Mittleres Risiko",
    4: "4 - Hohes Risiko",
    5: "5 - Kritisches Risiko",
  };
  const deRiskSummary: Record<number, string> = {
    0: "Kein Risiko. Wir können entspannt bleiben.",
    1: "Niedriges Risiko. Normale Überwachung und periodische Checks beibehalten.",
    2: "Kontrolliertes Risiko. Trends überwachen und kritische Antworten verifizieren.",
    3: "Mittleres Risiko. Stichproben und Challenge-Tests erhöhen.",
    4: "Hohes Risiko. Review eskalieren und Implementierungskontrollen prüfen.",
    5: "Wir müssen JETZT inspizieren.",
  };

  const handleProfileChange = (value: string) => {
    setSelectedProfile(value as ProfileId);
    setOverrides({});
  };

  const handleCriterionToggle = (criterionId: string, checked: boolean) => {
    setOverrides((prev) => ({ ...prev, [criterionId]: checked }));
  };

  const resetToSelectedProfile = () => setOverrides({});

  return (
    <section className="not-prose my-8">
      <Card className="overflow-hidden border-border/70">
        <CardHeader className="gap-3 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl">
              {isDe ? "Zusammenfassung: Gut vs. Schlecht" : "Good vs Bad Summary"}
            </CardTitle>
            <Badge variant="outline">{isDe ? "Inspektionssicht" : "Inspector view"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isDe
              ? "Implementierungsqualität schnell vergleichen und Risikoszenarien vor der Checkliste simulieren."
              : "Compare implementation quality fast, then simulate risk scenarios before the checklist."}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-4 md:p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isDe ? "Gut-vs.-Schlecht-Matrix" : "Good vs Bad Matrix"}
            </h3>
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">{isDe ? "Profil" : "Profile"}</TableHead>
                  {CRITERIA.map((criterion) => (
                    <TableHead
                      key={criterion.id}
                      className="min-w-[95px] text-center"
                      title={criterion.label}
                    >
                      <span className="cursor-help">{criterion.shortLabel}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(["good", "bad"] as ProfileId[]).map((profileId) => (
                  <TableRow
                    key={profileId}
                    data-state={selectedProfile === profileId ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => handleProfileChange(profileId)}
                  >
                    <TableCell className="font-medium">
                      {isDe
                        ? profileId === "good"
                          ? "Gute Implementierung"
                          : "Schlechte Implementierung"
                        : PROFILE_LABELS[profileId]}
                    </TableCell>
                    {CRITERIA.map((criterion) => {
                      const ok = PROFILE_VALUES[profileId][criterion.id];
                      return (
                        <TableCell key={`${profileId}-${criterion.id}`} className="text-center text-lg">
                          <span
                            aria-label={ok ? (isDe ? "ja" : "yes") : (isDe ? "nein" : "no")}
                            className={cn(ok ? "text-emerald-600" : "text-red-600")}
                          >
                            {ok ? "✅" : "❌"}
                          </span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className={cn("space-y-4 rounded-xl border p-4 md:p-5", riskCopy.panelToneClass)}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isDe ? "Risiko-Rechner" : "Risk Calculator"}
            </h3>

            <div className="grid gap-4 md:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDe ? "Basisprofil auswählen" : "Select baseline profile"}
                </p>
                <Select value={selectedProfile} onValueChange={handleProfileChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={isDe ? "Profil auswählen" : "Choose profile"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">
                      {isDe ? "Gute Implementierung" : PROFILE_LABELS.good}
                    </SelectItem>
                    <SelectItem value="bad">
                      {isDe ? "Schlechte Implementierung" : PROFILE_LABELS.bad}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {isDe ? "Risikostufe" : "Risk level"}: {isDe ? deRiskLabel[riskLevel] : riskCopy.label}
                  </Badge>
                  <Badge variant="outline">{isDe ? "Checks" : "Checks"}: {checksCount}</Badge>
                  <Badge variant="outline">X: {xCount}</Badge>
                </div>
                <Progress value={riskPercent} className="h-3" />
                <p className="text-sm text-foreground">
                  {isDe ? deRiskSummary[riskLevel] : riskCopy.summary}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 bg-background/70 p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{isDe ? "What-if-Simulator" : "What-if simulator"}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resetToSelectedProfile}
                  disabled={!hasOverrides}
                >
                  {isDe ? "Auf Profilstandard zurücksetzen" : "Reset to profile defaults"}
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {CRITERIA.map((criterion) => (
                  <label
                    key={criterion.id}
                    htmlFor={`criterion-${criterion.id}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
                  >
                    <span className="text-sm">{criterion.label}</span>
                    <Switch
                      id={`criterion-${criterion.id}`}
                      checked={effectiveValues[criterion.id]}
                      onCheckedChange={(checked) => handleCriterionToggle(criterion.id, checked)}
                      aria-label={`Toggle ${criterion.label}`}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
