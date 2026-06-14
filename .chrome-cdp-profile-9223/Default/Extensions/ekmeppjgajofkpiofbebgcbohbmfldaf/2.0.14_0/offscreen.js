const textarea = document.getElementById('textarea');
const sandbox = document.getElementById('sandbox');

const clipboardData = {};

document.addEventListener('copy', oncopy, false);

const IFRAME_IDLE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const CLEANUP_TICK_MS = 10 * 60 * 1000; // 10 minutes

const iframePool = new Map(); // normalizedOrigin -> { iframe, ready, lastUsed, originFromReady }
const iframeReadyWaiters = new Map(); // normalizedOrigin -> { resolve, reject, t }

let iframeSessionRuleId = null;

function normalizeOrigin(input) {
  return new URL(input).origin;
}

function objectToArrayBuffer(obj, length) {
  const u8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) u8[i] = obj[i] | 0;
  return u8.buffer;
}

function hashObjectToNumber(obj) {
  const str = JSON.stringify(obj);
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }

  return (Math.abs(hash) % 99) + 1;
}

async function fetchRequest({ url, options }) {
  const {
    requestId,
    responseStatus,
    responseOk = true,
    responseType = 'text', // text | json | blob | arrayBuffer и т.п.
    stream = false,
    ...fetchOptions
  } = options || {};

  try {
    const headers = fetchOptions?.headers || {};
    const ruleId = hashObjectToNumber({url, fetchOptions});
    const hasHeaders = Object.keys(headers).length > 0;
    if (hasHeaders) {
      const requestHeaders = Object.entries(headers).map(([key, value]) => ({
        header: key,
        operation: "set",
        value: value
      }));

      const responseHeaders = [
        { header: "set-cookie", operation: "remove" },
        { header: "set-cookie2", operation: "remove" },
      ]

      await chrome.runtime.sendMessage({
        cmd: "AddSessionRule",
        data: {
          rule: {
            id: ruleId,
            action: {
              type: "modifyHeaders",
              requestHeaders,
              responseHeaders,
            },
            condition: {
              tabIds: [-1],
              urlFilter: url
            }
          },
        },
      });
    }

    let response;
    try {
      response = await fetch(url, fetchOptions);
    } finally {
      if (hasHeaders) {
        chrome.runtime.sendMessage({
          cmd: "DisableSessionRule",
          data: ruleId,
        });
      }
    }

    if ((responseOk && !response.ok) ||
      (responseStatus && responseStatus !== response.status)) {
      throw new Error(`Response status ${response.status}`);
    }

    const safeResponse = {};
    ['ok', 'redirected', 'status', 'statusText', 'type', 'url'].forEach((key) => {
      safeResponse[key] = response[key];
    });

    const headersObj = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    safeResponse.headers = headersObj;

    // ===== STREAM MODE =====
    if (stream && response.body && response.body.getReader) {
      const reader = response.body.getReader();
      let received = 0;

      sandbox.contentWindow.postMessage({
        cmd: "FetchRequestedStart",
        data: { requestId, response: safeResponse },
      }, '*');
  
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          sandbox.contentWindow.postMessage({
            cmd: "FetchRequested",
            data: { requestId, response: safeResponse, done: true, received },
          }, '*');
          break;
        }

        received += value.byteLength;

        const ab = objectToArrayBuffer(value, value.byteLength);
        sandbox.contentWindow.postMessage({
          cmd: "FetchRequestedChunk",
          data: { requestId, chunk: ab, length: ab.byteLength, received, done: false },
        }, '*', [ab]);
      }

      return;
    }

    // ===== NON-STREAM MODE =====
    const body = await response[responseType]();

    sandbox.contentWindow.postMessage({
      cmd: "FetchRequested",
      data: {
        requestId,
        response: safeResponse,
        body,
        done: true,
        received: body.length,
      },
    }, '*');
  } catch (error) {
    sandbox.contentWindow.postMessage({
      cmd: "FetchRequested",
      data: { requestId, error: String(error) },
    }, '*');
  }
}

async function ensureIframeForOrigin(normalizedOrigin) {
  const ex = iframePool.get(normalizedOrigin);
  if (ex) {
    return ex;
  };

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;";

  iframe.name = `fetch-iframe:${normalizedOrigin}`;
  iframe.src = normalizedOrigin;

  document.body.appendChild(iframe);

  const ready = new Promise((resolve, reject) => {
    const timeoutTs = 15000;

    const t = setTimeout(() => {
      iframeReadyWaiters.delete(normalizedOrigin);
      reject(new Error(`Iframe ready timeout (${timeoutTs}ms), src: ${iframe.src}`));
    }, timeoutTs);

    iframeReadyWaiters.set(normalizedOrigin, { resolve, reject, t });

    iframe.addEventListener("error", () => {
      clearTimeout(t);
      iframeReadyWaiters.delete(normalizedOrigin);
      reject(new Error(`Iframe load error: ${iframe.src}`));
    }, { once: true });
  });

  const entry = {
    iframe,
    ready,
    lastUsed: Date.now(),
    originFromReady: null, // event.origin из iframe-ready
    normalizedOrigin,
  };

  iframePool.set(normalizedOrigin, entry);

  return entry;
}

function cleanupEntry(normalizedOrigin, entry) {
  entry.iframe.remove();
  iframePool.delete(normalizedOrigin);

  const waiter = iframeReadyWaiters.get(normalizedOrigin);
  if (waiter) {
    clearTimeout(waiter.t);
    iframeReadyWaiters.delete(normalizedOrigin);
    waiter.reject(new Error(`Iframe disposed by TTL cleanup: ${normalizedOrigin}`));
  }
}

setInterval(() => {
  const now = Date.now();

  for (const [normalizedOrigin, entry] of iframePool.entries()) {
    if (now - entry.lastUsed < IFRAME_IDLE_TTL_MS) {
      continue;
    };

    cleanupEntry(normalizedOrigin, entry);
  }

  if (iframePool.size === 0 && iframeSessionRuleId !== null) {
    chrome.runtime.sendMessage({
      cmd: "DisableSessionRule",
      data: iframeSessionRuleId,
    }).catch((err) => {
      console.error("Failed to disable session rule", err);
    });

    iframeSessionRuleId = null;
  }
}, CLEANUP_TICK_MS);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sandbox.contentWindow.postMessage({
    cmd: message.cmd,
    data: message.data,
  }, '*');

  if (message.cmd === 'copy-data-to-clipboard') {
    handleClipboardWrite(message.data);
  }

  if (message.cmd === 'iframe-fetch') {
    (async () => {
      const { options } = message.data || {};

      const {
        requestId,
        responseStatus,
        responseOk = true,
        responseType = 'text',
        stream = false,
        ...fetchOptions
      } = options || {};

      const rawOrigin = fetchOptions?.headers?.Origin || fetchOptions?.headers?.origin;

      if (!rawOrigin) {
        sandbox.contentWindow.postMessage({
          cmd: "FetchRequested",
          data: { requestId, error: "Missing origin/header" },
        }, '*');
        return;
      }

      let normalizedOrigin;
      try {
        normalizedOrigin = normalizeOrigin(rawOrigin);
      } catch {
        sandbox.contentWindow.postMessage({
          cmd: "FetchRequested",
          data: { requestId, error: "Invalid origin URL" },
        }, '*');
        return;
      }

      try {
        if (iframePool.size === 0) {
          const rule = await chrome.runtime.sendMessage({
            cmd: "EnableFramingBySessionRule",
          }).catch((err) => {
            console.error("Failed to enable session rule", err);
            return null;
          });

          iframeSessionRuleId = rule?.data || null;
        }

        const entry = await ensureIframeForOrigin(normalizedOrigin);

        await entry.ready;
        entry.lastUsed = Date.now();

        const targetOrigin = entry.originFromReady || normalizedOrigin;

        entry.iframe.contentWindow.postMessage({
          cmd: "iframe-fetch",
          data: message.data,
        }, targetOrigin);
      } catch (error) {
        sandbox.contentWindow.postMessage({
          cmd: "FetchRequested",
          data: { requestId, error: String(error) },
        }, '*');
      }
    })();
  }
})

window.addEventListener('message', (event) => {
  if (
    event.data.cmd === "FetchRequest"
      && !event.data.data?.options?.iframe
      && !event.data.data?.options?.sw
  ) {
    return fetchRequest(event.data.data);
  }

  if (event.data.cmd === "iframe-fetch-requested") {
    const { requestId, response, body } = event.data.data || {};

    sandbox.contentWindow.postMessage({
      cmd: "FetchRequested",
      data: { requestId, response, body },
    }, '*');
    return;
  }

  if (event.data?.cmd === "iframe-fetch-error") {
    const { requestId, error } = event.data.data || {};

    sandbox.contentWindow.postMessage({
      cmd: "FetchRequested",
      data: { requestId, error: String(error) },
    }, '*');
    return;
  }

  if (event.data?.cmd === "iframe-ready") {
    const { originKey } = event.data.data || {};

    if (!originKey) return;

    let normalizedOrigin;
    try {
      normalizedOrigin = normalizeOrigin(originKey);
    } catch {
      return;
    }

    const entry = iframePool.get(normalizedOrigin);
    if (!entry) return;

    entry.originFromReady = event.origin;

    const waiter = iframeReadyWaiters.get(normalizedOrigin);
    if (!waiter) return;

    clearTimeout(waiter.t);
    iframeReadyWaiters.delete(normalizedOrigin);
    waiter.resolve();
    return;
  }

  // ===== STREAM EVENTS FROM IFRAME =====
  if (event.data?.cmd === "iframe-fetch-start") {
    const { requestId, response } = event.data.data || {};

    sandbox.contentWindow.postMessage({
      cmd: "FetchRequestedStart",
      data: { requestId, response },
    }, '*');
    return;
  }

  if (event.data?.cmd === "iframe-fetch-chunk") {
    const { requestId, chunk, length, received, done } = event.data.data || {};

    sandbox.contentWindow.postMessage({
      cmd: "FetchRequestedChunk",
      data: { requestId, chunk, length, received, done: !!done },
    }, '*', [chunk]);
    return;
  }

  if (event.data?.cmd === "iframe-fetch-done") {
    const { requestId, response, received } = event.data.data || {};

    sandbox.contentWindow.postMessage({
      cmd: "FetchRequested",
      data: { requestId, response, done: true, received },
    }, '*');
    return;
  }

  chrome.runtime.sendMessage({
    cmd: event.data.cmd,
    data: event.data.data,
  });
})

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'fetch-stream') return;

  const activeRequests = new Set();

  port.onDisconnect.addListener(() => {
    for (const requestId of activeRequests) {
      sandbox.contentWindow.postMessage({
        cmd: "FetchRequested",
        data: {
          requestId,
          error: "Port disconnected (stream aborted)",
        },
      }, '*');
    }

    activeRequests.clear();
  });

  port.onMessage.addListener(({ cmd, data }) => {
    switch (cmd) {
      case 'fetch-request-start': {
        const { requestId, response, body } = data;
        activeRequests.add(requestId);
        sandbox.contentWindow.postMessage({
          cmd: "FetchRequestedStart",
          data: { requestId, response, body },
        }, '*');
        break;
      }

      case 'fetch-request-chunk': {
        const { requestId, chunk, length, received, done } = data;
        const ab = objectToArrayBuffer(chunk, length);
        sandbox.contentWindow.postMessage({
          cmd: "FetchRequestedChunk",
          data: { requestId, chunk: ab, length: ab.byteLength, received, done: !!done },
        }, '*', [ab]);
        break;
      }

      case 'fetch-request-done': {
        const { requestId, response, received } = data;
        activeRequests.delete(requestId);
        sandbox.contentWindow.postMessage({
          cmd: "FetchRequested",
          data: { requestId, response, done: true, received },
        }, '*');
        break;
      }
    }
  });
});

function oncopy(e) {
  e.preventDefault();
  e.clipboardData.setData(clipboardData.type || 'text/plain', clipboardData.data);
}

function handleClipboardWrite (data) {
  clipboardData.type = data.type;
  clipboardData.data = data.data;
  textarea.focus();
  document.execCommand('copy', false, null);
};