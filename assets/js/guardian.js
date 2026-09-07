// استيراد أدوات Firestore والإعدادات
import { db } from "../database/config.js";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// متغير للاحتفاظ بمعرف الطلب الحالي للتمكن من تعديله أو إلغائه
let currentRequestId = null;

// 1. إرسال طلب استلام الطالبة
async function sendPickupRequest() {
    const studentName = localStorage.getItem("guardianStudentName");
    const grade = localStorage.getItem("guardianGrade");

    if (!studentName) {
        alert("⚠️ لم يتم العثور على بيانات الطالبة، يرجى تسجيل الدخول مجدداً.");
        window.location.href = "../index.html";
        return;
    }

    try {
        // إرسال المستند إلى مجموعة dismissal_requests في Firestore
        const docRef = await addDoc(collection(db, "dismissal_requests"), {
            studentName: studentName,
            grade: grade,
            status: "pending", // الحالة: قيد الانتظار
            createdAt: serverTimestamp()
        });

        currentRequestId = docRef.id;

        alert("✅ تم إرسال طلب استلام الطالبة للمشرفة بنجاح");
        document.getElementById("requestBtn").style.display = "none";
        document.getElementById("extraActions").style.display = "block";

    } catch (error) {
        console.error("خطأ أثناء إرسال الطلب:", error);
        alert("❌ تعذر إرسال الطلب، تحقق من الاتصال بالإنترنت.");
    }
}

// 2. إرسال الموقع الجغرافي GPS
function sendGPS() {
    if (!currentRequestId) {
        alert("⚠️ يجب إرسال طلب الاستلام أولاً");
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                // تحديث مستند الطلب بإحداثيات الموقع
                const requestRef = doc(db, "dismissal_requests", currentRequestId);
                await updateDoc(requestRef, {
                    latitude: lat,
                    longitude: lon,
                    locationSentAt: serverTimestamp()
                });

                alert("📍 تم إرسال موقعكِ للمدرسة بنجاح");
            } catch (error) {
                console.error("خطأ في تحديث الموقع:", error);
                alert("❌ تعذر تحديث الموقع في قاعدة البيانات");
            }
        }, (err) => {
            alert("⚠️ يرجى تفعيل إذن الوصول للموقع في المتصفح");
        });
    } else {
        alert("❌ المتصفح لا يدعم تحديد الموقع");
    }
}

// 3. إلغاء الطلب
async function cancelRequest() {
    if (!currentRequestId) return;

    try {
        const requestRef = doc(db, "dismissal_requests", currentRequestId);
        await updateDoc(requestRef, {
            status: "cancelled", // الحالة: ملغي
            cancelledAt: serverTimestamp()
        });

        alert("❌ تم إلغاء الطلب");
        currentRequestId = null;
        document.getElementById("requestBtn").style.display = "block";
        document.getElementById("extraActions").style.display = "none";
    } catch (error) {
        console.error("خطأ في إلغاء الطلب:", error);
    }
}

// 4. تأكيد استلام الطالبة
async function confirmPickup() {
    if (!currentRequestId) return;

    try {
        const requestRef = doc(db, "dismissal_requests", currentRequestId);
        await updateDoc(requestRef, {
            status: "completed", // الحالة: تم الاستلام
            completedAt: serverTimestamp()
        });

        alert("✅ تم تسجيل استلام الطالبة بنجاح");
        currentRequestId = null;
        document.getElementById("extraActions").style.display = "none";
        document.getElementById("requestBtn").style.display = "block";
    } catch (error) {
        console.error("خطأ في تأكيد الاستلام:", error);
    }
}

// ربط الدوال بالواجهة (Window) لتعمل مع onClick في الـ HTML
window.sendPickupRequest = sendPickupRequest;
window.sendGPS = sendGPS;
window.cancelRequest = cancelRequest;
window.confirmPickup = confirmPickup;