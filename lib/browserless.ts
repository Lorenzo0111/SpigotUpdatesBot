import axios, { AxiosError } from "axios";
import type { ExtendedClient } from "../types";

const BROWSERLESS_CONCURRENCY = parseInt(
  process.env.BROWSERLESS_CONCURRENCY ?? "2",
  10,
);

let browserlessActive = 0;
const browserlessWaiters: Array<() => void> = [];

function acquireBrowserlessSlot(): Promise<void> {
  if (browserlessActive < BROWSERLESS_CONCURRENCY) {
    browserlessActive++;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    browserlessWaiters.push(() => {
      browserlessActive++;
      resolve();
    });
  });
}

function releaseBrowserlessSlot(): void {
  browserlessActive--;
  const next = browserlessWaiters.shift();
  if (next) next();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryAfter(error: AxiosError): number {
  const raw = error.response?.headers["retry-after"];
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value != null) {
    const sec = parseInt(String(value), 10);
    if (!Number.isNaN(sec) && sec >= 0) return Math.min(sec * 1000, 60_000);
  }

  return 2000;
}

export async function renderHTML(
  client: ExtendedClient,
  html: string,
): Promise<ArrayBuffer | null> {
  if (!client.config.browserless) return null;

  const body = {
    html,
    addScriptTag: [
      {
        content: `
              (function() {
                const imgs = Array.from(document.querySelectorAll('img:not([data-img-wrapped])'));
                imgs.forEach(img => {
                  img.setAttribute('data-img-wrapped', 'true');
                  const object = document.createElement('object');
                  object.setAttribute('type', 'image/png');
                  object.setAttribute('data', img.getAttribute('data-url') || img.src);
                  object.setAttribute('style', img.getAttribute('style') || '');
                  if (img.hasAttribute('alt'))
                    object.setAttribute('aria-label', img.getAttribute('alt'));

                  const fallbackImg = document.createElement('img');
                  fallbackImg.src = 'https://raw.githubusercontent.com/Lorenzo0111/SpigotUpdatesBot/master/media/404.png';
                  fallbackImg.alt = img.alt || '';
                  fallbackImg.setAttribute('style', img.getAttribute('style') || '');
                  object.appendChild(fallbackImg);
                  img.parentNode?.replaceChild(object, img);
                });
              })();
            `,
      },
      {
        content: `
              const watermark = document.createElement('img');
              watermark.src = 'https://raw.githubusercontent.com/Lorenzo0111/SpigotUpdatesBot/master/media/banner.png';
              watermark.setAttribute('class', 'watermark');
              document.body.appendChild(watermark);
            `,
      },
    ],
    addStyleTag: [
      {
        content: `
                .watermark {
                    position: absolute;
                    bottom: 15px;
                    left: 15px;
                    opacity: 0.5;
                    z-index: 1000;
                    width: 100px;
                    object-fit: contain;
                }
              `,
      },
    ],
    waitForFunction: {
      fn: `async () => {
                function waitForImages() {
                    return Promise.all(
                        Array.from(document.images)
                        .filter((img) => !img.complete)
                        .map((img) =>
                            new Promise((resolve) => {
                                img.onload = img.onerror = resolve;
                            })
                        )
                    );
                }

                function waitForObject(obj) {
                    return new Promise((resolve) => {
                        if (!obj) return resolve();

                        if (obj.readyState === 4 || obj.complete) {
                            resolve();
                        } else {
                            obj.onload = obj.onerror = () => resolve();
                        }
                    });
                }

                const objects = Array.from(document.getElementsByTagName("object"));

                return await Promise.all([
                    waitForImages(),
                    ...objects.map(waitForObject)
                ]);
        }`,
      timeout: 5000,
    },
    viewport: {
      width: 650,
      height: 500,
    },
  };

  const axiosOptions = { responseType: "arraybuffer" as const };

  for (let attempt = 0; attempt < 2; attempt++) {
    await acquireBrowserlessSlot();
    let slotReleased = false;

    try {
      const response = await axios.post(
        client.config.browserless,
        body,
        axiosOptions,
      );
      return response.data;
    } catch (error) {
      const is429 =
        error instanceof AxiosError && error.response?.status === 429;

      if (is429 && attempt === 0) {
        releaseBrowserlessSlot();
        slotReleased = true;
        await sleep(retryAfter(error));
        continue;
      }

      if (error instanceof AxiosError)
        client.logger.error(JSON.stringify(error.toJSON(), null, 2));
      else client.logger.error(error as string);

      return null;
    } finally {
      if (!slotReleased) releaseBrowserlessSlot();
    }
  }

  return null;
}
