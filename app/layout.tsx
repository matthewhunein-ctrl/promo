import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <header className="card">
            <h1>Crzookie Payroll Prep</h1>
            <nav style={{ display: 'flex', gap: 16 }}>
              <Link href="/">Dashboard</Link>
              <Link href="/employees">Employees</Link>
              <Link href="/shifts">Shifts</Link>
              <Link href="/tips">Tips</Link>
              <Link href="/payroll">Payroll Week</Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
