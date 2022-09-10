const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertCaseName = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

const convertCase = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

//Get All Movie Names API

app.get("/movies/", async (request, response) => {
  const movieNameQuery = `
    SELECT
      movie_name  
    FROM
      movie;`;
  const movieName = await db.all(movieNameQuery);
  const newMovieName = [];
  for (let i of movieName) {
    let item = convertCaseName(i);
    newMovieName.push(item);
  }

  response.send(newMovieName);
});

//Post movie API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    Insert into 
    movie(director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}');`;
  const addMovie = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //   const newId = parseInt(movieId);
  //   console.log(movieId);
  //   console.log(typeof movieId);
  const getMovieQuery = `
    select *
    from movie
    where movie_id=${movieId};`;

  const getMovie = await db.get(getMovieQuery);

  const newMovie = convertCase(getMovie);
  response.send(newMovie);
});

//Update Movie API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    update movie
    set director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    where movie_id=${movieId}`;
  const updateMovie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    delete from movie
    where movie_id=${movieId};`;
  const deleteMovie = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDir = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

//Get Directors API

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    select * 
    from director`;
  const getDirector = await db.all(getDirectorsQuery);
  const newDirectors = [];
  for (let i of getDirector) {
    let item = convertDir(i);
    newDirectors.push(item);
  }
  response.send(newDirectors);
});

//Get Movies of a Director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `select movie_name
    from movie
    where director_id=${directorId};`;
  const movieList = await db.all(query);
  const newMovieList = [];
  for (let i of movieList) {
    let item = convertCaseName(i);
    newMovieList.push(item);
  }
  response.send(newMovieList);
});

module.exports = app;
