document.getElementById("search").addEventListener("click", grabFields);

function grabFields() {
  const title = document.getElementById("title").value;
  const genre = document.getElementById("genre").value;
  const actorName = document.getElementById("actorName").value;

  let url = new URL(document.location.href);
  url.pathname = "movies";
  if (actorName.length > 0) {
    url.searchParams.append("actorName", actorName);
  }
  url.searchParams.append("title", title);
  url.searchParams.append("genre", genre);

  console.log(document.location);
  console.log(url);

  location.replace(url);
}
