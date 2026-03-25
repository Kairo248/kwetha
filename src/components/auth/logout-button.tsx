"use client";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action="/auth/logout" method="post">
      <Button type="submit" variant="secondary">Sign out</Button>
    </form>
  );
}