export const eventLoopCycle = () => sleep();

export function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function waitFor(condition) {
  const promise = new Promise((resolve) => {
    const check = () => {
      condition().then((ok) => {
        if (ok === true) {
          resolve();
        } else {
          setTimeout(check, 20);
        }
      });
    };

    check();
  });

  return promise;
}

const sleep_im = () => new Promise((r) => setImmediate(r));
const queueMacrotask = (f) => setTimeout(f);
