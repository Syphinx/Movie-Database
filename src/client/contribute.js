document.getElementById("search").addEventListener("keyup", performSearch);
let personResults = document.getElementById("search-results");

document.getElementById("addperson").addEventListener("click", addPerson);
document.getElementById("addwriters").addEventListener("click", addWriter);
document.getElementById("addactors").addEventListener("click", addActor);
document.getElementById("adddirectors").addEventListener("click", addDirectors);
document.getElementById("addmovie").addEventListener("click", addMovie);

function getNames() {
  let name = "";
  for (let i = 0; i < personResults.children.length; i += 2) {
    if (personResults.children[i].checked) {
      name += personResults.children[i].value.split("_").join(" ");
      name += ", ";
    }
  }
  return name;
}

function addWriter() {
  addPersonToBox("writers", getNames());
}

function addActor() {
  addPersonToBox("actors", getNames());
}

function addDirectors() {
  addPersonToBox("directors", getNames());
}

//Queries people from the database
async function getNameSuggestions(name) {
  return fetch(`/people?name=${name}`)
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => console.error(err));
}

//Takes input and uses it to query people from the database, then through AJAX updates page with check boxes
async function performSearch() {
  let name = document.getElementById("search").value;
  let mathchingNames = await getNameSuggestions(name);
  let content = "";
  mathchingNames.forEach((person) => {
    let name = person.name.split(" ").join("_");
    content += `<input value=${name} type="checkbox" class="mr-2">${person.name}</input><br/>`;
  });
  personResults.innerHTML = content;
}

function addPersonToBox(boxId, name) {
  const box = document.getElementById(boxId);
  box.value = box.value + name;
  personResults.innerHTML = "";
  document.getElementById("search").value = "";
}

function addPerson() {
  const personName = document.getElementById("newcrew").value;
  if (personName.trim().length === 0) {
    alert("You have to enter a name to add this person");
    return;
  }
  fetch("/people", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: personName }),
  })
    .then((res) => {
      if (res.status === 405) {
        return alert("This person already exists in the database!");
      } else if (res.status === 200) {
        alert("New crew succesfully added to the database!");
        location.reload();
      }
    })
    .catch((err) => console.log(err));
}

async function addMovie() {
  const title = document.getElementById("title").value;
  const runtime = document.getElementById("runtime").value;
  const releaseYear = document.getElementById("releaseyear").value;
  let writers = document.getElementById("writers").value;
  let directors = document.getElementById("directors").value;
  let actors = document.getElementById("actors").value;

  if (title.length === 0) {
    return alert("You need to fill out the title field!");
  }
  if (runtime.length === 0) {
    return alert("You need to fill out the runtime field!");
  }
  if (releaseYear.length === 0) {
    return alert("You need to fill out the releaseYear field!");
  }

  if (writers.length === 0) {
    return alert("You need to fill out the writers field!");
  } else {
    writers = writers.split(", ").splice(0, writers.length);
    writers = writers.slice(0, writers.length - 1);
  }

  if (directors.length === 0) {
    return alert("You need to fill out the directors field!");
  } else {
    directors = directors.split(", ").splice(0, directors.length);
    directors = directors.slice(0, directors.length - 1);
  }
  if (actors.length === 0) {
    return alert("You need to fill out the actors field!");
  } else {
    actors = actors.split(", ").splice(0, actors.length);
    actors = actors.slice(0, actors.length - 1);
  }

  const request = {
    title: title,
    runtime: runtime,
    releaseYear: releaseYear,
    writers: writers,
    directors: directors,
    actors: actors,
  };

  console.log(request);

  fetch("/movies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
    .then((res) => {
      if (res.status === 405) {
        return alert("This movie already exists in the database!");
      } else if (res.status === 200) {
        alert("New movie succesfully added to the database!");
        location.reload();
      }
    })
    .catch((err) => console.log(err));
}
