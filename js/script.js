const API_KEY = '6262c533438d4463b56fae29f89e57f8';
const choicesElem = document.querySelector('.js-choice');
const newsList = document.querySelector('.news-list');
const formSearch = document.querySelector('.form-search');
const title = document.querySelector('.title');
const choices = new Choices(choicesElem, {
    searchEnabled: false,
    itemSelectText: ''
});

const getdata = async (url) => {
    const response = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY,
        }
    });

    const data = await response.json();

    return data;
};

const getDateCorrectFormat = isoData => {

    const data = new Date(isoData);
    const fullDate = data.toLocaleString('en-GB', {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    const fullTime = data.toLocaleString('en-GB', {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `<span class="news-date">${fullDate}</span> ${fullTime}`;

};

const getImage = url => new Promise((resolve, reject) => {
    const image = new Image(270, 200);

    image.addEventListener('load', () => {
        resolve(image);
    });

    image.addEventListener('error', () => {
        image.src = 'jpg/no-photo.jpg';
        reject(image);
    });

    image.src = url || 'jpg/no-photo.jpg';
    image.className = 'news-img';

    return image;

});


const renderCard = (data) => {
    newsList.textContent = '';
    data.forEach(async ({ urlToImage, url, title, description, publishedAt, author }) => {
        const card = document.createElement('li');
        card.className = 'news-item';

        const image = await getImage(urlToImage);
        image.alt = title;
        card.append(image);

        card.insertAdjacentHTML('beforeend', `
        <a href="${url}" class="news-link" target="_blank">${title || ""}</a>
        </h3>
        <p class="news-descr">${description || ""}</p>
        <div class="news-footer">
            <time class="news-datetime" datetime="${publishedAt}">
                ${getDateCorrectFormat(publishedAt)}
            </time>
            <div class="news-author">${author || ""}</div>
        </div>`);

        newsList.append(card);
    });
};

const loadNews = async () => {
    newsList.innerHTML = '<li class="preload"></li>';
    const country = localStorage.getItem('country') || 'ru';
    choices.setChoiceByValue(country);
    title.classList.add('hide');

    const data = await getdata(`https://newsapi.org/v2/top-headlines?country=${country}&pageSize=100`);
    renderCard(data.articles);
};

const loadSearch = async value => {

    const data = await getdata(`https://newsapi.org/v2/everything?q=${value}`);
    title.classList.remove('hide');
    title.textContent = `По вашему запросу “${value}” найдено ${data.articles.length} результатов`;
    choices.setChoiceByValue('');
    renderCard(data.articles);
};
choicesElem.addEventListener('change', (event) => {
    const value = event.detail.value;
    loadNews(value);
    localStorage.setItem('country', value);
    loadNews();

});

formSearch.addEventListener('submit', event => {
    event.preventDefault();
    loadSearch(formSearch.search.value);
    formSearch.reset();
});

loadNews();