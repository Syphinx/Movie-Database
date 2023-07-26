document.getElementById("submit").addEventListener("click", createUser);

function createUser() {
  const newUser = {
    userName: document.getElementById("uname").value,
    password: document.getElementById("pword").value,
  };

  fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  })
    .then(async (res) => {
      if (res.status === 422) {
        alert("This username is taken, try again!");
        return;
      }
      location.replace("/users/ownprofile");
    })
    .catch((err) => console.log(err));
}
