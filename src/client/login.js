document.getElementById("submit").addEventListener("click", login);

function login() {
  const name = document.getElementById("uname").value;
  const pw = document.getElementById("pword").value;

  if (name.trim().length === 0) {
    return alert("You must enter a username to login.");
  }
  if (pw.trim().length === 0) {
    return alert("You must enter a password to login.");
  }

  const userInfo = {
    userName: name,
    password: pw,
  };

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInfo),
  })
    .then(async (res) => {
      if (res.status === 422) {
        alert("This username-password combination is invalid, try again!");
        return;
      }
      const body = await res.json();
      console.log(body);
      location.replace("/users/ownprofile");
    })
    .catch((err) => console.log(err));
}
