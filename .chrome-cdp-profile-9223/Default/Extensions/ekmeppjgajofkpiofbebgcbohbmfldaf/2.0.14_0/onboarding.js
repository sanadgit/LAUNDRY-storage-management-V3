const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

const MEASUREMENT_ID = "G-E2R0CQE2QJ";
const API_SECRET = "hha7t-hpRUmp113bzRc3MA";

const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;

const SESSION_EXPIRATION_IN_MIN = 30;

class Analytics {
  constructor(debug = false) {
    this.debug = debug;
  }

  async getOrCreateClientId() {
    let { uuid } = await chrome.storage.local.get("uuid");
    if (!uuid) {
      uuid = this.generateUuid();
      await chrome.storage.local.set({ uuid });
    }
    return uuid;
  }

  generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

    async getOrCreateSessionId() {
      let { sessionData } = await chrome.storage.local.get('sessionData');
      const currentTimeInMs = Date.now();
      if (sessionData && sessionData.timestamp) {
        const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
        if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
          sessionData = null;
        } else {
          sessionData.timestamp = currentTimeInMs;
          await chrome.storage.local.set({ sessionData });
        }
      }
      if (!sessionData) {
        sessionData = {
          session_id: currentTimeInMs.toString(),
          timestamp: currentTimeInMs.toString(),
        };
        await chrome.storage.local.set({ sessionData });
      }
      return sessionData.session_id;
    }


  async fireEvent(name, params = {}) {
    if (!params.session_id) {
      params.session_id = await this.getOrCreateSessionId();
    }
    if (!params.engagement_time_msec) {
      params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC;
    }

    try {
      const baseUrl = this.debug ? GA_DEBUG_ENDPOINT : GA_ENDPOINT;
      const response = await fetch(`${baseUrl}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
        method: "POST",
        body: JSON.stringify({
          client_id: await this.getOrCreateClientId(),
          events: [
            {
              name,
              params: {
                session_id: await this.getOrCreateSessionId(),
                engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_MSEC,
                ...params,
              },
            },
          ],
        }),
      });
      if (!this.debug) {
        return;
      }
      console.log(await response.text());
    } catch (e) {
      console.error("Google Analytics request failed with an exception", e);
    }
  }

  async firePageViewEvent(pageTitle, pageLocation, additionalParams = {}) {
    return this.fireEvent("page_view", {
      page_title: pageTitle,
      page_location: pageLocation,
      ...additionalParams,
    });
  }

  async fireErrorEvent(error, additionalParams = {}) {
    return this.fireEvent("extension_error", {
      ...error,
      ...additionalParams,
    });
  }
}

async function init () {
  const { lastDevModeBannerShown } = await chrome.storage.local.get("lastDevModeBannerShown")
  let oneDayPassed = false;
  if (!lastDevModeBannerShown) {
    await chrome.storage.local.set({ lastDevModeBannerShown: Date.now() });
    oneDayPassed = true;      
  } else {
    oneDayPassed = Date.now() - lastDevModeBannerShown > 86400000;
  }

  const isUserScriptsAvailable = await chrome.runtime.sendMessage({cmd: 'CheckIfUserScriptsAvailable'})
  if(!isUserScriptsAvailable.data && oneDayPassed) {
    new Analytics().fireEvent("show_devmode_popup")
    addDevModeBanner();
    await chrome.storage.local.set({ lastDevModeBannerShown: Date.now() })
  }
}
init();

function addDevModeBanner() {
    let version = Number(navigator.userAgent.match(/(Chrome|Chromium)\/([0-9]+)/)?.[2]);
    let titleAddition = '';
    let textAddition = '';

    if (version >= 138) {
      titleAddition = ' and allow user scripts';
      textAddition = ' To allow user scripts, click the Details button for OrangeMonkey and then enable the Allow User Scripts toggle.';
    }

    const notificationElement = document.createElement('div');
    notificationElement.innerHTML = `
      <div id="ch-onboarding" class="ch-notification">
        <img class="ch-logo" alt="OrangeMonkey Logo" src="data:image/png;base64,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">
        <div class="ch-content">
          <h3 class="ch-header">Please enable permissions. Otherwise SaveFrom.net Helper script will not work.</h3>
          <p class="ch-text">To enable it, open chrome://extensions/ in a new tab and enable Developer mode. To allow User Scripts click ‘Details’ under OrangeMonkey and then turn on ‘Allow User Scripts’ toggle.</p>
          <p class="ch-text">To finish setup, please restart the extension (turn off and on) or restart the browser.</p>
        </div>
        <svg class="ch-close" id="ch-close" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <style>
        #ch-onboarding.ch-notification {
          position: fixed;
          top: 10px;
          right: 80px;
          display: flex;
          background-color: white;
          border-radius: 12px;
          z-index: 10000;
          padding: 20px;
          border: 1px solid #bababa;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }
        #ch-onboarding .ch-logo {
          margin-right: 20px;
          width: 44px;
          height: 44px;
        }
        #ch-onboarding .ch-content {
          max-width: 330px;
        }
        #ch-onboarding .ch-header {
          font-family: Inter;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.2;
          text-align: left;
          margin: 0 !important;
          color: black;
        }
        #ch-onboarding .ch-text {
          font-family: Inter;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.2;
          text-align: left;
          margin: 16px 0;
          color: black;
        }
        #ch-onboarding .ch-sf {
          font-weight: bold;
        }
        #ch-onboarding .ch-link {
          display: inline-block;
          padding: 6px 20px 6px 20px;
          border-radius: 20px;
          font-family: Roboto;
          font-size: 18px;
          font-weight: 500;
          line-height: 1.2;
          text-align: center;
          background-color: #0957D0;
          color: white !important;
          text-decoration: none;
        }
        #ch-onboarding .ch-close {
          margin-left: 20px;
          cursor: pointer;
          width: 24px;
          height: 24px;
        }
      </style>
    `;
    const body = document.body || document.documentElement;
    body.appendChild(notificationElement);
    document.getElementById('ch-close').onclick = () => {
      notificationElement.remove();
      new Analytics().fireEvent("close_devmode_popup")
    }
    document.getElementById('ch-extension-manager').onclick = () => {
      navigator.clipboard.writeText('chrome://extensions/')
    }
  }