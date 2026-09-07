// supervisor.js — عرض طلبات الانصراف وتحديث حالتها
import { db } from "../../database/config.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const requestsBody = document.getElementById("requestsBody");

// 🟢 مراقبة الطلبات من مجموعة notifications في الوقت الحقيقي
const notifQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));

onSnapshot(notifQuery, (snapshot) => {
  requestsBody.innerHTML = ""; // مسح القديم

  snapshot.forEach((d) => {
    const n = d.data();
    const docId = d.id;
    const time = n.createdAt?.toDate
      ? n.createdAt.toDate().toLocaleTimeString("ar-OM", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";

    // ✅ عرض فقط الطلبات اللي فيها حالة "قيد الانتظار" أو "وليّ الأمر قريب"
    if (["قيد الانتظار", "وليّ الأمر قريب من المدرسة"].includes(n.status)) {
      requestsBody.innerHTML += `
        <tr>
          <td>${n.studentName || "—"}</td>
          <td>${n.grade || "—"}</td>
          <td>${n.guardianName || "—"}</td>
          <td>${n.status || "—"}</td>
          <td>${time}</td>
          <td>
            <button onclick="confirmDismissal('${docId}')" style="background-color:#27ae60; color:white; border:none; padding:5px 10px; border-radius:6px;">✅ تأكيد</button>
            <button onclick="rejectDismissal('${docId}')" style="background-color:#c0392b; color:white; border:none; padding:5px 10px; border-radius:6px;">❌ رفض</button>
          </td>
        </tr>
      `;
    }
  });

  // لو ما فيه طلبات
  if (snapshot.empty || requestsBody.innerHTML.trim() === "") {
    requestsBody.innerHTML = `
      <tr><td colspan="6">لا توجد طلبات حالية</td></tr>
    `;
  }
});

// ✅ دوال لتحديث الحالة في Firestore
window.confirmDismissal = async (id) => {
  const ref = doc(db, "notifications", id);
  await updateDoc(ref, {
    status: "تم تأكيد الانصراف ✅",
    confirmedAt: new Date(),
  });
  alert("✅ تم تأكيد انصراف الطالبة");
};

window.rejectDismissal = async (id) => {
  const ref = doc(db, "notifications", id);
  await updateDoc(ref, {
    status: "❌ تم رفض الطلب",
    rejectedAt: new Date(),
  });
  alert("❌ تم رفض الطلب");
};
