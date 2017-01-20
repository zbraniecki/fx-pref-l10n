{

  const downloading = {};

  const l10nRegistryData = {
    available: ['ar', 'cs', 'da', 'de', 'es', 'en', 'fa', 'fr'],
    downloaded: ['de', 'es', 'en'],
  };

  const localeList = {
    'ar': {
      name: 'العربية'
    },
    'cs': {
      name: 'čeština',
    },
    'da': {
      name: 'Dansk'
    },
    'de': {
      name: 'Deutsch'
    },
    'el': {
      name: 'Ελληνικά'
    },
    'en': {
      name: 'English'
    },
    'es': {
      name: 'Español'
    },
    'fa': {
      name: 'فارسی'
    },
    'fr': {
      name: 'français'
    },
  };

  const initialSetup = {
    system: {
      ui: {
        selected: ['en'],
        available: Object.keys(localeList)
      }
    },
    app: {
      ui: {
        follow: true,
        selected: [],
        available: Object.keys(localeList)
      },
      content: {
        follow: true,
        selected: [],
        available: Object.keys(localeList)
      }
    }
  }

  const setup = {
    system: {
      ui: {
        selectedSortable: null,
        availableSortable: null,
        selected: [],
        available: []
      }
    },
    app: {
      ui: {
        selectedSortable: null,
        availableSortable: null,
        follow: true,
        selected: [],
        available: []
      },
      content: {
        selectedSortable: null,
        availableSortable: null,
        follow: true,
        selected: [],
        available: []
      }
    }
  }

  function download(code) {
    if (downloading.hasOwnProperty(code)) {
      return false;
    }
    if (l10nRegistryData.downloaded.includes(code)) {
      return false;
    };


    downloading[code] = 0;

    let I = setInterval(function() {
      let list = document.querySelectorAll('#app > .languages .ui .selected li');

      let elem = null;
      for (let li of list) {
        if (li.dataset.code === code) {
          elem = li;
        }
      }

      if (!elem) {
        return false;
      }


      let lvl = downloading[code] += 10;
      elem.querySelector('.download').textContent = `[⇩${lvl}%]`;

      if (lvl === 100) {
        I = clearInterval(I);
        l10nRegistryData.downloaded.push(code);
        delete downloading[code];
        elem.removeChild(elem.querySelector('.download'));
      }
    }, 300);
  }

  function getSelectedLocale(name, col) {
    let locales = getSelectedLocales(name, col);
    return locales[0];
  }

  function getSelectedLocales(name, col) {
    if (name === 'system') {
      return setup[name][col].selected.slice();
    }

    if (name === 'app' && col === 'ui') {
      if (setup[name][col].follow) {
        return getSelectedLocales('system', 'ui');
      } else {
        return setup.app.ui.selected.slice();
      }
    }

    if (name === 'app' && col === 'content') {
      if (setup[name][col].follow) {
        return getSelectedLocales('app', 'ui');
      } else {
        return setup.app.content.selected.slice();
      }
    }
  }

  function buildRow(loc, code, os = false, download = false, unavailable = false) {
    const li = document.createElement('li');
    const div = document.createElement('div');
    li.appendChild(div);

    const span = document.createElement('span');
    span.textContent = loc.name;
    span.classList.add('name');
    li.appendChild(span);

    if (os) {
      const span = document.createElement('span');
      span.classList.add('info');
      span.textContent = '[OS]';
      span.title = 'System Locale, cannot be removed';
      li.appendChild(span);
    }

    if (download) {
      const span = document.createElement('span');
      span.classList.add('info');
      span.classList.add('download');
      span.textContent = '[⇩]';
      span.title = 'Locale available for download';
      li.appendChild(span);
    }

    if (unavailable) {
      const span = document.createElement('span');
      span.classList.add('info');
      span.textContent = '[❌]';
      span.title = 'Locale unavailable';
      li.appendChild(span);
    }

    li.dataset.code = code;
    return li;
  }

  function drawList(name, col, type, locales) {
    let list = document.querySelector(`#${name} > .languages .${col} .${type} > ul`);
    while (list.lastChild) {
      list.removeChild(list.lastChild);
    }

    let systemLocale = getSelectedLocale('system', 'ui');
    for (const code of locales) {
      const loc = localeList[code]; 
      if (!l10nRegistryData.downloaded.includes(code) &&
        l10nRegistryData.available.includes(code)) {
        download(code);
      }
      var li = buildRow(
        loc,
        code,
        name === 'app' && col === 'ui' && code === systemLocale,
        name === 'app' && col === 'ui' && !l10nRegistryData.downloaded.includes(code) && l10nRegistryData.available.includes(code),
        name === 'app' && col === 'ui' && !l10nRegistryData.available.includes(code)
      );
      list.appendChild(li);
    }
  }

  function onListUpdated(name, col) {
    let result = [];

    let elem = document.querySelector(`#${name} .languages .${col} .selected .locale-list`);
    for (let li of elem.querySelectorAll('li')) {
      result.push(li.dataset.code);
    }
    setup[name][col].selected = result;

    updateList(name, col, result);
  }

  function updateList(name, col, result) {
    setup[name][col].selected = result;
    drawCol(name, col);

    if (name === 'system' && col === 'ui') {
      if (setup.app.ui.follow) {
        updateList('app', 'ui', result);
      } else {
        drawCol('app', 'ui');
        drawCol('app', 'content');
      }
    }
    if (name === 'app' && col === 'ui') {
      if (setup.app.content.follow) {
        updateList('app', 'content', result);
      } else {
        drawCol('app', 'content');
      }
    }
  }

  function filter(list, term) {
    for (let el of list.querySelectorAll('li')) {
      if (!el.childNodes[1].textContent.toLowerCase().includes(term.toLowerCase())) {
        el.classList.add('hidden');
      } else {
        el.classList.remove('hidden');
      }
    }
  }

  function drawCol(name, col) {
    let selectedLocales = getSelectedLocales(name, col);

    let availableLocales = setup[name][col].available.filter(loc => {
      return !selectedLocales.includes(loc);
    });
    drawList(name, col, 'available', availableLocales);
    drawList(name, col, 'selected', selectedLocales);
  }

  function setupList(name, col) {
    setup[name][col].selected = initialSetup[name][col].selected.slice();
    setup[name][col].available = initialSetup[name][col].available.slice();


    let availableList = document.querySelector(`#${name} > .languages .${col} .available > ul`);
    let selectedList = document.querySelector(`#${name} > .languages .${col} .selected > ul`);
    
    setup[name][col].availableSortable = Sortable.create(availableList, {
      group: `${name}-${col}-locales`,
      sort: false,
      onMove: function(evt) {
        if (name === 'app' && col === 'ui') {
          let item = evt.dragged;

          if (!l10nRegistryData.available.includes(item.dataset.code)) {
            return false;
          }
        }
      },
    });

    setup[name][col].selectedSortable = Sortable.create(selectedList, {
      group: {
        name: `${name}-${col}-locales`,
        put: true,
        pull: function(to, from) {
          return from.el.children.length > 1;

        },
      },
      onSort: function(evt) {
        if (name === 'app' && col === 'ui') {
          if (evt.newIndex === 0) {
            let val = confirm(`
You're about to change your locale.\nIf this was not your intention press "Cancel".\n
Jezeli chcesz zmienic jezyk, nacisnij "OK".`);

            if (val === false) {
            }
          }
        }
        onListUpdated(name, col, evt.target);
      },
      onMove: function(evt) {
        if (name === 'app' && col === 'ui') {
          let item = evt.dragged;
          let systemLocale = getSelectedLocale('system', 'ui');
          if (item.dataset.code === systemLocale) {
            return false;
          }
        }
      },
    });

    drawCol(name, col);

    let input = document.querySelector(`#${name} > .languages .${col} .available input`);
    input.addEventListener('keyup', function(evt) {
      let term = input.value;
      let list = document.querySelector(`#${name} > .languages .${col} .available > ul`);
      filter(list, term);
    });

    let follow = document.querySelector(`#${name} > .languages .${col} .follow`);

    if (follow) {
      setup[name][col].follow = initialSetup[name][col].follow;
      setFollowStatus(name, col);

      let input = document.querySelector(`#${name} > .languages .${col} .follow input`);
      input.addEventListener('change', function(evt) {
        if (input.checked) {
          setup[name][col].follow = true;
          setFollowStatus(name, col);
          onListUpdated(name, col);
        } else {
          setup[name][col].follow = false;
          setFollowStatus(name, col);
        }
      });
    }
  }


  function setFollowStatus(name, col) {
    let input = document.querySelector(`#${name} > .languages .${col} .follow input`);
    let colNode = document.querySelector(`#${name} > .languages .${col}`);
    if (setup[name][col].follow) {
      colNode.classList.add('follow');
      input.checked = true;
      setup[name][col].selectedSortable.option('disabled', true);
      setup[name][col].availableSortable.option('disabled', true);
    } else {
      colNode.classList.remove('follow');
      input.checked = false;
      setup[name][col].selectedSortable.option('disabled', false);
      setup[name][col].availableSortable.option('disabled', false);
      if (name === 'app' && col === 'ui') {
        setup.app.ui.selected = getSelectedLocales('system', 'ui');
      }
      if (name === 'app' && col === 'content') {
        setup.app.content.selected = getSelectedLocales('app', 'ui');
      }
    }
  }


  function main() {
    setupList('system', 'ui');
    setupList('app', 'ui');
    setupList('app', 'content');
  }
}
