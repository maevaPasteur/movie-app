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
    const favoriteSection = document.querySelector(".section-favorites");
    const favoriteContainer = document.querySelector(".section-favorites .container");
    const moviePopin = document.querySelector('#moviePopin article');
    const movieList = document.querySelector('#movieList');
    const genreList = document.querySelector('.section-genres .container');
    const lastViewContainer = document.querySelector('.section-lastview .container');
    let userId, favorites = [];


    /*******************************************************************************************************************
     * Déclaration des fonctions
     *******************************************************************************************************************/

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
        }).then( jsonData => {
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

    const getFavorites = () => {
        fetch(`https://api.dwsapp.io/api/me/${userId}`)
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                if(jsonData.data.favorite.length) {
                    favoriteSection.classList.remove('hide');
                }
                jsonData.data.favorite.forEach(item => {
                    let id = item.id;
                    let favoriteMovie = {
                        'movieId' : id,
                        'favoriteId' : item._id
                    };
                    if ( !favorites.some(e => e.id === id) ) {
                        favorites.push(favoriteMovie);
                        getMovieData(id).then((movieData) => {
                            favoriteContainer.innerHTML += displayMovie(movieData.id, movieData.title, movieData.poster_path, true);
                        });
                    }
                });
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
     * Vérifier si l'utilisateur est connecté
     * @returns {boolean}
     */
    const checkLastSession = () => {
        const lastSessionObject = sessionStorage.getItem("appFilm");
        const lastSession = JSON.parse(lastSessionObject);
        return !!lastSession
    };

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

    const initPopin = movieId => {
        getMovieData(movieId).then(data => {
            addToLastViewMovies(movieId, data.title, data.poster_path, favorites.some(e => e.movieId === movieId));
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
            this.scrollToList();
        }
        scrollToList() {
            setTimeout(() => {
                movieList.scrollIntoView({
                    behavior: 'smooth'
                });
            }, 300)
        }
        getMovies() {
            fetch(this.url)
                .then( response => response.ok ? response.json() : 'Response not OK' )
                .then( jsonData => {
                    jsonData.results.forEach(movie => {
                        let isFavoriteMovie = favorites.includes(movie.id);
                        movieList.innerHTML += displayMovie(movie.id, movie.title, movie.poster_path, isFavoriteMovie);
                    });
                })
                .catch( err => console.error(err) );
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

    /**
     * Display a link for every genre's movies
     */
    const getGenresList = () => {
        fetch( 'https://api.themoviedb.org/3/genre/movie/list?api_key=6fd32a8aef5f85cabc50cbec6a47f92f')
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                jsonData.genres.forEach(genre => {
                    genreList.innerHTML += `<a href="#" data-genre="${genre.id}">${genre.name}</a>`
                })
            })
            .catch( err => console.error(err) );
    };

    /**
     * Add a movie to the last view list
     * Saved on local storage
     * @param id (film)
     * @param title (film)
     * @param poster (film)
     * @param isFavorite : boolean
     */
    const addToLastViewMovies = (id, title, poster, isFavorite) => {
        lastViewContainer.parentElement.classList.remove('hide');
        let lastSessionObject = sessionStorage.getItem("appFilm");
        let lastSession = JSON.parse(lastSessionObject);
        let movie = {
            'id': id,
            'title': title,
            'poster': poster,
            'isFavorite': isFavorite
        };
        if(!lastSession.view) {
            lastSession.view = [];
            lastSession.view.push(movie);
            lastViewContainer.innerHTML += displayMovie(id, title, poster, isFavorite);
        } else  if(!lastSession.view.some(e => e.id === id)) {
            lastSession.view.push(movie);
            lastViewContainer.innerHTML += displayMovie(id, title, poster, isFavorite);
        }
        sessionStorage.setItem('appFilm', JSON.stringify(lastSession));
    };

    const showLastViewMovies = () => {
        let lastSessionObject = sessionStorage.getItem("appFilm");
        let lastSession = JSON.parse(lastSessionObject);
        if(lastSession.view) {
            lastSession.view.forEach(movie => {
                console.log(movie);
                lastViewContainer.parentElement.classList.remove('hide');
                lastViewContainer.innerHTML += displayMovie(movie.id, movie.title, movie.poster, movie.isFavorite)
            })
        }
    };

    const removeFromFavorites = btn => {
        let movieId = btn.dataset.id;
        let favoriteId = btn.dataset.favoriteId;
        console.log('fav', favoriteId);
        console.log('id', movieId);
        favorites = favorites.filter(item => item !== movieId);
        fetch( `https://api.dwsapp.io/api/favorite/${favoriteId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        }).then( apiResponse => {
            if( apiResponse.ok ) return apiResponse.json();
        }).then( jsonData => {
            if(jsonData) {
                console.log(jsonData);
            }
        }).catch( apiError => {
            console.error(apiError);
        });
    };

    const addToFavorites = btn => {
        let movieId = btn.dataset.id;
        let movieTitle = btn.dataset.title;
        console.log(favorites);
        if(!favorites.some(e => e.id === movieId)) {
            const data = {
                author: userId,
                id: movieId,
                title: movieTitle
            };
            fetch( 'https://api.dwsapp.io/api/favorite', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            }).then( apiResponse => {
                if( apiResponse.ok ) return apiResponse.json();
            }).then( jsonData => {
                if(jsonData) {
                    favoriteSection.classList.remove('hide');
                    let favoriteMovie = {
                        'movieId' : movieId,
                        'favoriteId' : jsonData.data._id
                    };
                    favorites.push(favoriteMovie);
                    btn.setAttribute('data-favorite', 'true');
                    getMovieData(data.id).then(movieData => {
                        favoriteContainer.innerHTML += displayMovie(movieData.id, movieData.title, movieData.poster_path, true)
                    });
                }
            }).catch( apiError => {
                console.error(apiError);
            });
        }
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
                if (e.target.hasAttribute('data-genre')) {
                    e.preventDefault();
                    new MovieList(`https://api.themoviedb.org/3/discover/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&with_genres=${e.target.dataset.genre}`);
                } else if(e.target.closest('figcaption')) {
                    initPopin(e.target.closest('figcaption').dataset.id);
                } else if (e.target.closest('[data-favorite="true"]')) {
                    removeFromFavorites(e.target.closest('[data-favorite]'));
                } else if (e.target.closest('[data-favorite="false"]')) {
                    addToFavorites(e.target.closest('[data-favorite]'));
                }
            });
            updateAccountInfos();
            showLastViewMovies();
            getGenresList();
            initSearchForm();
            getFavorites();
        }
    }

});