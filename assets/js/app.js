document.addEventListener('DOMContentLoaded', () => {


    /*******************************************************************************************************************
     * Déclaration des variables
    *******************************************************************************************************************/

    // Déclaration pour la page d'identification
    const formLogin = document.querySelector('.form-login');
    const formRegister = document.querySelector('.form-register');
    const registerEmail = document.querySelector('#registerEmail');
    const registerPw = document.querySelector('#registerPw');
    const registerPseudo = document.querySelector('#registerPseudo');
    const loginEmail = document.querySelector('#loginEmail');
    const loginPw = document.querySelector('#loginPw');

    // Déclaration pour la page d'accueil
    const searchData = document.querySelector('[name="searchData"]');
    const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';
    const favoriteSection = document.querySelector(".section-favorites");
    const favoriteContainer = document.querySelector(".section-favorites .container");
    const moviePopin = document.querySelector('#moviePopin article');
    const movieList = document.querySelector('#movieList');
    let userId, favorites = [];


    /*******************************************************************************************************************
     * Déclaration des fonctions
     *******************************************************************************************************************/

    /**
     * Vérifier si l'utilisateur est connecté
     * @returns {boolean}
     */
    const checkLastSession = () => {
        const lastSessionObject = sessionStorage.getItem("appFilm");
        const lastSession = JSON.parse(lastSessionObject);
        return !!lastSession
    };

    /**
     * Tester l'inscription de l'utilisateur
     * @param email
     * @param password
     * @param pseudo
     */
    const register = (email, password, pseudo) => {
        const data = {
            email: email,
            password: password,
            pseudo: pseudo
        };
        fetch( 'https://api.dwsapp.io/api/register', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then( apiResponse => {
            if( apiResponse.ok ){
                return apiResponse.json();
            }
            else {
                console.error(apiResponse.statusText);
            }
        })
            .then( jsonData => {
                console.log(jsonData);
                updateLocalStorage(jsonData.data.identity['_id'], email, password, pseudo);
                window.location.href = 'index.html';
            })
            .catch( apiError => {
                console.error(apiError);
            });
    };

    /**
     * Tester la connexion de l'utilisateur
     * @param email
     * @param pw = password
     */
    const login = (email, pw) => {
        const data = {
            email: email,
            password: pw
        };
        fetch( 'https://api.dwsapp.io/api/login', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then( apiResponse => {
            if( apiResponse.ok ){
                return apiResponse.json();
            }
            else{
                console.error(apiResponse.statusText);
                showInvalidInputs(formLogin.querySelectorAll('input'));
            }
        }).then( jsonData => {
                if(jsonData) {
                    updateLocalStorage(jsonData.data.identity['_id'], email, pw, jsonData.data.identity['pseudo']);
                    window.location.href = 'index.html';
                }
            })
            .catch( apiError => {
                console.error(apiError);
            });
    };

    /**
     * Mettre en avant les champs invalides du formulaire
     * Ajout de la classe : invalid
     * @param inputs
     */
    const showInvalidInputs = (inputs) => {
        inputs.forEach(input => {
            input.classList.add('invalid');
            input.addEventListener('focus', () => {
                input.classList.remove('invalid');
            })
        });
    };

    /**
     * Mettre à jour les données de l'utilisateur dans le local storage
     * @param id
     * @param email
     * @param password
     * @param pseudo
     */
    const updateLocalStorage = (id, email, password, pseudo) => {
        if(id && email && password && pseudo) {
            let data = {
                id: id,
                email: email,
                pw: password,
                pseudo: pseudo
            };
            sessionStorage.setItem('appFilm', JSON.stringify(data))
        }
    };


    /**
     * Créer un élement film qui sera affiché dans le DOM
     * @param movie
     * @param isFavorite
     * @returns {string}
     */
    const createMovieItem = (movie, isFavorite) => {
        let div = `
                    <article>
                        <figure>
                            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
                            <figcaption movie-id="${movie.id}">
                                <h3>${movie.original_title}</h3> 
                                <p>Voir plus...</p>
                            </figcaption>
                        </figure>
                        <div data-favorite="${isFavorite}" data-title="${movie.title}" data-id="${movie.id}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                                <path d="M376,30c-27.783,0-53.255,8.804-75.707,26.168c-21.525,16.647-35.856,37.85-44.293,53.268
                                \t\t\tc-8.437-15.419-22.768-36.621-44.293-53.268C189.255,38.804,163.783,30,136,30C58.468,30,0,93.417,0,177.514
                                \t\t\tc0,90.854,72.943,153.015,183.369,247.118c18.752,15.981,40.007,34.095,62.099,53.414C248.38,480.596,252.12,482,256,482
                                \t\t\ts7.62-1.404,10.532-3.953c22.094-19.322,43.348-37.435,62.111-53.425C439.057,330.529,512,268.368,512,177.514
                                \t\t\tC512,93.417,453.532,30,376,30z"/>
                            </svg>
                        </div>
                    </article>
                `;
        return div;
    };


    /**
     * Obtenir la liste des genres du film affiché puis les ajouter dans le DOM de sa popin
     * @param idMovie
     * @param el = popin
     */
    const getMovieGenre = (idMovie, el) => {
        let genres = '';
        fetch( `https://api.themoviedb.org/3/movie/${idMovie}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`)
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                if(jsonData.genres.length) {
                    jsonData.genres.forEach(genre => {
                        genres += `<a href="#" data-genre="${genre.id}">${genre.name}</a>`;
                    });
                    let genresEl = document.createElement('div');
                    genresEl.classList.add('list-genres');
                    genresEl.innerHTML = genres;
                    el.querySelector('ul').parentNode.insertBefore(genresEl, el.querySelector('ul'));
                    el.querySelectorAll('[data-genre]').forEach(genre => {
                        let id = Number(genre.getAttribute('data-genre'));
                        genre.addEventListener('click', e => {
                            e.preventDefault();
                            closePopin();
                            fetchGenre(id);
                        })
                    })
                }
            })
            .catch( err => console.error(err) );
    };

    /**
     * Obtenir la liste des films par genre
     * @param id = id du genre
     */
    const fetchGenre = id => {
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&with_genres=${id}`)
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                displayMovieList(jsonData.results)
            })
            .catch( err => console.error(err) );
    };

    /**
     * Ajouter un film aux favoris
     * @param btn
     */
    const addToFavorite = (btn) => {
        const data = {
            author: userId,
            id: btn.dataset.id,
            name: btn.dataset.title
        };
        fetch( 'https://api.dwsapp.io/api/favorite', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then( apiResponse => {
            if( apiResponse.ok ){
                return apiResponse.json();
            }
        }).then( jsonData => {
            if(jsonData) {
                console.log(jsonData);
                console.log(jsonData.data.data.id);
                createFavoriteElement(jsonData.data.data.id, 'true');
                btn.setAttribute('data-favorite', 'true');
            }
        }).catch( apiError => {
                console.error(apiError);
        });
    };

    /**
     * Afficher la liste des films favoris
     */
    const showFavorites = () => {
        fetch(`https://api.dwsapp.io/api/me/${userId}`)
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                if(jsonData.data.favorite.length) {
                    favoriteSection.classList.remove('hide');
                }
                jsonData.data.favorite.forEach(item => {
                    let id = item.id;
                    if(!favorites.includes(id)) {
                        favorites.push(id);
                        createFavoriteElement(id)
                    }
                });
            })
            .catch( err => console.error(err) );
    };

    /**
     * Ajouter un film à la liste des films favoris affichés
     * @param idMovie
     */
    const createFavoriteElement = (idMovie) => {
        fetch( `https://api.themoviedb.org/3/movie/${idMovie}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`)
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                if(jsonData) {
                    favoriteContainer.innerHTML += createMovieItem(jsonData, 'true');
                    document.querySelector(`figcaption[movie-id="${jsonData.id}"]`).addEventListener('click', () => {
                        getMovieList(id);
                    })
                }
            })
            .catch( err => console.error(err) );
    };

    /**
     * Afficher et mettre à jour les données de l'utilisateur
     */
    const updateAccountInfos = () => {
        let lastSessionObject = sessionStorage.getItem("appFilm");
        let lastSession = JSON.parse(lastSessionObject);
        userId = lastSession.id;
        document.querySelector('.pseudo').innerHTML = lastSession.pseudo;
        document.querySelector('.email').innerHTML = lastSession.email;
    };

    /**
     * Obtenir la valeur renseignée dans le champs de recherche
     */
    const getSearchSubmit = () => {
        document.querySelector('.form-search').addEventListener('submit', ev => {
            ev.preventDefault();
            searchData.value.length > 0
                ? getMovieList(searchData.value)
                : console.log('Minimum 1 caractère');
        })
    };

    /**
     * Afficher les films dans le DOM
     * @param collection = liste des films à afficher
     */
    const displayMovieList = collection => {
        searchData.value = '';
        movieList.innerHTML = '';
        for( let i = 0; i < collection.length; i++ ){
            let isFavorite = favorites.includes(String(collection[i].id));
            movieList.innerHTML += createMovieItem(collection[i], isFavorite);
        }
        document.querySelectorAll('figcaption').forEach(item => {
            item.addEventListener('click', () => {
                getMovieList( +item.getAttribute('movie-id') );
            })
        });
        document.querySelectorAll('[data-favorite]').forEach(btn => {
            btn.addEventListener('click', () => {
                if(!favorites.includes(btn.dataset.id)) {
                    favorites.push(btn.dataset.id);
                    addToFavorite(btn);
                }
            })
        });
    };

    /**
     * Obtenir les films par mot clé et page
     * @param keywords
     * @param index
     */
    const getMovieList = (keywords, index = 1) => {
        let fetchUrl = null;
        typeof keywords === 'number'
            ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`
            : fetchUrl = themoviedbUrl + keywords + '&page=' + index;
        fetch( fetchUrl )
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                typeof keywords === 'number'
                    ? displayPopin(jsonData)
                    : displayMovieList(jsonData.results)
            })
            .catch( err => console.error(err) );
    };

    /**
     * Mettre à jour le contenu de la popin du film
     * @param data = objet film
     */
    const displayPopin = (data) => {
        moviePopin.innerHTML = `
                <div>
                    <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
                </div>
                <div>
                    <h2>${data.original_title}</h2>
                    <ul>
                        <li><span>Note : </span>${data.vote_average}/10</li>
                        <li><span>Popularité : </span>${data.popularity}</li>
                        <li><span>Sortie : </span>${data.release_date}</li>
                    </ul>
                    <p>${data.overview}</p>
                    <button>Voir en streaming</button>
                    <button id="closeButton">Close</button>
                </div>
            `;
        moviePopin.parentElement.classList.add('open');
        document.querySelector('#closeButton').addEventListener('click', () => {
            closePopin();
        });
        getMovieGenre(data.id, moviePopin);
    };
    /**
     * Fermer la popin des détails du film
     */
    const closePopin = () => {
        let button = document.querySelector('#closeButton');
        button.parentElement.parentElement.parentElement.classList.add('close');
        setTimeout( () => {
            button.parentElement.parentElement.parentElement.classList.remove('open');
            button.parentElement.parentElement.parentElement.classList.remove('close');
        }, 500 )
    };



    /*******************************************************************************************************************
     * NEW
     *******************************************************************************************************************/

    const getMovieData = (id) => {
        return new Promise(resolve => {
            fetch( `https://api.themoviedb.org/3/movie/${id}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`)
                .then( response => response.ok ? response.json() : 'Response not OK' )
                .then( jsonData => {
                    resolve(jsonData)
                })
                .catch( err => console.error(err) );
        });
    };

    const initPopin = async (movieId) => {
        let data = await getMovieData(movieId);
        let genres = '';
        if(data.genres.length) {
            genres += '<div class="list-genres">';
            data.genres.forEach(genre => {
                genres += `<a href="#" data-genre="${genre.id}">${genre.name}</a>`;
            });
            genres += '</div>';
        }
        moviePopin.innerHTML = `
                <div>
                    <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
                </div>
                <div>
                    <h2>${data.original_title}</h2>
                    ${genres}
                    <ul>
                        <li><span>Note : </span>${data.vote_average}/10</li>
                        <li><span>Popularité : </span>${data.popularity}</li>
                        <li><span>Sortie : </span>${data.release_date}</li>
                    </ul>
                    <p>${data.overview}</p>
                    <button>Voir en streaming</button>
                    <button id="closeButton">Close</button>
                </div>
            `;
        moviePopin.parentElement.classList.add('open');
        document.querySelector('#closeButton').addEventListener('click', (e) => {
            moviePopin.parentElement.classList.remove('open');
        });
    };

    const initSearchForm = () => {
        document.querySelector('.form-search').addEventListener('submit', ev => {
            ev.preventDefault();
            searchData.value.length > 0
                ? new MovieList(`https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=${searchData.value}&page=1`)
                : console.log('Minimum 1 caractère');
        })
    };

    class MovieList {
        constructor(url) {
            this.url = url;
            movieList.innerHTML = '';
            moviePopin.parentElement.classList.remove('open');
            this.getMovies();
        }
        getMovies() {
            fetch(this.url)
                .then( response => response.ok ? response.json() : 'Response not OK' )
                .then( jsonData => {
                    jsonData.results.forEach(movie => {
                        let isFavoriteMovie = favorites.includes(movie.id);
                        movieList.innerHTML += displayMovie(movie.id, movie.title, movie.poster_path, isFavoriteMovie);
                    });
                    document.querySelectorAll('[data-favorite="false"]').forEach(favoriteBtn => {
                        favoriteBtn.addEventListener('click', () => {
                            addToFavorite(favoriteBtn);
                        })
                    });
                    document.querySelectorAll('figcaption').forEach(btn => {
                        btn.addEventListener('click', () => {
                            initPopin(btn.dataset.id);
                        })
                    })
                })
                .catch( err => console.error(err) );
        }
        addToFavorites(btn) {
            const data = {
                author: userId,
                id: btn.dataset.id,
                name: btn.dataset.title
            };
            fetch( 'https://api.dwsapp.io/api/favorite', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            }).then( apiResponse => {
                if( apiResponse.ok ) return apiResponse.json();
            }).then( jsonData => {
                if(jsonData) {
                    console.log(jsonData);
                    console.log(jsonData.data.data.id);
                    btn.setAttribute('data-favorite', 'true');
                    /*
                    createFavoriteElement(jsonData.data.data.id, 'true');
                     */
                }
            }).catch( apiError => {
                console.error(apiError);
            });
        }
    }

    const displayMovie = (id, title, poster, isFavorite) => {
        return `
                    <article>
                        <figure>
                            <img src="https://image.tmdb.org/t/p/w500/${poster}" alt="${title}">
                            <figcaption movie-id="${id}" data-id="${id}">
                                <h3>${title}</h3> 
                                <p>Voir plus...</p>
                            </figcaption>
                        </figure>
                        <div data-favorite="${isFavorite}" data-title="${title}" data-id="${id}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                                <path d="M376,30c-27.783,0-53.255,8.804-75.707,26.168c-21.525,16.647-35.856,37.85-44.293,53.268
                                \t\t\tc-8.437-15.419-22.768-36.621-44.293-53.268C189.255,38.804,163.783,30,136,30C58.468,30,0,93.417,0,177.514
                                \t\t\tc0,90.854,72.943,153.015,183.369,247.118c18.752,15.981,40.007,34.095,62.099,53.414C248.38,480.596,252.12,482,256,482
                                \t\t\ts7.62-1.404,10.532-3.953c22.094-19.322,43.348-37.435,62.111-53.425C439.057,330.529,512,268.368,512,177.514
                                \t\t\tC512,93.417,453.532,30,376,30z"/>
                            </svg>
                        </div>
                    </article>
            `
    };




    /*******************************************************************************************************************
     * Débuter l'application
     *******************************************************************************************************************/

    if(document.querySelector('.identification-page')) {
        // On vérifie si l'utilisateur est connecté
        if(checkLastSession()) window.location.href = 'index.html';
        formLogin.addEventListener('submit', e => {
            e.preventDefault();
            login(loginEmail.value, loginPw.value)
        });
        formRegister.addEventListener('submit', e => {
            e.preventDefault();
            register(registerEmail.value, registerPw.value, registerPseudo.value);
        });
    }

    if(document.querySelector('.index-page')) {
        if(!checkLastSession()) {
            window.location.href = 'identification.html';
        } else {
            window.addEventListener('click', e => {
                if(e.target.hasAttribute('data-genre')) {
                    e.preventDefault();
                    new MovieList(`https://api.themoviedb.org/3/discover/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&with_genres=${e.target.dataset.genre}`);
                }
            });
            updateAccountInfos();
            initSearchForm();
            showFavorites();
        }
    }

});
