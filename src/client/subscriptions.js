function unfollowUser(id) {
  console.log(`The ID of the user: ${id}`);
  fetch("/users/unfollow", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => {
      if (res.status === 404 || res.status === 405) {
        alert("Encountered an error trying to process your request");
        return;
      }
      location.reload();
    })
    .catch((err) => console.log(err));
}

function unfollowPerson(id) {
  console.log(`The ID of the person: ${id}`);
  fetch("/people/unfollow", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => {
      if (res.status === 404 || res.status === 405) {
        alert("Encountered an error trying to process your request");
        return;
      }
      location.reload();
    })
    .catch((err) => console.log(err));
}
