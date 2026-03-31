"use client";

import { Button } from "@/components/ui/button";

export function TicketPrintButton() {
  return (
    <Button type="button" className="rounded-full" onClick={() => window.print()}>
      Print ticket
    </Button>
  );
}
