// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyCwnn6JY3f-Nv9NWx2beIUjAnyVCqU749E",
    authDomain: "cay-love-you.firebaseapp.com",
    databaseURL: "https://cay-love-you-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cay-love-you",
    storageBucket: "cay-love-you.firebasestorage.app",
    messagingSenderId: "526657108236",
    appId: "1:526657108236:web:8ce574d880d232c754b129"
};

// Firebase-i başladırıq
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===== Səs faylı =====
const notificationSound = new Audio("notification.mp3"); // Layihəyə əlavə et

// ===== Sifariş göndərmək =====
function sendOrder() {
    const table = document.getElementById("table").value;
    const meal = document.getElementById("meal").value;
    const note = document.getElementById("note").value;

    if (!table || !meal) {
        alert("Masa və Məhsul boş ola bilməz!");
        return;
    }

    db.ref("orders").push({
        table,
        meal,
        note,
        status: "active",
        time: new Date().toLocaleTimeString()
    });

    alert("Sifariş göndərildi!");
    document.getElementById("table").value = "";
    document.getElementById("meal").value = "";
    document.getElementById("note").value = "";
}

// ===== Mətbəx Panelində sifarişləri göstərmək =====
function loadKitchen() {
    const box = document.getElementById("ordersBox");

    db.ref("orders").on("child_added", snapshot => {
        notificationSound.play(); // Yeni sifariş gəldikdə səs çal
    });

    db.ref("orders").on("value", snapshot => {
        box.innerHTML = "";
        snapshot.forEach(child => {
            const o = child.val();

            box.innerHTML += `
                <div style="padding:10px; margin:10px; border:1px solid #ccc; border-radius:6px;">
                    <b>Masa:</b> ${o.table} <br>
                    <b>Məhsul:</b> ${o.meal} <br>
                    <b>Qeyd:</b> ${o.note} <br>
                    <b>Status:</b> ${o.status} <br>
                    <i>${o.time}</i>
                </div>
            `;
        });
    });
}

// ===== Admin Kod ilə Panel Açmaq =====
function checkAdmin() {
    const code = document.getElementById("adminCode").value;
    if (code === "1986") {
        document.getElementById("loginDiv").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        loadAdminOrders();
    } else {
        alert("Yanlış kod!");
    }
}

// ===== Admin Panelində sifarişləri göstər və idarə et =====
function loadAdminOrders() {
    const ordersList = document.getElementById("ordersList");

    db.ref("orders").on("child_added", snapshot => {
        notificationSound.play(); // Yeni sifariş gəldikdə səs çal
    });

    db.ref("orders").on("value", snapshot => {
        ordersList.innerHTML = "";
        snapshot.forEach(child => {
            const id = child.key;
            const o = child.val();

            const li = document.createElement("li");
            li.innerHTML = `
                <b>Masa:</b> ${o.table} - <b>Məhsul:</b> ${o.meal} 
                [Status: ${o.status}] <br>
                <button onclick="deleteOrder('${id}')">Sil</button>
                <button onclick="cancelOrder('${id}')">Ləğv et</button>
                <input type="text" id="penalty-${id}" placeholder="Cəza qeyd et">
                <button onclick="addPenalty('${id}')">Əlavə et</button>
                <hr>
            `;
            ordersList.appendChild(li);
        });
    });
}

// ===== Admin funksiyaları =====
function deleteOrder(orderId) {
    if (confirm("Bu sifarişi silmək istədiyinizə əminsiniz?")) {
        db.ref("orders/" + orderId).remove();
    }
}

function cancelOrder(orderId) {
    db.ref("orders/" + orderId).update({ status: "cancelled" });
}

function addPenalty(orderId) {
    const note = document.getElementById(`penalty-${orderId}`).value;
    db.ref("orders/" + orderId).update({ penalty: note });
    document.getElementById(`penalty-${orderId}`).value = "";
}
