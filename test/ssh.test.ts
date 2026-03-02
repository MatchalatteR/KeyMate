import { strict as assert } from "assert";
import { isRemoteWindow, parseSshRemoteAlias } from "../src/ssh";

describe("ssh helper", () => {
  it("detects local window", () => {
    assert.equal(isRemoteWindow(undefined), false);
  });

  it("detects remote window", () => {
    assert.equal(isRemoteWindow("ssh-remote+my-host"), true);
  });

  it("parses ssh alias", () => {
    assert.equal(parseSshRemoteAlias("ssh-remote+my-host"), "my-host");
  });

  it("parses encoded ssh alias", () => {
    assert.equal(parseSshRemoteAlias("ssh-remote+my%2Bhost"), "my+host");
  });

  it("parses alias from composite remote string", () => {
    assert.equal(parseSshRemoteAlias("vscode-remote://ssh-remote+my-host/home/dev"), "my-host");
  });

  it("rejects unsupported remote", () => {
    assert.equal(parseSshRemoteAlias("dev-container+abc"), undefined);
  });
});
