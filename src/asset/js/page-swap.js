(() => {
  function initComponents() {
    window.initSelects?.();
    window.initMultiSelect?.();
    window.initPhoneHints?.();
    window.initSteppers?.();
    window.initDatePickers?.();
  }

  function replacePage(html, push, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newHeader = doc.querySelector('header');
    const newMain = doc.querySelector('main');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (!newHeader || !newMain || !header || !main) {
      if (url) window.location.assign(url);
      return;
    }
    header.replaceWith(newHeader);
    main.replaceWith(newMain);
    document.title = doc.title;
    if (push && url) history.pushState({}, '', url);
    initComponents();
    window.tablePage?.init();
    window.usersPage?.init();
    window.eventPage?.init();
    window.profilePage?.init();
    window.formPage?.init();
    window.scrollTo({ top: 0 });
  }

  async function swapPage(url, push = true) {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } });
    replacePage(await response.text(), push, url);
  }

  window.pageSwap = { replacePage, swapPage };
})();
