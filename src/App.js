import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "90dfde0a";
export default function App() {
  const [query, setQuery] = useState("");
  const{isLoading,error,movies}=useMovies(query);
  const[watched,setWatched]=useLocalStorageState([],"watched");
  const [selectedId, setSelectedId] = useState(null);
  
  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleSelect(id) {
    setSelectedId((prevId) => (prevId === id ? null : id));
  }
  function handleClose() {
    setSelectedId(null);
  }


  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader/> : <MovieList movies={movies} />} */}
          {!isLoading && !error && (
            <MovieList movies={movies} handleSelect={handleSelect} />
          )}
          {isLoading && <Loader />}
          {error && <Error message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              handleClose={handleClose}
              selectedId={selectedId}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMovieList
                watched={watched}
                handleDelete={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Error({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {

  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
 const inputEl=useRef(null)

useKey("Enter",function(){
  if(document.activeElement===inputEl.current) return;
  inputEl.current.focus();
 setQuery("")
})
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)
      
      }
      ref={inputEl}
    />
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong></strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <Summary watched={watched} />

//           <WatchedMovieList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }
function MovieList({ movies, handleSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} handleSelect={handleSelect} />
      ))}
    </ul>
  );
}
function Movie({ movie, handleSelect }) {
  return (
    <li key={movie.imdbID} onClick={() => handleSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMovieList({ watched, handleDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, handleDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDelete(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
function MovieDetails({ selectedId, handleClose, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched
    .map((watched) => watched.imdbID)
    .includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    Title: title,
  } = movie;
  const ratingRef=useRef(0)
  function addingMovie() {
    const watchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      decisionOfRating:ratingRef,
    };
    onAddWatched(watchedMovie);
    handleClose();
  }

useEffect(function(){
  if(userRating) ratingRef.current++;
},[userRating])
  useEffect(
    function () {
      async function getMovieDetails() {
        setLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

useKey("Escape",handleClose);

return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={handleClose}>
          &larr;
        </button>
        <img src={poster} alt={`poster of ${movie}`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} IMDB rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={addingMovie}>
                  + Add to list
                </button>
              )}
            </>
          ) : (
            <p>
              You rated this movie {watchedUserRating}
              <span>⭐</span>
            </p>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed By {director}</p>
      </section>
    </div>
  );
}
function Summary({ watched }) {

  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched?.map((movie) => movie.userRating));
  const avgRuntime = average(watched?.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
