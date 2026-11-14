// Platzhalter bis Phase 3: zeigt nur, dass Daten und Health Score zusammenspielen.
import data from "../data/customers.json";
import type { CustomerData } from "./lib/types";
import { calculateHealth } from "./lib/health";

const { asOf, customers } = data as CustomerData;

export default function App() {
  return (
    <main className="mx-auto max-w-3xl p-6 font-sans">
      <h1 className="mb-4 text-xl font-semibold">Customer Health (Platzhalter)</h1>
      <ul className="space-y-1 text-sm">
        {customers.map((c) => {
          const h = calculateHealth(c, asOf);
          return (
            <li key={c.id}>
              {h.status} · {h.score} · {c.name}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
