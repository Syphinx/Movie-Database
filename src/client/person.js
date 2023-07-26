function followPerson(pID) {
  const request = {
    personID: pID,
  };
  fetch("/people/follow", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
    .then((res) => {
      if (res.status === 405) {
        alert("You already follow this person!");
      } else if (res.status === 200) {
        alert("You have succesfully followed this person!");
      }
      return;
    })
    .catch((err) => console.log(err));
}
