document
  .getElementById("addwatchlist")
  .addEventListener("click", addToWatchlist);

async function addToWatchlist() {
  const movieID = document.location.pathname.split("/")[2];
  //   console.log(`Movie ID: ${movieID}`);

  fetch("/users/watchlist/add", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: movieID }),
  })
    .then(async (res) => {
      if (res.status === 404) {
        alert("This movie could not be found.");
      }
      const body = await res.json();
      console.log(body);
      alert("Movie succesfully added to your watchlist!");
    })
    .catch((err) => console.log(err));
}

function submitBasic(movieID) {
  const reviewScore = document.getElementById("score").value;
  if (reviewScore.length === 0) {
    alert("Fill out the score field to submit a basic review.");
    return;
  }
  if (reviewScore > 10 || reviewScore < 1) {
    //Make a basic review
    alert("This is an invalid rating, please enter a number between 1 and 10");
    return;
  }

  const request = {
    score: reviewScore,
    movieid: movieID,
  };
  //fetch post to server with reviewScore for basic review creation
  fetch("/reviews/basic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
    .then((res) => location.reload())
    .catch((err) => console.log(err));

  // console.log(`Review Score: ${reviewScore}`);
}

function submitFull(movieID) {
  const reviewScore = document.getElementById("score").value;
  const reviewSummary = document.getElementById("reviewsummary").value;
  const reviewFull = document.getElementById("reviewfull").value;

  if (
    reviewScore.length === 0 ||
    reviewSummary.length === 0 ||
    reviewFull.length === 0
  ) {
    alert("Please fill out all fields to submit a full review");
    return;
  }
  if (reviewScore > 10 || reviewScore < 1) {
    alert("This is an invalid rating, please enter a number between 1 and 10");
    return;
  }
  const request = {
    score: reviewScore,
    movieid: movieID,
    summary: reviewSummary,
    full: reviewFull,
  };

  fetch("/reviews/full", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
    .then((res) => location.reload())
    .catch((err) => console.log(err));
}
