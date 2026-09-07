// LOGIN – يتحقق من Firestore لحساب وليّ الأمر أو الإدارة أو المشرفة
import { db } from "../../database/config.js";
import { collection, query, where, getDocs }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("⚠️ يرجى إدخال اسم المستخدم وكلمة المرور");
        return;
    }

    // 🟦 حساب الإدارة
    if (username === "admin" && password === "123456") {
        alert("تم تسجيل الدخول كـ إدارة ✅");
        window.location.href = "admin/manage-students.html";
        return;
    }

    // 🟨 حساب المشرفة
    if (username === "supervisor" && password === "123456") {
        alert("تم تسجيل الدخول كـ مشرفة ✅");
        window.location.href = "supervisor/dashboard.html";
        return;
    }

    // 🟩 حساب وليّ الأمر (من قاعدة البيانات)
    try {
        const q = query(
            collection(db, "guardians"),
            where("username", "==", username),
            where("password", "==", password)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
            const guardian = snap.docs[0].data();

            // ✅ تحقق من وجود البيانات الأساسية
            if (!guardian.studentName || !guardian.grade) {
                alert("⚠️ بيانات الطالبة غير مكتملة في قاعدة البيانات.");
                return;
            }

            // ✅ تخزين بيانات الطالبة محليًا
            localStorage.setItem("guardianStudentName", guardian.studentName);
            localStorage.setItem("guardianGrade", guardian.grade);

            alert(`تم تسجيل الدخول كوليّ أمر ✅\nالطالبة: ${guardian.studentName}\nالصف: ${guardian.grade}`);
            window.location.href = "guardian/dashboard.html";
        } else {
            alert("❌ اسم المستخدم أو كلمة المرور غير صحيحة");
        }
    } catch (err) {
        console.error("⚠️ خطأ أثناء التحقق:", err);
        alert("حدث خطأ أثناء تسجيل الدخول. تحقق من الاتصال أو الكونسول.");
    }
}

// 🔹 ربط الدالة بزر تسجيل الدخول
window.login = login;
