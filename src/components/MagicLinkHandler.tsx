'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { processMagicLinks } from '@/lib/magic-link';

function MagicLinkHandlerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Process magic links whenever the route changes
    processMagicLinks();
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}

export function MagicLinkHandler() {
  return (
    <Suspense fallback={null}>
      <MagicLinkHandlerInner />
    </Suspense>
  );
}
