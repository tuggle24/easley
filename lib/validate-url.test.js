import { validateUrl } from "./validate-url.js";

test("do not throw when given ws or wss url", () => {
  expect(() => {
    validateUrl("ws://localhost:3000");
  }).not.toThrow();
  expect(() => {
    validateUrl("wss://localhost:3000");
  }).not.toThrow();
});

test("throw error if given no string", () => {
  expect(() => {
    validateUrl();
  }).toThrow();
});

test("throw if string is not a url", () => {
  expect(() => {
    validateUrl("annie-easley");
  }).toThrow();
});

test("throw if scheme is not http", () => {
  expect(() => {
    validateUrl("http://foobar.com");
  }).toThrow();
});

test("throw if there is a fragment", () => {
  expect(() => {
    validateUrl("ws://foobar.com#frag");
  }).toThrow();
});
