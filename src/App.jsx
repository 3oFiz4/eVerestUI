import { Button, Card, Overlay } from "./components";

export default function App() {
  return (
    <main className="min-h-screen w-screen grid grid-cols-2 divide-x divide-neutral-800 bg-neutral-950 text-neutral-100">
      <section className="flex items-center justify-center p-8">
        <Button>
          <Overlay variant="sparkle" />
          <span className="relative z-10">Shine Button</span>
        </Button>
      </section>

      <section className="flex items-center justify-center p-8">
        <Card>
          <Overlay variant="sparkle" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Sparkle Card</h2>
            <p className="text-sm text-neutral-400">
              GSAP animated overlay element
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
