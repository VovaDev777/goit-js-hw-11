import SlimSelect from 'slim-select';

const catSelectList = document.querySelector('.breed-select');
const infoAboutCats = document.querySelector('.cat-info');
const loading = document.querySelector('.loader');
// const error = document.querySelector('.error');

const BASE_URL = 'https://api.thecatapi.com/v1/';
const ENDPOINT = 'breeds';
const API_KEY = 'live_LrsKKVTIbLaP8x5hRvNZgGtzOEJSHy0wuAgxvckTv8KCqqb49gnQkiqK0c8H1h3L';


function getCatsBreed () {
    return fetch(`${BASE_URL}${ENDPOINT}?api_key${API_KEY}`)
    .then((resp) => {
        if(!resp.ok) {
            throw new Error(resp.statusText);
        } 
        return resp.json();
    })
}


loading.classList.remove('visible'); 
getCatsBreed()
    .then((data) => catSelectList.insertAdjacentHTML('beforeend', createCatsList(data)))
    // .then((data) => console.log(data))
    .catch((err) => console.log(err))


function createCatsList (arr) {
    return arr.map(({name, id}) => `<option value="${id}">${name}</option>`).join()
}

catSelectList.addEventListener('change', findBreed);




function findBreed () {
    let selectedValue = catSelectList.value;
    // console.log(selectedValue);
    fetch(`${BASE_URL}${ENDPOINT}/${selectedValue}?api_key=${API_KEY}`)
    .then((resp) => {
        if (!resp.ok) {
            throw new Error(resp.statusText);
        }
        return resp.json();
    })
    .then((breedInfo) => {
        return fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${selectedValue}`)
            .then((resp) => {
                if (!resp.ok) {
                    throw new Error(resp.statusText);
                }
                return resp.json();
            })
            .then((imageData) => {
                displayBreedInfo(breedInfo, imageData[0]);
            });
    })
    .catch((err) => console.log(err));
}

function displayBreedInfo(breedInfo, imageData) {
    const { name, description, temperament } = breedInfo;
    const imageUrl = imageData.url;

    infoAboutCats.innerHTML = `
        <img class="cat-img" src="${imageUrl}" alt="${name}" height="500" width="600">
        <div class="info">
        <h2 class="cat-name">${name}</h2>
        <p class= "cat-description">${description}</p>
        <p class="cat-temp"><span class="temperament">Temperament:</span> ${temperament}</p>
        </div>
    `;
}

