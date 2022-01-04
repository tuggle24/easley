import { parse } from "uri-js";

export function validateUrl(givenUrl) {
  const { scheme, fragment } = new parse(givenUrl);

  if (scheme !== "ws" && scheme !== "wss") {
    throw new Error("what the hell");
  }

  if (fragment !== undefined) {
    throw new Error("what the hell");
  }
}
