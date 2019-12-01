

function clickShadowRoot(shadowTarget, target) {
  const widget = document.querySelector(shadowTarget);

  if (!widget || !widget.shadowRoot) {
    return false;
  }

  const shadowObj = widget.shadowRoot.querySelector(target);

  if (shadowObj) {
    shadowObj.click();
    return true;
  }

  return false;
}



// Waits
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForNet(page, idle) {
  //const client = await page.target().createCDPSession();

  const client = page._client;
  let resolve = null;
  const p = new Promise((r) => resolve = r);

  let tid = null;

  client.send('Network.enable');
  client.on('Network.loadingFinished', restartTimer);

  const networkManager = page._frameManager.networkManager();

  function restartTimer() {
    if (tid) { clearTimeout(tid); }
    //console.log(networkManager._requestIdToRequest.size);
    tid = setTimeout(() => { 
      resolve();
      clearTimeout(tid);
    }, idle); 
  };

  restartTimer();
  return p;
}


async function waitForClick(frame, selector, timeout = 30000) {
  await frame.waitForSelector(selector, {timeout: timeout});
  await frame.click(selector);
}
  

async function waitForFrame(page, inx, timeout = 3000) {
  if (!await waitForPredicate(timeout, () => { return page.frames().length > inx })) {
    return false;
  }

  return page.frames()[inx];
}


async function waitForPredicate(ms, predicate) {
  const startTime = new Date().getTime();

  while (true) {
    if (predicate()) {
      return true;
    }

    await sleep(500);

    if ((new Date().getTime() - startTime) >= ms) {
      return false;
    }
  }
}

module.exports = {
  clickShadowRoot: clickShadowRoot,
  sleep: sleep,
  waitForNet: waitForNet,
  waitForClick: waitForClick,
  waitForFrame: waitForFrame,
  waitForPredicate: waitForPredicate
};
