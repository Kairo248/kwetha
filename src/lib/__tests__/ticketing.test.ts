import { describe, expect, it } from "vitest";
import {
  calculateAge,
  canAllocateCategory,
  generateTicketReference,
  resolveAudienceCategory,
} from "@/lib/ticketing";

describe("ticketing rules", () => {
  it("classifies youth attendees below 35", () => {
    expect(resolveAudienceCategory("2000-08-12", new Date("2026-08-11"))).toBe("youth");
  });

  it("classifies 35 and above as senior", () => {
    expect(resolveAudienceCategory("1991-08-12", new Date("2026-08-12"))).toBe("senior");
  });

  it("blocks allocation when youth quota is full", () => {
    expect(
      canAllocateCategory({
        category: "youth",
        soldYouth: 250,
        soldSenior: 120,
        youthQuota: 250,
        seniorQuota: 250,
      }),
    ).toBe(false);
  });

  it("allows senior allocation while senior quota remains", () => {
    expect(
      canAllocateCategory({
        category: "senior",
        soldYouth: 250,
        soldSenior: 120,
        youthQuota: 250,
        seniorQuota: 250,
      }),
    ).toBe(true);
  });

  it("creates padded ticket references", () => {
    expect(generateTicketReference(7, 2026)).toBe("IKW-2026-0007");
  });

  it("calculates age deterministically", () => {
    expect(calculateAge("1995-10-02", new Date("2026-10-01"))).toBe(30);
  });
});