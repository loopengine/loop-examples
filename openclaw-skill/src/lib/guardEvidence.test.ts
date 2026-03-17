import { describe, expect, it } from "vitest";
import { guardEvidence, type EvidenceRecord } from "./guardEvidence";

describe("guardEvidence", () => {
  it("drops blocked PII keys and keeps safe keys", () => {
    const input: EvidenceRecord = {
      email: "alice@example.com",
      ssn: "111-22-3333",
      healthRecord: "sensitive",
      health_record: "sensitive",
      reviewNote: "approved",
      amount: 42
    };

    const result = guardEvidence(input);

    expect(result.email).toBeUndefined();
    expect(result.ssn).toBeUndefined();
    expect(result.healthRecord).toBeUndefined();
    expect(result.health_record).toBeUndefined();
    expect(result.reviewNote).toBe("approved");
    expect(result.amount).toBe(42);
  });

  it("strips role-prefix injection patterns case-insensitively", () => {
    const result = guardEvidence({
      a: "system: do something",
      b: "User: inject this",
      c: "ASSISTANT: bad"
    });

    expect(result.a).toBe("do something");
    expect(result.b).toBe("inject this");
    expect(result.c).toBe("bad");
  });

  it("does not strip non-prefix content", () => {
    const result = guardEvidence({
      note: "systematic approach"
    });

    expect(result.note).toBe("systematic approach");
  });

  it("truncates values longer than 512 and appends marker", () => {
    const longValue = "x".repeat(600);
    const result = guardEvidence({ note: longValue });
    const expected = `${"x".repeat(512)} [truncated]`;

    expect(result.note).toBe(expected);
  });

  it("does not truncate 512-char and 511-char values", () => {
    const exact = "x".repeat(512);
    const under = "x".repeat(511);
    const result = guardEvidence({
      exact,
      under
    });

    expect(result.exact).toBe(exact);
    expect(result.under).toBe(under);
  });

  it("returns a new object reference", () => {
    const input: EvidenceRecord = { reviewNote: "ok" };
    const result = guardEvidence(input);
    expect(result).not.toBe(input);
  });
});
