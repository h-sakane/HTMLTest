// JSONデータを外部ファイルから読み込む関数
async function fetchData() {
  const response = await fetch('data.json'); // JSONファイルのパスを指定
  const data = await response.json();
  return data;
}

async function initialize() {
  const data = await fetchData();
  displayData(data);
  document.getElementById('add-filter').addEventListener('click', () => addFilter(data));
}

let currentSortColumn = '';
let currentSortOrder = 'none';
let columnsVisible = false;

function sortTable(column) {
  const tableBody = document.getElementById('book-table').getElementsByTagName('tbody')[0];
  const rows = Array.from(tableBody.rows);
  let sortOrder = 'asc';

  if (currentSortColumn === column) {
    sortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
  }

  rows.sort((a, b) => {
    const aText = a.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent;
    const bText = b.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent;

    if (column === 'year') {
      return sortOrder === 'asc' ? new Date(aText) - new Date(bText) : new Date(bText) - new Date(aText);
    } else {
      return sortOrder === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
    }
  });

  tableBody.innerHTML = '';
  rows.forEach(row => tableBody.appendChild(row));

  currentSortColumn = column;
  currentSortOrder = sortOrder;

  updateSortIcons(column, sortOrder);
}

function getColumnIndex(column) {
  const columns = ['year', 'title', 'author', 'genre', 'location', 'publisher', 'url'];
  return columns.indexOf(column) + 1;
}

function updateSortIcons(column, sortOrder) {
  const headers = document.querySelectorAll('th[data-column]');
  headers.forEach(header => {
    const icon = header.querySelector('.sort-icon');
    if (header.getAttribute('data-column') === column) {
      header.textContent = header.textContent.replace(/▲|▼/g, '') + (sortOrder === 'asc' ? ' ▲' : ' ▼');
    } else {
      header.textContent = header.textContent.replace(/▲|▼/g, '');
    }
  });
}

function displayData(data) {
  const tableBody = document.getElementById('book-table').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';
  data.forEach(book => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = book.year;
    row.insertCell(1).textContent = book.title;
    row.insertCell(2).textContent = book.author;
    row.insertCell(3).textContent = book.genre;
    const locationCell = row.insertCell(4);
    locationCell.textContent = book.location;
    locationCell.classList.add('collapsible');
    const publisherCell = row.insertCell(5);
    book.publisher.forEach(publisher => {
      const img = document.createElement('img');
      img.src = `images/${publisher}.png`; // 画像のパスを指定
      img.alt = publisher;
      img.title = publisher; // マウスオーバー時に表示される要素名
      img.classList.add('publisher-image');
      publisherCell.appendChild(img);
    });
    publisherCell.classList.add('collapsible');
    const urlCell = row.insertCell(6);
    const link = document.createElement('a');
    link.href = book.url;
    link.textContent = book.title;
    link.target = '_blank'; // 新しいタブで開く
    urlCell.appendChild(link);
    urlCell.classList.add('collapsible');
  });

  // 検索結果の件数を表示
  document.getElementById('result-count').textContent = `合計: ${data.length} 件`;

  // 初期状態で「collapsible」クラスを持つ要素を非表示に設定
  if (!columnsVisible) {
    const collapsibleElements = document.querySelectorAll('.collapsible');
    collapsibleElements.forEach(element => {
      element.style.display = 'none';
    });
  }
}

function toggleColumns() {
  columnsVisible = !columnsVisible;
  const columns = document.querySelectorAll('.collapsible');
  columns.forEach(column => {
    column.style.display = columnsVisible ? 'table-cell' : 'none';
  });
  const button = document.getElementById('toggle-button');
  button.textContent = columnsVisible ? '折り畳む' : '詳細を表示';
}

function updateFilterLabel(filterElement, defaultLabel) {
  const selectedValues = Array.from(filterElement.querySelectorAll('input:checked')).map(cb => cb.value);
  filterElement.previousElementSibling.textContent = selectedValues.length ? `[${selectedValues.join(', ')}]` : `[${defaultLabel}]`;
}

function populateFilters(container, data) {
  const genreFilter = container.querySelector('.filter-genre');
  const locationFilter = container.querySelector('.filter-location');
  const publisherFilter = container.querySelector('.filter-publisher');
  const genres = [...new Set(data.map(book => book.genre))];
  const locations = [...new Set(data.map(book => book.location))];
  const publishers = [...new Set(data.flatMap(book => book.publisher))];

  genres.forEach(genre => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = genre;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(genre));
    genreFilter.appendChild(label);
  });

  locations.forEach(location => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = location;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(location));
    locationFilter.appendChild(label);
  });

  publishers.forEach(publisher => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = publisher;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(publisher));
    publisherFilter.appendChild(label);
  });

  genreFilter.addEventListener('change', () => updateFilterLabel(genreFilter, 'ジャンル'));
  locationFilter.addEventListener('change', () => updateFilterLabel(locationFilter, '所在地'));
  publisherFilter.addEventListener('change', () => updateFilterLabel(publisherFilter, '出版社'));
}

function addFilter(data) {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-filter';
  removeButton.textContent = '−';
  removeButton.addEventListener('click', () => {
    filterContainer.remove();
    filterData(data);
  });
  filterContainer.appendChild(removeButton);

  const filterTypeSelect = document.createElement('select');
  filterTypeSelect.className = 'filter-type';
  filterTypeSelect.innerHTML = `
    <option value="" selected>選択してください</option>
    <option value="search-text">文字列検索</option>
    <option value="filter-genre">ジャンル</option>
    <option value="filter-location">所在地</option>
    <option value="filter-publisher">出版社</option>
  `;
  filterContainer.appendChild(filterTypeSelect);

  const searchTextContainer = document.createElement('div');
  searchTextContainer.className = 'filter-option search-text-container';
  searchTextContainer.style.display = 'none'; // 初期状態で非表示
  searchTextContainer.innerHTML = `
    <label for="search-text">検索:</label>
    <input type="text" class="search-text" placeholder="タイトルや著者で検索">
  `;
  filterContainer.appendChild(searchTextContainer);

  const genreFilterContainer = document.createElement('div');
  genreFilterContainer.className = 'filter-option filter-genre-container dropdown';
  genreFilterContainer.style.display = 'none'; // 初期状態で非表示
  genreFilterContainer.innerHTML = `
    <label for="filter-genre">[ジャンル]</label>
    <div class="dropdown-content filter-genre"></div>
  `;
  filterContainer.appendChild(genreFilterContainer);

  const locationFilterContainer = document.createElement('div');
  locationFilterContainer.className = 'filter-option filter-location-container dropdown';
  locationFilterContainer.style.display = 'none'; // 初期状態で非表示
  locationFilterContainer.innerHTML = `
    <label for="filter-location">[所在地]</label>
    <div class="dropdown-content filter-location"></div>
  `;
  filterContainer.appendChild(locationFilterContainer);

  const publisherFilterContainer = document.createElement('div');
  publisherFilterContainer.className = 'filter-option filter-publisher-container dropdown';
  publisherFilterContainer.style.display = 'none'; // 初期状態で非表示
  publisherFilterContainer.innerHTML = `
    <label for="filter-publisher">[出版社]</label>
    <div class="dropdown-content filter-publisher"></div>
  `;
  filterContainer.appendChild(publisherFilterContainer);

  document.getElementById('filters').appendChild(filterContainer);

  filterTypeSelect.addEventListener('change', () => {
    filterContainer.querySelectorAll('.filter-option').forEach(option => option.style.display = 'none');
    if (filterTypeSelect.value) {
      filterContainer.querySelector(`.${filterTypeSelect.value}-container`).style.display = 'block';
    }
    filterData(data);
  });

  filterContainer.querySelector('.search-text').addEventListener('input', () => filterData(data));
  filterContainer.querySelector('.filter-genre').addEventListener('change', () => filterData(data));
  filterContainer.querySelector('.filter-location').addEventListener('change', () => filterData(data));
  filterContainer.querySelector('.filter-publisher').addEventListener('change', () => filterData(data));

  populateFilters(filterContainer, data);
}

function filterData(data) {
  const filterContainers = document.querySelectorAll('.filter-container');
  let filteredData = data;

  filterContainers.forEach(container => {
    const filterType = container.querySelector('.filter-type').value;
    const searchText = container.querySelector('.search-text')?.value.toLowerCase() || '';
    const genreFilters = Array.from(container.querySelectorAll('.filter-genre input:checked')).map(cb => cb.value);
    const locationFilters = Array.from(container.querySelectorAll('.filter-location input:checked')).map(cb => cb.value);
    const publisherFilters = Array.from(container.querySelectorAll('.filter-publisher input:checked')).map(cb => cb.value);

    filteredData = filteredData.filter(book => {
      const matchesSearchText = filterType === 'search-text' ? (book.title.toLowerCase().includes(searchText) || book.author.toLowerCase().includes(searchText)) : true;
      const matchesGenre = filterType === 'filter-genre' ? (genreFilters.length === 0 || genreFilters.includes(book.genre)) : true;
      const matchesLocation = filterType === 'filter-location' ? (locationFilters.length === 0 || locationFilters.includes(book.location)) : true;
      const matchesPublisher = filterType === 'filter-publisher' ? (publisherFilters.length === 0 || publisherFilters.some(publisher => book.publisher.includes(publisher))) : true;
      return matchesSearchText && matchesGenre && matchesLocation && matchesPublisher;
    });
  });

  displayData(filteredData);
  
  // 検索結果の件数を表示
  document.getElementById('result-count').textContent = `検索結果: ${filteredData.length} 件`;

  // フィルタリング後も表示状態を保持
  if (columnsVisible) {
    const collapsibleElements = document.querySelectorAll('.collapsible');
    collapsibleElements.forEach(element => {
      element.style.display = 'table-cell';
    });
  }
}

window.onload = async function() {
  const data = await fetchData();
  data.sort((a, b) => new Date(b.year) - new Date(a.year)); // 初期表示を降順にソート
  displayData(data);
  currentSortColumn = 'year';
  currentSortOrder = 'desc';
  updateSortIcons('year', 'desc');
  document.getElementById('add-filter').addEventListener('click', () => addFilter(data));
  document.getElementById('toggle-button').addEventListener('click', toggleColumns);

  // 初期状態で「collapsible」クラスを持つ要素を非表示に設定
  const collapsibleElements = document.querySelectorAll('.collapsible');
  collapsibleElements.forEach(element => {
    element.style.display = 'none';
  });
};