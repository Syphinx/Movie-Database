document.getElementById("submit").addEventListener("click", changeRole);

function changeRole() {
  const buttonStatus = {
    regButton: document.getElementById("reg").checked,
    conButton: document.getElementById("con").checked,
  };
  fetch("/users", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buttonStatus),
  })
    .then((res) => {
      if (res.status === 405) {
        alert("You are already this type of user!");
        return;
      }
      alert("Account status succesfully updated.");
      location.reload();
    })
    .catch((err) => console.log(err));
}

function removeFromWatchlist(id) {
  // console.log(`The movie id recieved from this button: ${id}`)

  fetch("/users/watchlist/remove", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => location.reload())
    .catch((err) => console.log(err));
}

function deleteNotification(id) {
  console.log(id);
  fetch("/notifications/remove", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => location.reload())
    .catch((err) => console.log(err));
}

function followUser(id) {
  console.log(id);

  fetch("/users/follow", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  }).then((res) => {
    if (res.status === 405) {
      alert("You already follow this user!");
    } else if (res.status === 200) {
      alert("You have succesfully followed this user!");
    }
  });
}
