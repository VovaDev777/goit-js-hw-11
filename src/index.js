import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const axios = require('axios').default;

const refs = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
  };

const API_KEY = '40423678-d168429128686f2691e5973ea';
const BASE_URL = 'https://pixabay.com/api/';

class ApiPixabay {
    constructor() {
      this.searchQuery = '';
      this.page = 1;
      this.totalPage = null;
    }
  
    async fetchImages() {
      const url = `${BASE_URL}?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&safesearch=true&orientation=horizontal&per_page=40&page=${this.page}`;
      return await axios.get(url);
    }
  
    get query() {
      return this.searchQuery;
    }
  
    set query(newQuery) {
      this.searchQuery = newQuery;
    }
    incrementPage() {
      this.page += 1;
    }
  }

const apiPixabay = new ApiPixabay();

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);
const lightbox = new SimpleLightbox('.gallery a', { captionDelay: 250 });

async function onSearch(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  apiPixabay.page = 1;
  apiPixabay.query = e.currentTarget.elements.searchQuery.value;
  if (!apiPixabay.query) {
    onError('Write the value');
    return;
  }

  try {
    refs.loadMoreBtn.classList.add('hidden');
    const card = await getData();
    if (card.totalHits === 0) {
      onError(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (card.hits.length < 40) {
      renderMarkup(card.hits);
      onResultNotify(card.totalHits);
      lightbox.refresh();
      return;
    }
    refs.loadMoreBtn.classList.remove('hidden');
    renderMarkup(card.hits);
    onResultNotify(card.totalHits);
    lightbox.refresh();
  } catch (err) {
    console.log(err);
  }
}

async function getData() {
  const response = await apiPixabay.fetchImages();
  const res = await response.data;
  return res;
}

async function onLoadMore() {
  apiPixabay.incrementPage();
  try {
    const card = await getData();
    apiPixabay.totalPage = Math.ceil(card.totalHits / 40);
    renderMarkup(card.hits);
    smoothScroll();
    if (apiPixabay.totalPage === apiPixabay.page) {
      onEndCollection();
      refs.loadMoreBtn.classList.add('hidden');
    }
  } catch (err) {
    console.log(err);
  }
  lightbox.refresh();
}

function onError(message) {
  return Notify.failure(message);
}

function onResultNotify(total) {
  return Notify.success(`Hooray! We found ${total} images.`);
}

function onEndCollection() {
  return Notify.success(
    `"We're sorry, but you've reached the end of search results."`
  );
}

// ------------------------MARKUP----------------

function renderMarkup(data) {
    const markup = data
      .map(image => {
        const {
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        } = image;
        return `<div class="photo-card">
        <a href="${largeImageURL}" class='large-image'><img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="200"/></a>
      <div class="info">
        <p class="info-item">
         <b>Likes</b>
          <span>${likes}</span>
        </p>
        <p class="info-item">
        <b>Views</b>
          <span>${views}</span>
        </p>
        <p class="info-item">
        <b>Comments</b>
          <span>${comments}</span>
        </p>
        <p class="info-item">
        <b>Downloads</b>
          <span>${downloads}</span>
        </p>
      </div>
    </div>`;
      })
      .join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);
  }

 