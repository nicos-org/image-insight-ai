import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EduLanguage } from "@/pages/Education";

type AnnexSection = {
  id: string;
  tabLabel: string;
  title: string;
  items: string[];
  gap: string;
};

const ANNEX_SECTIONS_EN: AnnexSection[] = [
  {
    id: "scope",
    tabLabel: "1. Scope",
    title: "1) Scope: Is this even Annex 22?",
    items: [
      "Confirm if the machine uses AI/ML in a GMP-critical decision (release, reject, control).",
      "Ensure model is static and deterministic (no learning in operation).",
      "Exclude GenAI or probabilistic outputs for critical use.",
    ],
    gap: "No real guidance for adaptive AI or GenAI in GMP. You must define your own policy.",
  },
  {
    id: "intended-use",
    tabLabel: "2. Intended Use",
    title: "2) Intended Use = Technical Spec",
    items: [
      "Define exact decision, inputs, and failure modes.",
      "Include subgroups (instrument, product, site, conditions).",
      "Cover edge cases and rare events.",
    ],
    gap: "No method for subgroup definition. There is risk of missing rare but critical cases.",
  },
  {
    id: "test-data",
    tabLabel: "3. Test Data",
    title: "3) Independent Test Data (Critical!)",
    items: [
      "Create fully independent test dataset.",
      "Ensure no leakage from training.",
      "Lock dataset with audit trail and controlled access.",
      "Verify labels (multi-expert if needed).",
    ],
    gap: "No guidance on sample size or statistical power. You must justify it.",
  },
  {
    id: "acceptance",
    tabLabel: "4. Acceptance",
    title: "4) Acceptance Criteria = Decision Quality",
    items: [
      "Define metrics: sensitivity, specificity, precision, and related quality indicators.",
      "Set thresholds per subgroup.",
      "Compare against current process (must be greater than or equal).",
      "Include confidence scores and an undecided state.",
      "Provide explainability (for example, SHAP or LIME).",
    ],
    gap: "No required metrics or thresholds. It is easy to appear compliant but still be weak.",
  },
  {
    id: "change-control",
    tabLabel: "5. Change Control",
    title: "5) Change Control = Machine + Model + Process",
    items: [
      "Treat machine change as model-impacting change.",
      "Assess impact of sensor, calibration, and environment.",
      "Monitor drift (input and performance).",
      "Put model under configuration and lifecycle control.",
    ],
    gap: "No clear MLOps standards for monitoring, retraining, and alerts.",
  },
];

const ANNEX_SECTIONS_DE: AnnexSection[] = [
  {
    id: "scope",
    tabLabel: "1. Scope",
    title: "1) Scope: Fällt das überhaupt unter Annex 22?",
    items: [
      "Bestätigen, ob die Maschine KI/ML für GMP-kritische Entscheidungen nutzt (Freigabe, Zurückweisung, Steuerung).",
      "Sicherstellen, dass das Modell statisch und deterministisch ist (kein Lernen im Betrieb).",
      "GenAI oder probabilistische Ausgaben für kritische Nutzung ausschließen.",
    ],
    gap: "Keine echte Leitlinie für adaptive KI oder GenAI in GMP. Dafür muss eine eigene Policy definiert werden.",
  },
  {
    id: "intended-use",
    tabLabel: "2. Intended Use",
    title: "2) Intended Use = Technische Spezifikation",
    items: [
      "Exakte Entscheidung, Eingaben und Fehlermodi definieren.",
      "Subgruppen einschließen (Instrument, Produkt, Standort, Bedingungen).",
      "Edge Cases und seltene Ereignisse abdecken.",
    ],
    gap: "Keine Methode zur Subgruppen-Definition. Risiko, seltene aber kritische Fälle zu übersehen.",
  },
  {
    id: "test-data",
    tabLabel: "3. Testdaten",
    title: "3) Unabhängige Testdaten (kritisch!)",
    items: [
      "Vollständig unabhängigen Testdatensatz erstellen.",
      "Sicherstellen, dass kein Leakage aus dem Training vorliegt.",
      "Datensatz mit Audit Trail und kontrolliertem Zugriff sperren.",
      "Labels verifizieren (ggf. mit mehreren Expertinnen/Experten).",
    ],
    gap: "Keine Leitlinie zu Stichprobengröße oder statistischer Power. Das muss begründet werden.",
  },
  {
    id: "acceptance",
    tabLabel: "4. Akzeptanz",
    title: "4) Akzeptanzkriterien = Entscheidungsqualität",
    items: [
      "Metriken definieren: Sensitivität, Spezifität, Präzision und verwandte Qualitätsindikatoren.",
      "Schwellenwerte pro Subgruppe festlegen.",
      "Mit dem aktuellen Prozess vergleichen (muss mindestens gleichwertig sein).",
      "Konfidenzwerte und einen Undecided-Zustand berücksichtigen.",
      "Erklärbarkeit bereitstellen (z. B. SHAP oder LIME).",
    ],
    gap: "Keine verpflichtenden Metriken oder Schwellenwerte. Formale Compliance kann dadurch fachlich schwach bleiben.",
  },
  {
    id: "change-control",
    tabLabel: "5. Change Control",
    title: "5) Change Control = Maschine + Modell + Prozess",
    items: [
      "Maschinenänderung als modellrelevante Änderung behandeln.",
      "Auswirkungen von Sensorik, Kalibrierung und Umgebung bewerten.",
      "Drift überwachen (Eingaben und Performance).",
      "Modell unter Konfigurations- und Lifecycle-Kontrolle stellen.",
    ],
    gap: "Keine klaren MLOps-Standards für Monitoring, Retraining und Alerts.",
  },
];

interface Annex22ChecklistSectionProps {
  language?: EduLanguage;
}

export const Annex22ChecklistSection = ({ language = "en" }: Annex22ChecklistSectionProps) => {
  const isDe = language === "de";
  const sections = isDe ? ANNEX_SECTIONS_DE : ANNEX_SECTIONS_EN;

  return (
    <section className="not-prose my-10">
      <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-background via-muted/20 to-background">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Annex 22</Badge>
            <Badge variant="outline">EMA</Badge>
            <Badge variant="outline">{isDe ? "KI und Data Science" : "AI and Data Science"}</Badge>
          </div>
          <CardTitle className="text-xl md:text-2xl">
            {isDe
              ? "Annex 22 (EMA): Machine-Change-Checkliste (KI / Data Science)"
              : "Annex 22 (EMA): Machine Change Checklist (AI / Data Science View)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isDe
              ? "Read-only Checkliste zur Entscheidungsunterstützung für Inspektionsbereitschaft und technische Governance."
              : "Read-only decision support checklist for inspection readiness and technical governance."}
          </p>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue={sections[0].id} className="w-full">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
              {sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="px-3 py-2 text-xs md:text-sm">
                  {section.tabLabel}
                </TabsTrigger>
              ))}
            </TabsList>

            {sections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-4">
                <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 md:p-5">
                  <h3 className="font-display text-lg font-semibold leading-tight">{section.title}</h3>

                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-start gap-2 rounded-md border border-border/60 px-3 py-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-amber-300/70 bg-amber-50/80 px-3 py-3">
                    <div className="mb-1 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <p className="text-sm font-semibold text-amber-900">{isDe ? "Lücke" : "Gap"}</p>
                    </div>
                    <p className="text-sm text-amber-900">{section.gap}</p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
};
