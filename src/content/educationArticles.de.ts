import type { EducationArticle } from "./educationArticles";

export const educationArticlesDe: EducationArticle[] = [
  {
    id: "chatgpt-like-app-gmp-environments",
    title: "Eine ChatGPT-ähnliche App in GMP-Umgebungen: Ist das relevant?",
    content: `

## Einleitung

ChatGPT und ähnliche KI-Chatbots haben sich in kurzer Zeit stark verbreitet. Sie liefern menschenähnliche Antworten und können komplexe Fragen bearbeiten. 
Aber hat ein solches Sprachmodell Platz in einer Good Manufacturing Practice (GMP)-Umgebung? Wenn Sie GMP-Inspektor oder Quality Professional sind 
(z. B. bei Swissmedic, FDA, EMA), werden Sie solche Systeme sehr wahrscheinlich in der Praxis antreffen.

Müssen wir das in Inspektionen aktiv adressieren? Die kurze Antwort lautet **ja**. Wir sollten uns dafür interessieren. 
Dieser Artikel erklärt, warum das so ist. Im Fokus steht die Chatbot-Komponente solcher Systeme. Wir zeigen, was Sprachmodelle sind, 
wie man sie erkennt, warum sie für GMP relevant sind und woran man gute versus schlechte Implementierungen erkennt.

Kurz gesagt:
- ChatGPT-ähnliche Tools kommen bereits in GMP-Workflows an.
- Sie können Prozesse beschleunigen, schaffen aber auch neue Compliance-Risiken.
- Für Inspektionen sind Implementierungsqualität, Kontrollen und Nachvollziehbarkeit entscheidend.

## Was ist ein Sprachmodell (LM)?

Ein Sprachmodell ist ein KI-System, das menschliche Sprache versteht und erzeugt. Vereinfacht gesagt: Es sagt auf Basis vorheriger Wörter die wahrscheinlich nächsten Wörter voraus. 
Moderne Modelle wie GPT-4 oder Bard wurden mit sehr großen Textmengen trainiert und erzeugen dadurch flüssige, kontextbezogene Antworten.

> [!WARNING]
> Wichtig: Sprachmodelle "denken" nicht wie eine Datenbank oder Suchmaschine. 
Sie erzeugen Antworten durch statistische Vorhersage. Dadurch können auch überzeugend klingende, aber falsche Inhalte entstehen.

[Deep Dive: How Large Language Models Work](https://medium.com/data-science-at-microsoft/how-large-language-models-work-91c362f5b78f)

![NLP diagram](/nlp.png)

### LMs als eingebettete Komponenten

In vielen Anwendungen sind LMs Teil eines größeren Systems, etwa als Helpdesk-Chatbot oder Dokumentassistent. 
Im GMP-Kontext kann ein LM eingebunden werden, damit Nutzer Anlagendaten oder SOPs in natürlicher Sprache abfragen. 
Das LM ist typischerweise ein Baustein innerhalb einer Anwendung (UI, Business-Logik, Datenbanken), nicht ein isoliertes Produkt.

> [!WARNING]
> Je nach Komplexität der Aufgabe für das LM/LLM verändert sich das Risiko. 
Nicht nur die Aufgabe selbst ist relevant, sondern auch die Einbettung im System: isoliert und gut testbar oder tief in einer größeren Software integriert.

## Wie erkennt man eine ChatGPT-ähnliche Anwendung?

- **Natürliche Chat-Oberfläche:** Nutzer stellen frei formulierte Fragen und erhalten ausformulierte Antworten.
- **Menschlich klingende Antworten:** Das System erklärt Sachverhalte statt nur feste Werte auszugeben.
- **Flexible Formulierungen:** Unterschiedliche Fragevarianten führen zum gleichen fachlichen Ergebnis.
- **KI-Branding:** Begriffe wie "AI Assistant", "Chatbot" oder "Ask me anything" sind klare Indikatoren.
- **Variable Formulierungen:** Antworten klingen bei Wiederholung nicht immer gleich.

> [!CHAT] Was waren die Parameter der letzten Autoklav-Charge?
> [!CHAT_REPLY] Gute Frage. Die letzten Parameter waren P=1ATM, T=145 C, Zeit=35 Minuten. Soll ich diese Parameter anpassen?

## Warum sollten Regulatoren LMs in GMP ernst nehmen?

Jedes Tool, das GMP-Daten verarbeitet oder Entscheidungen unterstützt, kann Produktqualität und Patientensicherheit beeinflussen. 
Daher gelten bestehende Anforderungen wie Datenintegrität, Validierung und Auditierbarkeit auch für KI-gestützte Komponenten.

[Draft Annex 22: Artificial Intelligence (Consultation Guideline PDF)](https://www.gmp-navigator.com/files/guidemgr/mp_vol4_chap4_annex22_consultation_guideline_en.pdf)

### Wahrgenommene Nicht-Deterministik in der Praxis

Häufig wird gesagt, LLMs gäben "jedes Mal andere Antworten". Diese Wahrnehmung kollidiert auf den ersten Blick mit GMP-Anforderungen an Reproduzierbarkeit. 
Wenn identische Eingaben zu unterschiedlichen Texten führen, stellt sich die Frage nach Validierung und Verlässlichkeit.

> [!TWO_CENTS] Große Sprachmodelle sind mathematisch deterministisch, wenn Modellstand, Eingaben, numerische Präzision und Dekodierungskonfiguration identisch sind. 
Variabilität wird oft bewusst über Sampling (z. B. Temperature, top-k, top-p) erzeugt. Mit kontrollierten Einstellungen kann Reproduzierbarkeit erzwungen werden. 
Eine zweite Ebene bleibt: numerische Unterschiede durch Hardware, Präzision und nicht-deterministische Kernel können in Grenzfällen Token-Auswahl beeinflussen.

### Datenintegrität und Verantwortlichkeit

Eine weitere zentrale Sorge ist **Datenintegrität und Nachvollziehbarkeit**. GMP verlangt, dass klar ist, wer Daten erfasst oder Entscheidungen trifft, und dass Einträge attribuierbar sind. 
Wenn ein KI-Assistent eine Zusammenfassung erzeugt, muss nachvollziehbar sein, wer was gefragt, geprüft und freigegeben hat. 
Ein Chatbot-Ergebnis darf keine Black Box sein.

Datenintegrität betrifft auch Vollständigkeit und Richtigkeit. **Ein bekanntes Risiko ist, dass LMs Informationen erfinden können ("Halluzination").** 
In einer Inspektion würde fehlerhafte KI-Unterstützung bei kritischen Parametern erhebliche Konsequenzen haben.

Kurz zusammengefasst:
- Datensätze und Entscheidungen müssen attribuierbar bleiben.
- KI-Ausgaben müssen auf freigegebene Quellen zurückführbar sein.
- Audit Trails müssen Prompts, Antworten, Zeitstempel und Nutzerkontext enthalten.
- Halluzinationsrisiken müssen durch Validierung, Kontrolle und Quellenprüfung begrenzt werden.

> [!WARNING]
> Regulatorische Erwartung: Wenn ein Unternehmen ein ChatGPT-ähnliches Tool in einem GMP-Prozess einsetzt, ist es wie ein GxP-Computersystem zu behandeln. 
Das umfasst Risikoanalysen, Validierung (IQ/OQ/PQ) und wirksame Kontrollen innerhalb des vorgesehenen Einsatzzwecks.

## Szenariokontext: Chatbot für einen Autoklaven

Ein Operator fragt im Chat statt in Handbüchern zu suchen. Das System kombiniert Prozesslogs und freigegebene Dokumente, um schnelle Antworten zu liefern. 
Operativ kann das Effizienz bringen. Aus Inspektionssicht entstehen jedoch Fragen zu Korrektheit, Vollständigkeit, Datenquelle, Scope, Nutzertraining und Auditierbarkeit.

> [!CHAT] Zeig mir die letzten zwei Chargen und ob alle Parameter in Spezifikation waren.
> [!CHAT_REPLY] Chargen 105 und 106: beide erfolgreich, keine Alarme, alle Werte innerhalb des validierten Bereichs.

~~~mermaid
flowchart LR
  OP[Operator] --> UI[Chat UI]
  UI --> ORCH[Query Orchestrator]
  ORCH --> RET[Retriever]
  RET --> LOGS[(Autoclave Process Logs)]
  RET --> DOCS[(Approved SOP and Manual)]
  ORCH --> LLM[Language Model]
  LLM --> RESP[Response Composer]
  RESP --> UI
  ORCH --> CTRL[Validation and Scope Controls]
  RESP --> CITES[Source References and Citations]
  UI --> AUDIT[(Audit Trail)]
~~~

## Gut vs. Schlecht: Implementierungen eines GMP-Chatbots

Gute Implementierungen sind kontrolliert, validiert und nachvollziehbar. Schlechte Implementierungen sind unklar im Scope, unzureichend validiert und schwach in Audit Trail und Datenintegrität.

### Merkmale einer guten Implementierung

- Eingeschränkte, freigegebene Wissensbasis (keine unkontrollierten Quellen)
- Nachweisbare Validierung mit Edge-Cases
- Konsistente Ausgaben bei gleichen Eingaben
- Quellenbezug und vollständige Audit Trails
- Definierter Intended Use, Nutzertraining, kontinuierliches Monitoring

### Merkmale einer schlechten Implementierung

- Unkontrollierte General-AI ohne Einschränkungen
- Fehlende Validierung oder nur Anbieter-Vertrauen
- Inkonsistente Antworten und fehlende Nachvollziehbarkeit
- Datenabfluss an Dritte ohne Governance
- Keine Change-Control- und Monitoring-Strategie

> [!GOOD_BAD_SUMMARY]

## Inspektions-Checkliste vor Ort

- **Scope klären:** Was ist der vorgesehene Einsatz und welche GMP-Entscheidungen werden beeinflusst?
- **Datenquellen prüfen:** Nutzt der Chatbot freigegebene und aktuelle Daten/Dokumente?
- **Validierungsnachweise einsehen:** Gibt es belastbare Testfälle und Berichte?
- **Konsistenz demonstrieren:** Gleiches Prompt mehrfach testen, auf inhaltliche Stabilität achten.
- **Audit Trail verifizieren:** Sind Prompt/Antwort/Nutzer/Zeitstempel vorhanden?
- **Sicherheit und Zugriff:** Lokale Verarbeitung oder Cloud, Lieferantenqualifizierung, Zugriffskontrolle.

> [!ANNEX22_CHECKLIST]

## Fazit

ChatGPT-ähnliche Anwendungen in GMP sind weder pauschal gut noch schlecht. Entscheidend ist die Umsetzung. 
Mit klaren Grenzen, valider Datenbasis, reproduzierbaren Ergebnissen, Audit Trails und menschlicher Aufsicht kann KI sinnvoll in regulierte Prozesse integriert werden.

## Quellen

- Heitmann, M. et al. (2023). "ChatGPT, BARD, and Other Large Language Models Meet Regulated Pharma." Pharmaceutical Engineering, ISPE.
- Smith, J.A. (2025). "ChatGPT Is Too Smart for the FDA — Until Now." Medium.
- Clough, P. (2025). "So, You want to use ChatGPT to help you with your Pharmaceutical Quality System?" LinkedIn Article.
- LiveOak QA (Pete) (2025). "AI Chatbots and GxP Compliance - Sounding the Alarm." LiveOakQA Blog.
- Blanke, M. (2025). "AI validation in pharma: maintaining compliance and trust." EY Switzerland.
- European Commission GMDP Inspectors Working Group (2025). Draft Annex 22: Artificial Intelligence (GMP Guidelines).
`,
  },
  {
    id: "getting-started",
    title: "Erste Schritte",
    content: `# Erste Schritte

Willkommen im Bereich Education. Dies ist Ihr erster Artikel.

## Was Sie hier finden

- **Guides:** Schritt-für-Schritt-Anleitungen zur Nutzung von Inspectra.
- **Konzepte:** Vertiefende Erklärungen zu zentralen Zusammenhängen.
- **Beispiele:** Praxisnahe Anwendungsfälle und Muster.

## Nächste Schritte

Wählen Sie links weitere Artikel aus, um fortzufahren. Neue Inhalte werden laufend ergänzt.
`,
  },
];
