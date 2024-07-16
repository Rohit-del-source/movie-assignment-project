let moviesData = [];
let currentPage = 1;
let sortedByRating = false;
let sortedByRatingAscending = false;
let sortedByDate = false;
let sortedByDateAscending = false;
let sortedMovies = [];
let active = "all";
let favoriteBtns = [];
let favorites = [];
if(localStorage.getItem("favorites"))
favorites = JSON.parse(localStorage.getItem("favorites"));
else
localStorage.setItem("favorites", JSON.stringify([]));
const sortByRatingBtn = document.getElementById("sort-by-rating");
const sortByDateBtn = document.getElementById("sort-by-date");
const movies = document.getElementById("movies-list");
const prevBtn = document.getElementById("prev-button");
const nextBtn = document.getElementById("next-button");
const curPageBtn = document.getElementById("page-number-button");
const favoritesTab = document.querySelector(".favorites-tab");
const allTab = document.querySelector(".all-tab");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-button");

async function fetchMovies(page){
    try{
        const data = await ( await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=f531333d637d0c44abc85b3e74db2186&language=en-US&page=${page}`) ).json();
        // console.log(data);
        moviesData = data.results;
        // console.log(moviesData);
        renderMovies(moviesData);
    }catch(e){
        console.log(e.message);
    }
}

function renderMovies(moviesData, isFavo){
    movies.innerHTML = "";
    moviesData.forEach(({title, id, poster_path, vote_count,vote_average}) =>{
        // console.log(title,poster_path,vote_average,vote_count);
        let item = document.createElement("li");
        item.classList.add("card");
        if(isFavo){
            if(favorites.includes(""+id))
                item.classList.add("favorite-card");
            else
                item.style.display = "none";
        }
        item.innerHTML =`
        <img src="https://image.tmdb.org/t/p/original/${poster_path}" alt="" class="poster">
        <p class="title">${title}</p>
        <section class="vote-favouriteIcon">
            <i data-id=${id} class="fa-regular fa-heart fa-2xl favorite-icon"></i>
            <div class="votes">
                <p class="vote-count">Votes: ${vote_count}</p>
                <p class="vote-average">Rating: ${vote_average}</p>
            </div>
        </section>
        `
        movies.appendChild(item);
    })
    renderFavIcons();
    favoriteBtns.forEach(cur =>{
        cur.addEventListener("click", ()=>{
            favorites = JSON.parse(localStorage.getItem("favorites"))
            const id = cur.dataset.id;
            if(favorites.includes(id)){
                cur.style.color = "black"
                favorites.splice(favorites.indexOf(id),1);
                cur.parentElement.parentElement.classList.remove("favorite-card")
                if(active == "favorite")
                    cur.parentElement.parentElement.style.display = "none"
            }else{
                cur.parentElement.parentElement.classList.add("favorite-card")
                favorites.push(id);
                cur.style.color = "red"
            }
            localStorage.setItem("favorites", JSON.stringify(favorites));
        })
    })
}
function renderFavIcons(){
    favoriteBtns = document.querySelectorAll(".card i");
    // let arr = JSON.parse(localStorage.getItem("favorites")) ?? [];
    // console.log(favoriteBtns);
    favorites.forEach(id =>{
        let icon =  document.querySelector(`i[data-id="${id}"]`)
        if(icon){
            icon.style.color = "red";
            icon.parentElement.parentElement.classList.add("favorite-card")
        }
    })
}    
fetchMovies(currentPage);

sortByRatingBtn.addEventListener("click", ()=>{
    if(sortedByRatingAscending){
        sortedByRatingAscending = false;
        moviesData.sort((a,b) => b.vote_average - a.vote_average);
        sortByRatingBtn.innerText = "Sort by rating (least to most)";
    }else{
        sortedByRatingAscending = true;
        moviesData.sort((a,b) => a.vote_average - b.vote_average);
        sortByRatingBtn.innerText = "Sort by rating (most to least)";
    }
    movies.innerHTML = "";
    renderMovies(moviesData, active == "favorite");
})
sortByDateBtn.addEventListener("click", ()=>{
    if(sortedByDateAscending){
        sortedByDateAscending = false;
        moviesData.sort((a,b) => new Date(b.release_date) - new Date(a.release_date));
        sortByDateBtn.innerText = "Sort by date (oldest to latest)";
    }else{
        sortedByDateAscending = true;
        moviesData.sort((a,b) => new Date(a.release_date) - new Date(b.release_date));
        sortByDateBtn.innerText = "Sort by date (latest to oldest)";
    }
    movies.innerHTML = "";
    renderMovies(moviesData, active == "favorite");
})

nextBtn.addEventListener("click", ()=>{
    currentPage++;
    fetchMovies(currentPage);
    curPageBtn.innerText = `Current Page: ${currentPage}`;
    prevBtn.disabled = false;
    if(currentPage == 3)
        nextBtn.disabled = true;
    favoritesTab.classList.remove("active-tab");
    allTab.classList.add("active-tab");
    active = "all";
})
prevBtn.addEventListener("click", ()=>{
    currentPage--;
    fetchMovies(currentPage);
    curPageBtn.innerText = `Current Page: ${currentPage}`;
    nextBtn.disabled = false;
    if(currentPage == 1)
        prevBtn.disabled = true;
    favoritesTab.classList.remove("active-tab");
    allTab.classList.add("active-tab");
    active = "all";
})

favoritesTab.addEventListener("click", ()=>{
    if(active != "favorite"){
        favoritesTab.classList.add("active-tab");
        allTab.classList.remove("active-tab");
        active = "favorite";
        document.querySelectorAll(".card").forEach(cur =>{
            if(!cur.classList.contains("favorite-card"))
                cur.style.display = "none";
        })
        
    }
})
allTab.addEventListener("click", ()=>{
    if(active != "all"){
        favoritesTab.classList.remove("active-tab");
        allTab.classList.add("active-tab");
        active = "all";
        document.querySelectorAll(".card").forEach(cur =>{
            cur.style.display = "unset";
        })
    }
})
let timer;
searchInput.addEventListener("input", ()=>{
    clearTimeout(timer);
    timer = setTimeout(searchMovie, 1000);
})
async function searchMovie(page = 1){
    let query = searchInput.value;
    moviesData = (await (await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}&api_key=f531333d637d0c44abc85b3e74db2186`)).json()).results;
    renderMovies(moviesData);
}