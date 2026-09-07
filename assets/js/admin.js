// ADMIN – ربط Firestore
import {
    db, collection, addDoc, getDocs, deleteDoc, doc
} from "../../database/config.js";
import {
    query, where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const studentsCol = collection(db, "students");
const guardiansCol = collection(db, "guardians");

// مولّد سريع لاسم المستخدم: p + أرقام من الرقم المدرسي + 3 أرقام عشوائية
function generateUsername(studentId) {
    const digits = (studentId || "").toString().replace(/\D/g, "");
    const rand = Math.floor(100 + Math.random() * 900); // 3 أرقام
    return `p${digits || "000"}${rand}`;
}

// مولّد كلمة مرور 8 رموز (أحرف إنجليزية + أرقام)
function generatePassword(len = 8) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    let pw = "";
    for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    return pw;
}

// إضافة طالبة جديدة + إنشاء حساب وليّ الأمر تلقائياً
async function addOrUpdateStudent(e) {
    e.preventDefault();

    const student = {
        name: document.getElementById("studentName").value.trim(),
        grade: document.getElementById("studentGrade").value.trim(),
        id: document.getElementById("studentID").value.trim(),
        guardian1: document.getElementById("guardian1").value.trim(),
        phone1: document.getElementById("phone1").value.trim(),
        guardian2: document.getElementById("guardian2").value.trim(),
        phone2: document.getElementById("phone2").value.trim(),
        createdAt: new Date().toISOString()
    };

    if (!student.name || !student.grade || !student.id || !student.guardian1 || !student.phone1) {
        alert("⚠️ الرجاء تعبئة الحقول الأساسية: الاسم، الصف، الرقم المدرسي، وليّ الأمر 1، رقم وليّ الأمر 1");
        return;
    }

    try {
        // 1) إضافة الطالبة
        const studentDoc = await addDoc(studentsCol, student);

        // 2) إنشاء حساب وليّ الأمر – غير قابل للتعديل لاحقاً (حسب طلبك)
        const username = generateUsername(student.id);
        const password = generatePassword(8);

        await addDoc(guardiansCol, {
            username,
            password,
            studentDocId: studentDoc.id,
            studentName: student.name,
            grade: student.grade,
            guardianName: student.guardian1,
            phone: student.phone1,
            createdAt: new Date().toISOString()
        });

        alert(`✅ تم حفظ بيانات الطالبة وإنشاء حساب وليّ الأمر تلقائياً:\nاسم المستخدم: ${username}\nكلمة المرور: ${password}`);

        // تنظيف النموذج وتحديث الجداول
        document.getElementById("studentForm").reset();
        renderStudents();
        renderUsers();

    } catch (err) {
        console.error("❌ خطأ أثناء الإضافة:", err);
        alert("حدث خطأ أثناء الحفظ. افحصي الكونسول.");
    }
}

// عرض الطالبات
async function renderStudents() {
    const table = document.getElementById("studentsTable");
    if (!table) return;

    table.innerHTML = "";
    const snapshot = await getDocs(studentsCol);
    snapshot.forEach((d) => {
        const s = d.data();
        table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.grade}</td>
        <td>${s.id}</td>
        <td>${s.guardian1}</td>
        <td>${s.phone1}</td>
        <td>
          <button class="main-btn" style="background:#c0392b;" onclick="deleteStudent('${d.id}')">🗑️ حذف</button>
        </td>
      </tr>
    `;
    });
}

// حذف طالبة (لا يحذف حساب وليّ الأمر تلقائياً حفاظاً على السجل)
async function deleteStudent(id) {
    if (!confirm("هل تريدين حذف بيانات هذه الطالبة؟")) return;
    try {
        await deleteDoc(doc(db, "students", id));
        alert("🗑️ تم حذف الطالبة.");
        renderStudents();
        renderUsers();
    } catch (err) {
        console.error("❌ خطأ أثناء الحذف:", err);
    }
}

// عرض حسابات أولياء الأمور في صفحة manage-users.html
async function renderUsers() {
    const usersTable = document.getElementById("usersTable");
    if (!usersTable) return;

    usersTable.innerHTML = "";
    const snapshot = await getDocs(guardiansCol);
    snapshot.forEach((d) => {
        const g = d.data();
        usersTable.innerHTML += `
      <tr>
        <td>${g.studentName}</td>
        <td>${g.username}</td>
        <td>${g.password}</td>
      </tr>
    `;
    });
}

// تحميل عند الفتح
window.onload = () => {
    console.log("🔥 admin.js جاهز");
    renderStudents();
    renderUsers();
};

// تعريض الدوال للواجهة
window.addOrUpdateStudent = addOrUpdateStudent;
window.deleteStudent = deleteStudent;
