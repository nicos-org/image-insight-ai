import { Navbar } from "@/components/Navbar";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-background)]">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-12 text-center">
          Documentation
        </h1>
        
        <div className="max-w-3xl mx-auto space-y-12">
          <section className="glass-card rounded-2xl p-8 border border-border/50">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Where is the code?
            </h2>
            <p className="text-muted-foreground text-lg">
              Coming soon.
            </p>
          </section>
          
          <section className="glass-card rounded-2xl p-8 border border-border/50">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Who developed this app?
            </h2>
            <p className="text-muted-foreground text-lg">
              Coming soon.
            </p>
          </section>
          
          <section className="glass-card rounded-2xl p-8 border border-border/50">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              How is it maintained?
            </h2>
            <p className="text-muted-foreground text-lg">
              Coming soon.
            </p>
          </section>
        </div>
      </main>
      
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Inspectra • Frontend Demo
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Developed by Nicolas Perez Gonzalez, Data Scientist at Swissmedic
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
