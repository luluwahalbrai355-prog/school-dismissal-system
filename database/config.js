// استيراد الحزم المطلوبة من Firebase (إصدار 12.4.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// إعدادات مشروعك من Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBdgKGXrvKElEP5oEdp6VBLgqhdFAuQzzE",
    authDomain: "smart-dismissal-system.firebaseapp.com",
    projectId: "smart-dismissal-system",
    storageBucket: "smart-dismissal-system.firebasestorage.app",
    messagingSenderId: "72035306909",
    appId: "1:72035306909:web:eb0f9aa632d1fecc30b374",
    measurementId: "G-L8JYGZ21V1"
};

// تفعيل الاتصال بالتطبيق
const app = initializeApp(firebaseConfig);

// إنشاء مرجع لقاعدة البيانات
const db = getFirestore(app);

// تصدير قاعدة البيانات والعمليات الممكنة منها
export { db, collection, addDoc, getDocs, deleteDoc, doc };
