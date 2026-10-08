import { describe, expect, it, vi } from "vitest";

const { fakeApp } = vi.hoisted(() => ({
  fakeApp: { marker: "express-app", listen: vi.fn() },
}));
vi.mock("../src/app.js", () => ({ default: fakeApp }));

import vercelApp from "../index.js";

describe("Vercel Express entrypoint", () => {
  it("default-exports the existing app without starting a listener", () => {
    expect(vercelApp).toBe(fakeApp);
    expect(fakeApp.listen).not.toHaveBeenCalled();
  });
});
