let members = JSON.parse(localStorage.getItem("members")) || [];
let users = JSON.parse(localStorage.getItem("users")) || {};
let paid = JSON.parse(localStorage.getItem("paid")) || {};
let ganeshaImages = JSON.parse(localStorage.getItem("ganeshaImages")) || [];
let vaultAmount = JSON.parse(localStorage.getItem("vaultAmount")) || 0;
let currentUser = null;
let isAdmin = false;

function saveData() {
  localStorage.setItem("members", JSON.stringify(members));
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("paid", JSON.stringify(paid));
  localStorage.setItem("ganeshaImages", JSON.stringify(ganeshaImages));
  localStorage.setItem("vaultAmount", JSON.stringify(vaultAmount));
}

// Splash
window.onload = () => {
  setTimeout(() => {
    document.getElementById("splashScreen").style.display = "none";
    document.getElementById("loginPage").classList.remove("hidden");
  }, 5000);
};

function login() {
  const name = document.getElementById("nameInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();
  const imgInput = document.getElementById("profileImgInput");
  const msg = document.getElementById("loginMsg");

  if (!name || !password) {
    msg.textContent = "Enter name and password";
    return;
  }

  if (users[name]) {
    if (users[name].password === password) {
      msg.textContent = "Login successful ✅";
      currentUser = name;
      isAdmin = false;
      showApp();
    } else {
      msg.textContent = "❌ Incorrect password!";
    }
  } else {
    if (!/^[0-9]{10}$/.test(phone)) {
      msg.textContent = "Enter a valid 10-digit mobile number";
      return;
    }
    if (!imgInput.files[0]) {
      msg.textContent = "Upload a profile image";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      users[name] = { password, phone, img: reader.result };
      members.push(name);
      paid[name] = false;
      saveData();
      msg.textContent = "✅ Account created! Please login again.";
    };
    reader.readAsDataURL(imgInput.files[0]);
  }
}

function adminLogin() {
  const name = document.getElementById("adminName").value.trim();
  const pass = document.getElementById("adminPass").value.trim();
  const msg = document.getElementById("adminMsg");

  if (name === "vignaraja" && pass === "Pracx99") {
    msg.textContent = "Admin login successful ✅";
    currentUser = name;
    isAdmin = true;
    showApp();
  } else {
    msg.textContent = "❌ Wrong admin credentials!";
  }
}

function showApp() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("profileAvatar").classList.add("hidden");

  if (!isAdmin && users[currentUser]?.img) {
    const avatar = document.getElementById("profileAvatar");
    avatar.src = users[currentUser].img;
    avatar.classList.remove("hidden");
  }

  if (isAdmin) {
    document.getElementById("adminPanel").classList.remove("hidden");
  } else {
    document.getElementById("adminPanel").classList.add("hidden");
  }

  renderMembers();
  startCountdown();
}

function renderMembers() {
  let total = vaultAmount;
  const list = document.getElementById("membersList");
  list.innerHTML = "";

  members.forEach(name => {
    const user = users[name];
    if (!user) return;

    const isPaid = paid[name] === true;
    if (isPaid) total += 250;

    const li = document.createElement("li");
    li.className = "member";
    li.innerHTML = `
      <div class="left">
        <img src="${user.img}" alt="profile">
        <span class="name">${name}</span>
      </div>
      <div>
        <span class="status ${isPaid ? "paid" : "pending"}">
          ${isPaid ? "Paid ✅" : "Pending ❗"}
        </span>
        ${isAdmin ? `<button class="btn green" onclick="togglePayment('${name}')">Toggle</button>
                     <button class="btn red" onclick="deleteMember('${name}')">Delete</button>` : ""}
      </div>
    `;
    list.appendChild(li);
  });

  document.getElementById("totalVault").textContent = total;
}

function togglePayment(name) {
  paid[name] = !paid[name];
  saveData();
  renderMembers();
}

function deleteMember(name) {
  members = members.filter(m => m !== name);
  delete users[name];
  delete paid[name];
  saveData();
  renderMembers();
}

function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("hidden");
}

function logout() {
  currentUser = null;
  isAdmin = false;
  document.getElementById("app").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function deleteAccount() {
  if (!isAdmin && confirm("Are you sure you want to delete your account?")) {
    members = members.filter(m => m !== currentUser);
    delete users[currentUser];
    delete paid[currentUser];
    saveData();
    logout();
  }
}

function viewDates() {
  alert("Important Dates:\n- 3rd of every month: Savings\n- 14 September 2026: Special Event");
}

function uploadGanesha() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      ganeshaImages.push(reader.result);
      saveData();
      showGallery();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function showGallery() {
  const gallery = document.getElementById("ganeshaGallery");
  gallery.innerHTML = "";
  ganeshaImages.forEach((src, idx) => {
    const img = document.createElement("img");
    img.src = src;
    gallery.appendChild(img);

    if (isAdmin) {
      const del = document.createElement("button");
      del.textContent = "❌";
      del.onclick = () => {
        ganeshaImages.splice(idx, 1);
        saveData();
        showGallery();
      };
      gallery.appendChild(del);
    }
  });
}

function goHome() {
  document.getElementById("sideMenu").classList.add("hidden");
}

function startCountdown() {
  const eventDate = new Date("September 14, 2026 00:00:00").getTime();
  const timerEl = document.getElementById("timer");
  setInterval(() => {
    const now = new Date().getTime();
    const distance = eventDate - now;
    if (distance < 0) {
      timerEl.innerText = "Event Passed";
      return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    timerEl.innerText = `${days}d ${hours}h ${mins}m left`;
  }, 1000);
}

function togglePassword() {
  const passInput = document.getElementById("passwordInput");
  passInput.type = passInput.type === "password" ? "text" : "password";
}

function toggleAdminPanel() {
  document.querySelector("#adminPanel .panel-content").classList.toggle("hidden");
}

function updateVault() {
  const val = parseInt(document.getElementById("vaultInput").value);
  if (!isNaN(val)) {
    vaultAmount += val;
    saveData();
    renderMembers();
  }
}
