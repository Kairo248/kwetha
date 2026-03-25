import { YOUTH_AGE_THRESHOLD } from "@/lib/constants";
import type { AudienceCategory } from "@/types/domain";

export function calculateAge(dob: string | Date, referenceDate = new Date()) {
  const birthDate = dob instanceof Date ? dob : new Date(dob);
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = referenceDate.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && referenceDate.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function resolveAudienceCategory(
  dob: string | Date,
  referenceDate = new Date(),
): AudienceCategory {
  return calculateAge(dob, referenceDate) < YOUTH_AGE_THRESHOLD ? "youth" : "senior";
}

export function canAllocateCategory(input: {
  category: AudienceCategory;
  soldYouth: number;
  soldSenior: number;
  youthQuota: number;
  seniorQuota: number;
}) {
  if (input.category === "youth") {
    return input.soldYouth < input.youthQuota;
  }

  return input.soldSenior < input.seniorQuota;
}

export function generateTicketReference(sequence: number, year = new Date().getFullYear()) {
  return `IKW-${year}-${String(sequence).padStart(4, "0")}`;
}

export function getTicketValidationMessage(status: "valid" | "used" | "cancelled") {
  if (status === "used") {
    return "Ticket has already been redeemed.";
  }

  if (status === "cancelled") {
    return "Ticket is no longer valid.";
  }

  return "Ticket is valid and can be marked as used.";
}