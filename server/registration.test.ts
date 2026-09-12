import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("registration access", () => {
  it("accepts the configured access code and rejects other codes", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.access.verify({ code: "鍘美搶票大行動" })).resolves.toEqual({ verified: true });
    await expect(caller.access.verify({ code: "錯誤驗證碼" })).resolves.toEqual({ verified: false });
  });

  it("trims whitespace around the configured access code", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.access.verify({ code: "  鍘美搶票大行動  " })).resolves.toEqual({ verified: true });
  });
});

describe("registration input", () => {
  it("requires a name and keeps the attendee count within one to ten", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.registrations.create({ eventSlug: "9-21", name: "", people: 1 })).rejects.toThrow();
    await expect(caller.registrations.create({ eventSlug: "9-21", name: "王小明", people: 0 })).rejects.toThrow();
    await expect(caller.registrations.create({ eventSlug: "9-21", name: "王小明", people: 11 })).rejects.toThrow();
  });
});
