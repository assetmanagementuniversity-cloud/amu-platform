/**
 * Public Pages Layout - AMU Platform
 *
 * Layout for publicly accessible pages that don't require authentication.
 * Includes the transparency dashboard and other public resources.
 *
 * "Ubuntu - I am because we are"
 */

import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${montserrat.variable} font-montserrat`}>
      {children}
    </div>
  );
}
