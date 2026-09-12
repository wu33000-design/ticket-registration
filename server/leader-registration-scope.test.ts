import { describe, expect, it } from "vitest";
import { isRegistrationInLeaderEvent, registrationAffectsLeaderPeople } from "./db";

describe("table leader registration scope", () => {
  it("allows a table leader to manage any registration in the same event", () => {
    expect(isRegistrationInLeaderEvent(1, 1)).toBe(true);
    expect(isRegistrationInLeaderEvent(2, 1)).toBe(false);
  });

  it("does not count public registrations toward the table leader's own people total", () => {
    expect(registrationAffectsLeaderPeople(null, 7)).toBe(false);
    expect(registrationAffectsLeaderPeople(7, 7)).toBe(true);
    expect(registrationAffectsLeaderPeople(8, 7)).toBe(false);
  });
});
