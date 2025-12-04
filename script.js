// ===== Firebase konfiqurasiyası =====
const firebaseConfig = {
  apiKey: "SƏNİN_API_KEY",
  authDomain: "SƏNİN_AUTH_DOMAIN",
  databaseURL: "SƏNİN_DATABASE_URL",
  projectId: "SƏNİN_PROJECT_ID",
  storageBucket: "SƏNİN_STORAGE_BUCKET",
  messagingSenderId: "SƏNİN_SENDER_ID",
  appId: "SƏNİN_APP_ID"
};

// Firebase-i başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Səs faylı
const notificationSound = document.getElementById('notificationSound');

// ===== Admin kodu ilə giriş =====
function checkAdmin() {
  const code = document.getElementById('adminCode').value;
  if (code === '1986') {
    document.getElementById('loginDiv').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadOrders();
  } else {
    alert('Yanlış kod!');
  }
}

// ===== Sifarişləri göstər və idarə et =====
function loadOrders() {
  const ordersRef = db.ref('orders');

  // Yeni sifariş gəldikdə səs çal
  ordersRef.on('child_added', snapshot => {
    notificationSound.play();
  });

  // Bütün sifarişləri göstər
  ordersRef.on('value', snapshot => {
    const orders = snapshot.val();
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    for (let id in orders) {
      const order = orders[id];
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${order.name}</strong> - ${order.item} 
        [Status: ${order.status || 'active'}]
        <button onclick="deleteOrder('${id}')">Sil</button>
        <button onclick="cancelOrder('${id}')">Ləğv et</button>
        <input type="text" id="penalty-${id}" placeholder="Cəza qeyd et">
        <button onclick="addPenalty('${id}')">Əlavə et</button>
      `;
      ordersList.appendChild(li);
    }
  });
}

// ===== Funksiyalar =====
function deleteOrder(orderId) {
  if (confirm('Bu sifarişi silmək istədiyinizə əminsiniz?')) {
    db.ref('orders/' + orderId).remove();
  }
}

function cancelOrder(orderId) {
  db.ref('orders/' + orderId).update({
    status: 'cancelled'
  });
}

function addPenalty(orderId) {
  const note = document.getElementById(`penalty-${orderId}`).value;
  db.ref('orders/' + orderId).update({
    penalty: note
  });
  document.getElementById(`penalty-${orderId}`).value = '';
}
