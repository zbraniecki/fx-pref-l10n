var selected_locales = [
  'fr-CH', 'de-CH'
];

var locales = {
  'ar': {'source_name': 'العربية', 'code': 'ar'},
  'cs': {'source_name': 'čeština', 'code': 'cs'},
  'da': {'source_name': 'Dansk', 'code': 'da'},
  'de': {
    'source_name': 'Deutsch',
    'code': 'de',
    'sub': {
      'de-CH': {'source_name': 'Deutsch (Swiss)', 'code': 'de-CH'},
      'de-DE': {'source_name': 'Deutsch (Deutschland)', 'code': 'de-DE'},
    }
  },
  'el': {'source_name': 'Ελληνικά', 'code': 'el'},
  'en': {'source_name': 'English', 'code': 'en'},
  'es': {'source_name': 'Español', 'code': 'es'},
  'fa': {'source_name': 'فارسی', 'code': 'fa'},
  'fr': {
    'source_name': 'français',
    'code': 'fr',
    'sub': {
      'fr-BE': {'source_name': 'français (Belgique)', 'code': 'fr-BE'},
      'fr-CA': {'source_name': 'français (Canadien)', 'code': 'fr-CA'},
      'fr-FR': {'source_name': 'français (France)', 'code': 'fr-FR'},
      'fr-CH': {'source_name': 'français (Swiss)', 'code': 'fr-CH'},
    }
  },
  'hu': {'source_name': 'Magyar', 'code': 'hu'},
  'hy': {'source_name': 'Հայերեն', 'code': 'hy'},
  'it': {'source_name': 'italiano', 'code': 'it'},
  'ja': {'source_name': '日本語', 'code': 'ja'},
  'ko': {'source_name': '한국어', 'code': 'ko'},
  'pl': {'source_name': 'polski', 'code': 'pl'},
  'ru': {'source_name': 'Pyccĸий', 'code': 'ru'},
  'sr-SR': {'source_name': 'Srpski', 'code': 'sr-SR'},
  'sr-Cyrl': {'source_name': 'Српски', 'code': 'sr-Cyrl'},
  'te': {'source_name': 'తెలుగు', 'code': 'te'},
  'th': {'source_name': 'ภาษาไทย', 'code': 'th'},
  'ur': {'source_name': 'اردو', 'code': 'ur'},
  'zh': {'source_name': '中文', 'code': 'zh'},
};

var l10n_names = {
  'en-US': {
    'ar': 'Arabic',
    'cs': 'Czech',
    'de': 'German',
    'el': 'Greek',
    'en': 'English',
    'es': 'Spanish',
    'fa': 'Persian',
    'fr': 'French',
    'hu': 'Hungarian',
    'hy': 'Armenian',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'pl': 'Polish',
    'ru': 'Russian',
    'sr-SR': 'Serbian',
    'sr-Cyrl': 'Serbian',
    'te': 'Telugu',
    'th': 'Thai',
    'ur': 'Urdu',
    'zh': 'Chinese',
  }
}

var filter = "";

function updateSelectedLocales() {
  var rootNode = document.getElementById('sortable-with-handles');

  var childNodes = rootNode.childNodes;

  var new_selected_locales = [];

  for (var i = 0; i < childNodes.length; i++) {
    if (childNodes[i].classList.contains('selected')) {
      new_selected_locales.push(childNodes[i].dataset.code);
    }
  }

  selected_locales = new_selected_locales;
  console.dir(selected_locales);
}

function toggleSelected(e) {
  var elem = e.target;
  var code = elem.parentNode.dataset.code; 

  var pos = selected_locales.indexOf(code);
  if (pos !== -1) {
    delete selected_locales[pos];
  } else {
    selected_locales.push(code);
  }
  drawList();
}

function onSearch(e) {
  var elem = e.target;
  var val = elem.value;

  filter = val;
  drawAvailableList();
}

function findLocale(code, root) {
  if (!root) {
    root = locales;
  }
  if (root[code]) {
    return root[code];
  }
  for (var i in root) {
    var subRoot = root[i];
    if (subRoot.sub) {
      var ret = findLocale(code, subRoot.sub);
      if (ret) {
        return ret;
      }
    }
  }
  return false;
}

function buildRow(locale, sortable, index) {
  if (!index) {
    index = 0;
  }
  var li = document.createElement('li');

  li.dataset.code = locale.code;
  

  if (sortable) {
    li.classList.add('selected');
    var span = document.createElement('span');
    span.classList.add('handle');
    span.textContent = '::';
    li.appendChild(span);
  } else {
    var span = document.createElement('span');
    span.classList.add('pseudo_handle');
    span.innerHTML = "&nbsp;&nbsp;";
    li.appendChild(span);
  }

  var span = document.createElement('span');

  var prefix = '';
  for (var i=0; i < index; i++) {
    prefix += '&nbsp;&nbsp;&nbsp;&nbsp;';
  }
  span.innerHTML = prefix + locale['source_name'];
  li.appendChild(span);

  var checkbox = document.createElement('input');
  checkbox.classList.add('select');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.addEventListener('click', toggleSelected);

  if (sortable) {
    checkbox.setAttribute('checked', 'checkbox');
  }
  li.appendChild(checkbox);
  return li;
}

function buildHR() {
  var li = document.createElement('li');
  li.classList.add('separator');

  return li;
}

function buildDesc(desc) {
  var li = document.createElement('li');
  li.classList.add('desc');
  li.textContent = desc;

  if (desc === 'available:') {
    var search = document.createElement('input');
    search.setAttribute('type', 'text');
    search.classList.add('search');
    search.addEventListener('keyup', onSearch);
    li.appendChild(search);
  }

  return li;
}

function drawLocales(rootNode, locales, index) {
  for(var i in locales) {
    var locale = locales[i];

    if (selected_locales.indexOf(locale.code) !== -1) {
      continue;
    }

    if (filter) {
      var fil = filter.toLowerCase();
      var match = false;

      var source_name = locale.source_name.toLowerCase();
      if (source_name.startsWith(fil)) {
        match = true;
      }

      var code = locale.code.toLowerCase();
      if (code.startsWith(fil)) {
        match = true;
      }

      var l10n_name = l10n_names['en-US'][locale.code];
      if (l10n_name && l10n_name.toLowerCase().startsWith(fil)) {
        match = true;
      }
      if (!match) {
        continue;
      }
    }

    var li = buildRow(locale, false, index);
    rootNode.appendChild(li);

    if (locale.sub) {
      drawLocales(rootNode, locale.sub, index+1);
    }
  }
}

function drawList(id) {
  var rootNode = document.getElementById(id);

  while (rootNode.lastChild) {
    rootNode.removeChild(rootNode.lastChild);
  }

  rootNode.appendChild(buildDesc('selected:'));
  for (var i in selected_locales) {
    var code = selected_locales[i];
    var locale = findLocale(code);
    var li = buildRow(locale, true);
    rootNode.appendChild(li);
  }

  rootNode.appendChild(buildHR());

  rootNode.appendChild(buildDesc('available:'));

  drawLocales(rootNode, locales, 0);


  $('.sortable').sortable({
    handle: 'span',
    items: '.selected',
  });
}

function drawAvailableList() {
  var rootNode = document.getElementById('sortable-with-handles');

  while (rootNode.lastChild &&
         rootNode.lastChild.classList.contains('desc') === false) {
    rootNode.removeChild(rootNode.lastChild);
  }
  drawLocales(rootNode, locales, 0);
}

function updateUI() {
  let matchos = $('#match-os').prop('checked');
  if (matchos) {
    $('#ui-select').addClass('disabled');
  } else {
    $('#ui-select').removeClass('disabled');
  }
}

function updateApp() {
  let matchapp = $('#match-app').prop('checked');
  if (matchapp) {
    $('#web-select').addClass('disabled');
  } else {
    $('#web-select').removeClass('disabled');
  }
}

function main() {
  $('#match-os').prop('checked', true);
  $('#match-os').change(updateUI);
  updateUI();
  $('#match-app').prop('checked', true);
  $('#match-app').change(updateApp);
  updateApp();

  drawList('sortable-with-handles');
  drawList('sortable-with-handles2');

  $('.sortable').sortable({
    handle: 'span',
  }).bind('sortupdate', updateSelectedLocales);
}

