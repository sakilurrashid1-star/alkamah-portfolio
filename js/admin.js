/**
 * Alkamah Sakilur Rashid Portfolio — Admin System & Firebase Integration
 * 
 * Secure Authentication, Full Access Control Panel & Real-time Cloud Sync
 * Enterprise Cloud Architecture with Google Sign-in & Master Passcode
 * Full Control for Profile, Projects, Leadership Clubs, and All Activities (Technical, Cultural, Sports)
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    addDoc, 
    collection, 
    getDocs, 
    deleteDoc, 
    query, 
    orderBy 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Firebase Configuration (Dedicated Project for Portfolio)
const firebaseConfig = {
    apiKey: "AIzaSyD0DraIxTUwISZd2ssFNHhWjhV-KX_VZFU",
    authDomain: "alkamah-poartfulio.firebaseapp.com",
    projectId: "alkamah-poartfulio",
    storageBucket: "alkamah-poartfulio.firebasestorage.app",
    messagingSenderId: "1077607906393",
    appId: "1:1077607906393:web:e707aa758ccf587f464548",
    measurementId: "G-17FN7Y0RRH"
};

// Authorized Admin Emails
const ADMIN_EMAILS = [
    'sakilurrashid1@gmail.com',
    'alkamahrashid@gmail.com'
];

// Initialize Firebase
let app, auth, db;
let isFirebaseReady = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseReady = true;
    console.log('[Portfolio Admin] Firebase initialized successfully');
} catch (err) {
    console.warn('[Portfolio Admin] Firebase initialization failed, running in local fallback mode:', err);
}

// Default Activities Galleries Data
export const DEFAULT_TECHNICAL_PHOTOS = [
    { src: "assets/technical-activity-1.jpg", caption: "Speaking at a technical event" },
    { src: "assets/technical-activity-2.jpg", caption: "Presenting during a technical workshop" },
    { src: "assets/technical-activity-4.jpg", caption: "Technical workshop group photo" },
    { src: "assets/technical-activity-7.jpg", caption: "Attending a technical presentation" },
    { src: "assets/technical-activity-8.jpg", caption: "Audience at a technical workshop" },
    { src: "assets/technical-activity-5.jpg", caption: "PU Cyber Security Club event booth" },
    { src: "assets/technical-activity-3.jpg", caption: "Certificate presentation at a technical event" },
    { src: "assets/technical-activity-6.jpg", caption: "Technical event participants with certificates" },
    { src: "assets/technical-activity-9.jpg", caption: "Technical event group with certificates" }
];

export const DEFAULT_CULTURAL_PHOTOS = [
    { src: "assets/cultural-photo-1.jpg", caption: "Pohela Boishakh – Stage Performance" },
    { src: "assets/cultural-photo-2.jpg", caption: "Pohela Boishakh – Cultural Performance" },
    { src: "assets/cultural-photo-3.jpg", caption: "Pohela Boishakh – Live Musical Performance" },
    { src: "assets/cultural-photo-4.jpg", caption: "Pohela Boishakh – Audience & Festivity" },
    { src: "assets/cultural-photo-5.jpg", caption: "Pohela Boishakh – Campus Celebration" }
];

export const DEFAULT_SPORTS_PHOTOS = [
    { src: "assets/sports-medal-ceremony.jpg", caption: "Football match action and team moments collage" },
    { src: "assets/sports-moment-5.jpg", caption: "CSE football tournament poster" },
    { src: "assets/sports-moment-1.jpg", caption: "Strikes United football team on the field" },
    { src: "assets/sports-moment-2.jpg", caption: "Team celebration at the pool" },
    { src: "assets/sports-moment-3.jpg", caption: "Celebrating with the football tournament trophy" },
    { src: "assets/sports-moment-4.jpg", caption: "Champions group with faculty, medals and trophy" },
    { src: "assets/sports-football-action.jpg", caption: "Sports recognition ceremony with fellow participants" }
];

export function ensurePortfolioActivities(data) {
    if (!data) return data;
    if (!data.technicalPhotos || !Array.isArray(data.technicalPhotos) || data.technicalPhotos.length === 0) {
        data.technicalPhotos = [...DEFAULT_TECHNICAL_PHOTOS];
    }
    if (!data.culturalPhotos || !Array.isArray(data.culturalPhotos) || data.culturalPhotos.length === 0) {
        data.culturalPhotos = [...DEFAULT_CULTURAL_PHOTOS];
    }
    if (!data.sportsPhotos || !Array.isArray(data.sportsPhotos) || data.sportsPhotos.length === 0) {
        data.sportsPhotos = [...DEFAULT_SPORTS_PHOTOS];
    }
    return data;
}

// Admin State
export const AdminState = {
    isAdmin: false,
    user: null,
    authMethod: null, // 'google', 'email', 'passcode'
    activeTab: 'dashboard',
    inbox: [],
    editingProjectIndex: -1,
    editingClubIndex: -1,
    editingPhotoInfo: null, // { category: 'technical' | 'cultural' | 'sports', index: number }
    galleryFilter: 'all' // 'all' | 'technical' | 'cultural' | 'sports'
};

// Master Passcode Key
const PASSCODE_STORAGE_KEY = 'alkamah_admin_master_pin';
const DATA_STORAGE_KEY = 'alkamah_portfolio_data';
const DEFAULT_PASSCODE = 'alkamah2026';

function getMasterPasscode() {
    return localStorage.getItem(PASSCODE_STORAGE_KEY) || DEFAULT_PASSCODE;
}

// Toast Notification
export function showAdminToast(message, type = 'success') {
    const toast = document.getElementById('adminToast') || createToastElement();
    const colors = {
        success: 'bg-emerald-600/95 border-emerald-400 text-white shadow-emerald-500/20',
        error: 'bg-rose-600/95 border-rose-400 text-white shadow-rose-500/20',
        info: 'bg-indigo-600/95 border-indigo-400 text-white shadow-indigo-500/20'
    };
    
    toast.className = `fixed bottom-6 right-6 z-[100000] px-5 py-3 rounded-2xl border text-sm font-bold shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${colors[type] || colors.info}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} text-lg"></i>
        <span>${message}</span>
    `;
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.className = 'fixed bottom-6 right-6 z-[100000] opacity-0 pointer-events-none transition-all duration-300 transform translate-y-4';
    }, 4000);
}

function createToastElement() {
    const el = document.createElement('div');
    el.id = 'adminToast';
    el.className = 'fixed bottom-6 right-6 z-[100000] opacity-0 pointer-events-none transition-all duration-300 transform translate-y-4';
    document.body.appendChild(el);
    return el;
}

// Update Navbar Admin Status
export function updateNavbarAdminStatus() {
    const navBtn = document.getElementById('adminNavBtn');
    const navStatus = document.getElementById('adminNavStatus');
    const mobileBtn = document.getElementById('adminMobileNavBtn');
    
    if (AdminState.isAdmin) {
        if (navStatus) {
            navStatus.innerHTML = '<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Alkamah (Admin)</span></span>';
        }
        if (navBtn) {
            navBtn.classList.remove('hidden');
            navBtn.classList.add('flex', 'border-emerald-500/50', 'bg-emerald-500/10', 'text-emerald-300');
            navBtn.title = 'Admin Panel Active — Click to open Cockpit';
        }
        if (mobileBtn) {
            mobileBtn.classList.remove('hidden');
            mobileBtn.innerHTML = '<i class="fas fa-shield-halved text-emerald-400"></i> Admin Panel';
        }
    } else {
        if (navBtn) {
            navBtn.classList.add('hidden');
            navBtn.classList.remove('flex');
        }
        if (mobileBtn) {
            mobileBtn.classList.add('hidden');
        }
    }
}

// Secret 3-Click Trigger on Logo
let secretLogoClicks = 0;
let secretLogoTimer = null;
export function handleSecretLogoClick(e) {
    secretLogoClicks++;
    clearTimeout(secretLogoTimer);
    secretLogoTimer = setTimeout(() => { secretLogoClicks = 0; }, 1500);
    if (secretLogoClicks >= 3) {
        secretLogoClicks = 0;
        toggleAdminView();
    }
}

// Monitor Auth State
if (isFirebaseReady) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const email = (user.email || '').toLowerCase();
            if (ADMIN_EMAILS.includes(email)) {
                AdminState.isAdmin = true;
                AdminState.user = user;
                AdminState.authMethod = 'google';
                localStorage.setItem('alkamah_admin_session', 'active');
                updateNavbarAdminStatus();
                showAdminToast(`Welcome Alkamah! (${user.displayName || user.email})`, 'success');
                loadInboxMessages();
            } else {
                await signOut(auth);
                AdminState.isAdmin = false;
                AdminState.user = null;
                updateNavbarAdminStatus();
                showAdminToast('Unauthorized account. Access restricted to sakilurrashid1@gmail.com.', 'error');
            }
        } else {
            if (sessionStorage.getItem('alkamah_admin_passcode_active') === 'true') {
                AdminState.isAdmin = true;
                AdminState.authMethod = 'passcode';
                updateNavbarAdminStatus();
            } else {
                AdminState.isAdmin = false;
                AdminState.user = null;
                updateNavbarAdminStatus();
            }
        }
    });
}

// Login With Google
export async function loginWithGoogle() {
    if (!isFirebaseReady) {
        showAdminToast('Firebase cloud connection is not active. Please sign in with master passcode.', 'error');
        return;
    }
    
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const email = (result.user.email || '').toLowerCase();
        
        if (ADMIN_EMAILS.includes(email)) {
            AdminState.isAdmin = true;
            AdminState.user = result.user;
            AdminState.authMethod = 'google';
            closeAdminAuthModal();
            openAdminDashboard();
            showAdminToast('Signed in as Administrator successfully!', 'success');
            loadInboxMessages();
        } else {
            await signOut(auth);
            showAdminToast('This Google account does not have administrator privileges.', 'error');
        }
    } catch (err) {
        console.error('Google Sign-in Error:', err);
        showAdminToast('Google sign-in failed: ' + (err.message || 'Error'), 'error');
    }
}

// Login With Email & Password
export async function loginWithEmail(email, password) {
    if (!isFirebaseReady) {
        showAdminToast('Firebase cloud connection is not ready.', 'error');
        return;
    }
    
    try {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        const userEmail = (result.user.email || '').toLowerCase();
        
        if (ADMIN_EMAILS.includes(userEmail)) {
            AdminState.isAdmin = true;
            AdminState.user = result.user;
            AdminState.authMethod = 'email';
            closeAdminAuthModal();
            openAdminDashboard();
            showAdminToast('Admin sign-in successful via email!', 'success');
            loadInboxMessages();
        } else {
            await signOut(auth);
            showAdminToast('This email address does not have administrator privileges.', 'error');
        }
    } catch (err) {
        console.error('Email Sign-in Error:', err);
        showAdminToast('Invalid email or password.', 'error');
    }
}

// Login With Master Passcode
export function loginWithPasscode(code) {
    const valid = getMasterPasscode();
    if (code === valid || code === DEFAULT_PASSCODE) {
        AdminState.isAdmin = true;
        AdminState.authMethod = 'passcode';
        sessionStorage.setItem('alkamah_admin_passcode_active', 'true');
        updateNavbarAdminStatus();
        closeAdminAuthModal();
        openAdminDashboard();
        showAdminToast('Admin mode activated with master passcode!', 'success');
        return true;
    } else {
        showAdminToast('Incorrect master passcode! Please try again.', 'error');
        return false;
    }
}

// Logout
export async function logoutAdmin() {
    if (isFirebaseReady && auth.currentUser) {
        await signOut(auth);
    }
    AdminState.isAdmin = false;
    AdminState.user = null;
    AdminState.authMethod = null;
    sessionStorage.removeItem('alkamah_admin_passcode_active');
    localStorage.removeItem('alkamah_admin_session');
    updateNavbarAdminStatus();
    closeAdminDashboard();
    showAdminToast('Signed out from admin session successfully.', 'info');
}

// Cloud Synchronization: Fetch /site/portfolio
export async function syncFromCloud(currentData) {
    let resolvedData = ensurePortfolioActivities(currentData);
    
    const local = localStorage.getItem(DATA_STORAGE_KEY);
    if (local) {
        try {
            const parsed = JSON.parse(local);
            resolvedData = ensurePortfolioActivities({ ...resolvedData, ...parsed });
        } catch (e) {
            console.warn('LocalStorage parse error:', e);
        }
    }
    
    if (isFirebaseReady) {
        try {
            const siteDoc = await getDoc(doc(db, 'site', 'portfolio'));
            if (siteDoc.exists()) {
                const cloudData = siteDoc.data();
                resolvedData = ensurePortfolioActivities({ ...resolvedData, ...cloudData });
                localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(resolvedData));
                console.log('[Portfolio Admin] Synced latest data from Cloud Firestore');
            }
        } catch (err) {
            console.warn('[Portfolio Admin] Cloud fetch skipped or permission denied:', err);
        }
    }
    
    return resolvedData;
}

// Cloud Synchronization: Save to /site/portfolio
export async function saveToCloud(portfolioData) {
    const dataToSave = ensurePortfolioActivities(portfolioData);
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(dataToSave));
    
    if (isFirebaseReady && AdminState.isAdmin && AdminState.user) {
        try {
            await setDoc(doc(db, 'site', 'portfolio'), dataToSave, { merge: true });
            showAdminToast('Saved to Cloud Firestore and local storage successfully!', 'success');
            return true;
        } catch (err) {
            console.error('Firestore save error:', err);
            showAdminToast('Saved locally. Sign in with Google to sync with Cloud Firestore.', 'info');
            return false;
        }
    } else {
        showAdminToast('All changes saved to local storage successfully!', 'success');
        return true;
    }
}

// Contact Form Message Integration: Save to Firestore /msgs
export async function saveMessageToCloud(name, email, phone, message) {
    if (!isFirebaseReady) return false;
    
    try {
        await addDoc(collection(db, 'msgs'), {
            n: name.trim().slice(0, 100),
            c: `${email.trim()} | ${phone.trim()}`.slice(0, 100),
            b: message.trim().slice(0, 3000),
            ts: Date.now()
        });
        console.log('[Portfolio Admin] Message also synced to Firestore inbox');
        return true;
    } catch (err) {
        console.warn('[Portfolio Admin] Firestore message sync skipped:', err);
        return false;
    }
}

// Load Inbox Messages
export async function loadInboxMessages() {
    if (!isFirebaseReady || !AdminState.isAdmin) return [];
    
    try {
        const q = query(collection(db, 'msgs'), orderBy('ts', 'desc'));
        const snap = await getDocs(q);
        const msgs = [];
        snap.forEach(d => {
            msgs.push({ id: d.id, ...d.data() });
        });
        AdminState.inbox = msgs;
        renderAdminInbox();
        updateInboxBadge();
        return msgs;
    } catch (err) {
        console.warn('Inbox load skipped (likely rule permission or empty):', err);
        return [];
    }
}

// Delete Message
export async function deleteInboxMessage(msgId) {
    if (!isFirebaseReady || !AdminState.isAdmin) return;
    
    try {
        await deleteDoc(doc(db, 'msgs', msgId));
        AdminState.inbox = AdminState.inbox.filter(m => m.id !== msgId);
        renderAdminInbox();
        updateInboxBadge();
        showAdminToast('Message deleted successfully.', 'info');
    } catch (err) {
        console.error('Delete message error:', err);
        showAdminToast('Failed to delete message.', 'error');
    }
}

function updateInboxBadge() {
    const badge = document.getElementById('adminInboxBadge');
    if (badge) {
        const count = AdminState.inbox.length;
        badge.textContent = count > 0 ? count : '';
        badge.className = count > 0 
            ? 'ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white' 
            : 'hidden';
    }
}

// Backup & Export JSON
export function exportPortfolioBackup(portfolioData) {
    const exportData = ensurePortfolioActivities(portfolioData);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alkamah-portfolio-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showAdminToast('Portfolio backup JSON downloaded successfully!', 'success');
}

// UI Modals Control
export function openAdminAuthModal() {
    if (AdminState.isAdmin) {
        openAdminDashboard();
        return;
    }
    const modal = document.getElementById('adminAuthModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

export function closeAdminAuthModal() {
    const modal = document.getElementById('adminAuthModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

export function openAdminDashboard() {
    if (!AdminState.isAdmin) {
        openAdminAuthModal();
        return;
    }
    const modal = document.getElementById('adminDashboardModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        renderAdminDashboard();
    }
}

export function closeAdminDashboard() {
    const modal = document.getElementById('adminDashboardModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

export function toggleAdminView() {
    if (AdminState.isAdmin) {
        const modal = document.getElementById('adminDashboardModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeAdminDashboard();
        } else {
            openAdminDashboard();
        }
    } else {
        const authModal = document.getElementById('adminAuthModal');
        if (authModal && !authModal.classList.contains('hidden')) {
            closeAdminAuthModal();
        } else {
            openAdminAuthModal();
        }
    }
}

export function switchAdminTab(tabName) {
    AdminState.activeTab = tabName;
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabPanes = document.querySelectorAll('.admin-tab-pane');
    
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('bg-primary/20', 'text-white', 'border-primary/50');
            btn.classList.remove('text-slate-400', 'border-transparent');
        } else {
            btn.classList.remove('bg-primary/20', 'text-white', 'border-primary/50');
            btn.classList.add('text-slate-400', 'border-transparent');
        }
    });
    
    tabPanes.forEach(pane => {
        if (pane.id === `adminTab-${tabName}`) {
            pane.classList.remove('hidden');
        } else {
            pane.classList.add('hidden');
        }
    });
    
    if (tabName === 'inbox') {
        loadInboxMessages();
    }
}

// Render Admin Dashboard
export function renderAdminDashboard() {
    if (!window.currentPortfolioData) return;
    const data = ensurePortfolioActivities(window.currentPortfolioData);
    
    // Overview Metrics
    const mProjects = document.getElementById('admMetricProjects');
    const mClubs = document.getElementById('admMetricClubs');
    const mGallery = document.getElementById('admMetricGallery');
    const mInbox = document.getElementById('admMetricInbox');
    
    const totalPhotos = (data.technicalPhotos.length) + (data.culturalPhotos.length) + (data.sportsPhotos.length);
    
    if (mProjects) mProjects.textContent = data.projects ? data.projects.length : 0;
    if (mClubs) mClubs.textContent = data.clubs ? data.clubs.length : 0;
    if (mGallery) mGallery.textContent = totalPhotos;
    if (mInbox) mInbox.textContent = AdminState.inbox.length;
    
    // Account details
    const admUserEmail = document.getElementById('admUserEmail');
    const admCloudStatus = document.getElementById('admCloudStatus');
    
    if (admUserEmail) {
        admUserEmail.textContent = AdminState.user ? AdminState.user.email : 'Master Passcode Mode';
    }
    if (admCloudStatus) {
        admCloudStatus.innerHTML = AdminState.user 
            ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><i class="fas fa-cloud-check text-xs"></i> Firestore Cloud Connected</span>'
            : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"><i class="fas fa-database text-xs"></i> Local Storage Mode</span>';
    }
    
    // Populate Profile Tab
    if (data.personalInfo) {
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        setVal('adm_name', data.personalInfo.name);
        setVal('adm_firstName', data.personalInfo.firstName);
        setVal('adm_phone', data.personalInfo.phone);
        setVal('adm_email', data.personalInfo.email);
        setVal('adm_location', data.personalInfo.location);
        setVal('adm_bio', data.personalInfo.bio);
        setVal('adm_profileImg', data.personalInfo.profileImage);
        
        if (data.typingPhrases) {
            setVal('adm_phrases', data.typingPhrases.join('\n'));
        }
    }
    
    // Populate Tabs
    renderAdminProjectsList();
    renderAdminClubsList();
    renderAdminGalleryList();
    renderAdminInbox();
}

// Render Projects List in Admin
export function renderAdminProjectsList() {
    const container = document.getElementById('admProjectsList');
    if (!container || !window.currentPortfolioData) return;
    
    const projects = window.currentPortfolioData.projects || [];
    if (projects.length === 0) {
        container.innerHTML = '<div class="p-6 rounded-2xl glass text-center text-slate-400">No projects found. Add your first project above.</div>';
        return;
    }
    
    let html = '';
    projects.forEach((p, idx) => {
        html += `
            <div class="glass p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 shrink-0">
                        <i class="${p.icon || 'fas fa-code'}"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="font-bold text-white text-base">${p.title}</h4>
                            <span class="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/10 text-slate-300">${p.categoryLabel || p.category}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1 line-clamp-1">${p.desc}</p>
                        <span class="text-[10px] text-secondary font-mono block mt-1">${p.tech}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button type="button" onclick="window.adminEditProject(${idx})" 
                            class="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-indigo-200 text-xs font-bold border border-primary/30 transition-all flex items-center gap-1.5">
                        <i class="fas fa-edit text-xs"></i> <span>Edit</span>
                    </button>
                    <button type="button" onclick="window.adminDeleteProject(${idx})" 
                            class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5">
                        <i class="fas fa-trash text-xs"></i> <span>Delete</span>
                    </button>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
}

// Render Clubs List in Admin
export function renderAdminClubsList() {
    const container = document.getElementById('admClubsList');
    if (!container || !window.currentPortfolioData) return;
    
    const clubs = window.currentPortfolioData.clubs || [];
    if (clubs.length === 0) {
        container.innerHTML = '<div class="p-6 rounded-2xl glass text-center text-slate-400">No club leadership roles found. Add your first role above.</div>';
        return;
    }
    
    let html = '';
    clubs.forEach((c, idx) => {
        html += `
            <div class="glass p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${c.color || 'text-white'} border border-white/10 shrink-0">
                        <i class="${c.icon || 'fas fa-shield-halved'}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-white text-base">${c.club}</h4>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs font-bold ${c.color || 'text-white'}">${c.role}</span>
                            <span class="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-white/5">${c.date}</span>
                            ${c.prevRole ? `<span class="text-[10px] text-slate-400 font-mono">(Prev: ${c.prevRole})</span>` : ''}
                        </div>
                        <p class="text-xs text-slate-400 mt-1 line-clamp-1">${c.desc}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button type="button" onclick="window.adminEditClub(${idx})" 
                            class="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-indigo-200 text-xs font-bold border border-primary/30 transition-all flex items-center gap-1.5">
                        <i class="fas fa-edit text-xs"></i> <span>Edit</span>
                    </button>
                    <button type="button" onclick="window.adminDeleteClub(${idx})" 
                            class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5">
                        <i class="fas fa-trash text-xs"></i> <span>Delete</span>
                    </button>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
}

// Render Activities & Galleries List in Admin
export function renderAdminGalleryList() {
    const container = document.getElementById('admGalleryList');
    if (!container || !window.currentPortfolioData) return;
    
    const data = ensurePortfolioActivities(window.currentPortfolioData);
    
    const techPhotos = data.technicalPhotos || [];
    const cultPhotos = data.culturalPhotos || [];
    const sportsPhotos = data.sportsPhotos || [];
    const totalPhotos = techPhotos.length + cultPhotos.length + sportsPhotos.length;
    
    // Update live counter badges on filter pills if elements exist
    const countAll = document.getElementById('admCount-all');
    const countTech = document.getElementById('admCount-technical');
    const countCult = document.getElementById('admCount-cultural');
    const countSports = document.getElementById('admCount-sports');
    if (countAll) countAll.textContent = totalPhotos;
    if (countTech) countTech.textContent = techPhotos.length;
    if (countCult) countCult.textContent = cultPhotos.length;
    if (countSports) countSports.textContent = sportsPhotos.length;
    
    // Update stat cards
    const mGallery = document.getElementById('admMetricGallery');
    const stGallery = document.getElementById('stMetricGallery');
    if (mGallery) mGallery.textContent = totalPhotos;
    if (stGallery) stGallery.textContent = totalPhotos;
    
    // Build combined list
    const combined = [];
    techPhotos.forEach((p, i) => combined.push({ ...p, category: 'technical', origIndex: i }));
    cultPhotos.forEach((p, i) => combined.push({ ...p, category: 'cultural', origIndex: i }));
    sportsPhotos.forEach((p, i) => combined.push({ ...p, category: 'sports', origIndex: i }));
    
    const filter = AdminState.galleryFilter || 'all';
    const filtered = filter === 'all' ? combined : combined.filter(p => p.category === filter);
    
    if (filtered.length === 0) {
        container.innerHTML = `<div class="sm:col-span-2 lg:col-span-3 p-8 rounded-2xl glass text-center text-slate-400">No photos found in ${filter} category. Add a photo using the form above.</div>`;
        return;
    }
    
    const badgeConfig = {
        technical: { label: 'Technical', color: 'bg-primary/20 text-indigo-300 border-primary/30' },
        cultural: { label: 'Cultural', color: 'bg-secondary/20 text-pink-300 border-secondary/30' },
        sports: { label: 'Sports', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
    };
    
    let html = '';
    filtered.forEach((ph) => {
        const conf = badgeConfig[ph.category] || badgeConfig.technical;
        html += `
            <div class="glass p-4 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 group relative overflow-hidden">
                <div class="relative overflow-hidden rounded-xl h-44 bg-slate-900 border border-white/5">
                    <img src="${ph.src}" alt="${ph.caption}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" onerror="this.src='assets/sakil-profile.jpg'">
                    <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${conf.color}">
                        ${conf.label}
                    </span>
                </div>
                <div>
                    <h5 class="text-xs font-bold text-white line-clamp-2 leading-relaxed" title="${ph.caption}">${ph.caption}</h5>
                    <p class="text-[10px] text-slate-400 truncate mt-1 font-mono">${ph.src}</p>
                </div>
                <div class="flex items-center gap-2 pt-1 border-t border-white/5">
                    <button type="button" onclick="window.adminEditPhoto('${ph.category}', ${ph.origIndex})" 
                            class="flex-1 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-indigo-200 text-xs font-bold border border-primary/30 transition-all flex items-center justify-center gap-1.5">
                        <i class="fas fa-edit text-xs"></i> <span>Edit</span>
                    </button>
                    <button type="button" onclick="window.adminDeletePhoto('${ph.category}', ${ph.origIndex})" 
                            class="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center justify-center">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
}

// Render Admin Inbox List
export function renderAdminInbox() {
    const container = document.getElementById('admInboxList');
    if (!container) return;
    
    const msgs = AdminState.inbox || [];
    if (msgs.length === 0) {
        container.innerHTML = `
            <div class="p-8 rounded-2xl glass text-center text-slate-400">
                <i class="fas fa-inbox text-3xl mb-2 text-slate-500 block"></i>
                <p>No inquiries or leads received yet. Visitor messages will appear here.</p>
            </div>`;
        return;
    }
    
    let html = '';
    msgs.forEach((m) => {
        const dateStr = m.ts ? new Date(m.ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown';
        const emailMatch = (m.c || '').match(/[\w.-]+@[\w.-]+\.\w+/);
        const email = emailMatch ? emailMatch[0] : '';
        
        html += `
            <div class="glass p-6 rounded-2xl border border-white/10 flex flex-col gap-3 relative group">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div>
                        <h4 class="font-bold text-white text-base flex items-center gap-2">
                            <i class="fas fa-user-circle text-primary"></i> ${m.n || 'Anonymous'}
                        </h4>
                        <span class="text-xs text-secondary font-mono">${m.c || 'No contact provided'}</span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-mono">${dateStr}</span>
                </div>
                <p class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${m.b || ''}</p>
                <div class="flex items-center gap-3 pt-2">
                    ${email ? `
                        <a href="mailto:${email}?subject=Reply to your portfolio inquiry&body=Dear ${encodeURIComponent(m.n || '')},%0A%0AThank you for reaching out.%0A%0ARegards,%0AAlkamah Sakilur Rashid"
                           class="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                            <i class="fas fa-reply text-xs"></i> <span>Reply via Email</span>
                        </a>` : ''}
                    <button type="button" onclick="window.adminDeleteMessage('${m.id}')"
                            class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5">
                        <i class="fas fa-trash text-xs"></i> <span>Delete</span>
                    </button>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
}

// Global window bindings for HTML event listeners
window.adminLoginWithGoogle = loginWithGoogle;
window.adminLoginWithEmail = () => {
    const email = document.getElementById('admLoginEmail')?.value;
    const pass = document.getElementById('admLoginPassword')?.value;
    if (!email || !pass) {
        showAdminToast('Please enter both email and password.', 'error');
        return;
    }
    loginWithEmail(email, pass);
};
window.adminLoginWithPasscode = () => {
    const code = document.getElementById('admLoginPasscode')?.value;
    if (!code) {
        showAdminToast('Please enter the passcode.', 'error');
        return;
    }
    return loginWithPasscode(code);
};
window.adminLogout = logoutAdmin;
window.openAdminAuthModal = openAdminAuthModal;
window.closeAdminAuthModal = closeAdminAuthModal;
window.openAdminDashboard = openAdminDashboard;
window.closeAdminDashboard = closeAdminDashboard;
window.toggleAdminView = toggleAdminView;
window.switchAdminTab = switchAdminTab;

// Save Profile Info
window.adminSaveProfile = () => {
    if (!window.currentPortfolioData) return;
    const getVal = id => document.getElementById(id)?.value?.trim() || '';
    
    window.currentPortfolioData.personalInfo.name = getVal('adm_name');
    window.currentPortfolioData.personalInfo.firstName = getVal('adm_firstName');
    window.currentPortfolioData.personalInfo.phone = getVal('adm_phone');
    window.currentPortfolioData.personalInfo.email = getVal('adm_email');
    window.currentPortfolioData.personalInfo.location = getVal('adm_location');
    window.currentPortfolioData.personalInfo.bio = getVal('adm_bio');
    window.currentPortfolioData.personalInfo.profileImage = getVal('adm_profileImg');
    
    const phrasesStr = getVal('adm_phrases');
    if (phrasesStr) {
        window.currentPortfolioData.typingPhrases = phrasesStr.split('\n').map(s => s.trim()).filter(Boolean);
    }
    
    saveToCloud(window.currentPortfolioData);
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
};

// Project CRUD
window.adminSaveProject = () => {
    if (!window.currentPortfolioData) return;
    const getVal = id => document.getElementById(id)?.value?.trim() || '';
    
    const title = getVal('adm_proj_title');
    if (!title) {
        showAdminToast('Project title is required.', 'error');
        return;
    }
    
    const newProj = {
        title: title,
        category: getVal('adm_proj_category') || 'web-dev',
        categoryLabel: getVal('adm_proj_catLabel') || 'Technical Project',
        categoryColor: getVal('adm_proj_catColor') || 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        tech: getVal('adm_proj_tech') || 'Software Engineering',
        desc: getVal('adm_proj_desc') || 'Project description',
        icon: getVal('adm_proj_icon') || 'fas fa-code',
        github: getVal('adm_proj_github'),
        demo: getVal('adm_proj_demo')
    };
    
    if (AdminState.editingProjectIndex >= 0 && window.currentPortfolioData.projects[AdminState.editingProjectIndex]) {
        window.currentPortfolioData.projects[AdminState.editingProjectIndex] = newProj;
        AdminState.editingProjectIndex = -1;
        showAdminToast('Project updated successfully!', 'success');
    } else {
        if (!window.currentPortfolioData.projects) window.currentPortfolioData.projects = [];
        window.currentPortfolioData.projects.unshift(newProj);
        showAdminToast('New project added to portfolio successfully!', 'success');
    }
    
    window.adminCancelProjectEdit();
    saveToCloud(window.currentPortfolioData);
    renderAdminProjectsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
};

window.adminEditProject = (idx) => {
    if (!window.currentPortfolioData || !window.currentPortfolioData.projects || !window.currentPortfolioData.projects[idx]) return;
    const p = window.currentPortfolioData.projects[idx];
    AdminState.editingProjectIndex = idx;
    
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('adm_proj_title', p.title);
    setVal('adm_proj_category', p.category || 'web-dev');
    setVal('adm_proj_catLabel', p.categoryLabel);
    setVal('adm_proj_catColor', p.categoryColor);
    setVal('adm_proj_tech', p.tech);
    setVal('adm_proj_desc', p.desc);
    setVal('adm_proj_icon', p.icon || 'fas fa-code');
    setVal('adm_proj_github', p.github);
    setVal('adm_proj_demo', p.demo);
    
    const titleEl = document.getElementById('admProjectFormTitle');
    if (titleEl) titleEl.innerHTML = `<i class="fas fa-edit text-primary"></i> Edit Project: ${p.title}`;
    
    const btn = document.getElementById('admProjectSubmitBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-check"></i> <span>Save Update</span>';
    
    const cancelBtn = document.getElementById('admProjectCancelBtn');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    
    const card = document.getElementById('admProjectFormCard');
    if (card) card.scrollIntoView({ behavior: 'smooth' });
};

window.adminCancelProjectEdit = () => {
    AdminState.editingProjectIndex = -1;
    ['adm_proj_title', 'adm_proj_catLabel', 'adm_proj_catColor', 'adm_proj_tech', 'adm_proj_desc', 'adm_proj_icon', 'adm_proj_github', 'adm_proj_demo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const titleEl = document.getElementById('admProjectFormTitle');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle text-primary"></i> Add New Project';
    const btn = document.getElementById('admProjectSubmitBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-plus"></i> <span>Add Project</span>';
    const cancelBtn = document.getElementById('admProjectCancelBtn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
};

window.adminDeleteProject = (idx) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    window.currentPortfolioData.projects.splice(idx, 1);
    saveToCloud(window.currentPortfolioData);
    renderAdminProjectsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
    showAdminToast('Project deleted successfully.', 'info');
};

// Club Leadership CRUD
window.adminSaveClub = () => {
    if (!window.currentPortfolioData) return;
    const getVal = id => document.getElementById(id)?.value?.trim() || '';
    
    const club = getVal('adm_club_name');
    if (!club) {
        showAdminToast('Club name is required.', 'error');
        return;
    }
    
    const newClub = {
        club: club,
        role: getVal('adm_club_role') || 'Executive Member',
        prevRole: getVal('adm_club_prevRole') || '',
        date: getVal('adm_club_date') || 'Present',
        icon: getVal('adm_club_icon') || 'fas fa-shield-halved',
        color: getVal('adm_club_color') || 'text-emerald-400',
        borderHover: 'hover:border-emerald-500/50',
        shadowHover: 'group-hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]',
        desc: getVal('adm_club_desc') || ''
    };
    
    if (AdminState.editingClubIndex >= 0 && window.currentPortfolioData.clubs && window.currentPortfolioData.clubs[AdminState.editingClubIndex]) {
        window.currentPortfolioData.clubs[AdminState.editingClubIndex] = newClub;
        showAdminToast('Club information updated successfully!', 'success');
    } else {
        if (!window.currentPortfolioData.clubs) window.currentPortfolioData.clubs = [];
        window.currentPortfolioData.clubs.push(newClub);
        showAdminToast('New club role added successfully!', 'success');
    }
    
    window.adminCancelClubEdit();
    saveToCloud(window.currentPortfolioData);
    renderAdminClubsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
    if (window.updateStandaloneMetrics) window.updateStandaloneMetrics();
};

window.adminEditClub = (idx) => {
    if (!window.currentPortfolioData || !window.currentPortfolioData.clubs || !window.currentPortfolioData.clubs[idx]) return;
    const c = window.currentPortfolioData.clubs[idx];
    AdminState.editingClubIndex = idx;
    
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('adm_club_name', c.club);
    setVal('adm_club_role', c.role);
    setVal('adm_club_prevRole', c.prevRole);
    setVal('adm_club_date', c.date);
    setVal('adm_club_desc', c.desc);
    setVal('adm_club_icon', c.icon || 'fas fa-shield-halved');
    setVal('adm_club_color', c.color || 'text-emerald-400');
    
    const titleEl = document.getElementById('admClubFormTitle');
    if (titleEl) titleEl.innerHTML = `<i class="fas fa-edit text-purple-400"></i> Edit Club Role: ${c.club}`;
    
    const submitBtn = document.getElementById('admClubSubmitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Save Club Update</span>';
        submitBtn.className = 'px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2';
    }
    
    const cancelBtn = document.getElementById('admClubCancelBtn');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    
    const formCard = document.getElementById('admClubFormCard');
    if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
};

window.adminCancelClubEdit = () => {
    AdminState.editingClubIndex = -1;
    ['adm_club_name', 'adm_club_role', 'adm_club_prevRole', 'adm_club_date', 'adm_club_desc', 'adm_club_icon', 'adm_club_color'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    const titleEl = document.getElementById('admClubFormTitle');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-users text-purple-400"></i> Add New Club Leadership Role';
    
    const submitBtn = document.getElementById('admClubSubmitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Save Club Role</span>';
        submitBtn.className = 'px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2';
    }
    
    const cancelBtn = document.getElementById('admClubCancelBtn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
};

window.adminDeleteClub = (idx) => {
    if (!confirm('Are you sure you want to delete this club entry?')) return;
    window.currentPortfolioData.clubs.splice(idx, 1);
    saveToCloud(window.currentPortfolioData);
    renderAdminClubsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
    if (window.updateStandaloneMetrics) window.updateStandaloneMetrics();
    showAdminToast('Club information deleted successfully.', 'info');
};

// Activities Galleries Management (Technical, Cultural, Sports)
window.adminFilterGallery = (filter) => {
    AdminState.galleryFilter = filter;
    
    ['all', 'technical', 'cultural', 'sports'].forEach(f => {
        const btn = document.getElementById(`admGalFilter-${f}`);
        if (btn) {
            if (f === filter) {
                btn.className = 'px-3 py-1 rounded-lg bg-secondary text-white transition-all shadow-sm';
            } else {
                btn.className = 'px-3 py-1 rounded-lg text-slate-400 hover:text-white transition-all';
            }
        }
    });
    
    renderAdminGalleryList();
};

window.adminSavePhoto = () => {
    if (!window.currentPortfolioData) return;
    const data = ensurePortfolioActivities(window.currentPortfolioData);
    
    const getVal = id => document.getElementById(id)?.value?.trim() || '';
    const category = getVal('adm_photo_category') || 'cultural';
    const src = getVal('adm_photo_src');
    const caption = getVal('adm_photo_caption');
    
    if (!src) {
        showAdminToast('Please choose a photo from your device or enter an image link.', 'error');
        return;
    }
    if (!caption) {
        showAdminToast('Please provide a caption for the photo.', 'error');
        return;
    }
    
    const targetArrayKey = category === 'technical' ? 'technicalPhotos' : category === 'sports' ? 'sportsPhotos' : 'culturalPhotos';
    
    if (AdminState.editingPhotoInfo) {
        const oldCat = AdminState.editingPhotoInfo.category;
        const oldIdx = AdminState.editingPhotoInfo.index;
        const oldArrayKey = oldCat === 'technical' ? 'technicalPhotos' : oldCat === 'sports' ? 'sportsPhotos' : 'culturalPhotos';
        
        if (oldCat === category && data[oldArrayKey] && data[oldArrayKey][oldIdx]) {
            data[oldArrayKey][oldIdx] = { src, caption };
        } else {
            if (data[oldArrayKey]) data[oldArrayKey].splice(oldIdx, 1);
            if (!data[targetArrayKey]) data[targetArrayKey] = [];
            data[targetArrayKey].push({ src, caption });
        }
        showAdminToast('Activity photo updated successfully!', 'success');
    } else {
        if (!data[targetArrayKey]) data[targetArrayKey] = [];
        data[targetArrayKey].unshift({ src, caption });
        showAdminToast(`New photo added to ${category} activities gallery!`, 'success');
    }
    
    window.adminCancelPhotoEdit();
    saveToCloud(data);
    renderAdminGalleryList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(data);
    if (window.updateStandaloneMetrics) window.updateStandaloneMetrics();
};

// Update live photo preview UI element
export function updatePhotoPreviewUI(src, name = '', sizeInfo = '') {
    const previewWraps = document.querySelectorAll('#adm_photo_preview_wrap');
    previewWraps.forEach(wrap => {
        if (!src) {
            wrap.classList.add('hidden');
            return;
        }
        wrap.classList.remove('hidden');
        const img = wrap.querySelector('img');
        const nameEl = wrap.querySelector('.photo-preview-name');
        const sizeEl = wrap.querySelector('.photo-preview-size');
        if (img) img.src = src;
        if (nameEl) nameEl.textContent = name || 'Selected Photo';
        if (sizeEl) sizeEl.textContent = sizeInfo || '';
    });
}

/**
 * Automatically compress and optimize an image file using Canvas.
 * Supports files of any size (even 10MB+ from mobile cameras).
 */
export function compressImageFile(file, maxDimension = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve({ dataUrl: '', sizeBytes: 0 });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                let outputType = 'image/jpeg';
                try {
                    const testWebp = canvas.toDataURL('image/webp', quality);
                    if (testWebp.startsWith('data:image/webp')) {
                        outputType = 'image/webp';
                    }
                } catch (ignore) {}
                
                let dataUrl = canvas.toDataURL(outputType, quality);
                let currentQuality = quality;
                let tries = 0;
                
                while (dataUrl.length > 350000 && tries < 4) {
                    currentQuality = Math.max(0.55, currentQuality - 0.1);
                    scale *= 0.85;
                    canvas.width = Math.max(1, Math.round(img.width * scale));
                    canvas.height = Math.max(1, Math.round(img.height * scale));
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    dataUrl = canvas.toDataURL(outputType, currentQuality);
                    tries++;
                }
                
                resolve({
                    dataUrl,
                    width: canvas.width,
                    height: canvas.height,
                    sizeBytes: Math.round(dataUrl.length * 3 / 4)
                });
            };
            img.onerror = () => reject(new Error('Failed to process image file.'));
            img.src = e.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

window.adminEditPhoto = (category, index) => {
    if (!window.currentPortfolioData) return;
    const data = ensurePortfolioActivities(window.currentPortfolioData);
    const arrayKey = category === 'technical' ? 'technicalPhotos' : category === 'sports' ? 'sportsPhotos' : 'culturalPhotos';
    
    if (!data[arrayKey] || !data[arrayKey][index]) return;
    const item = data[arrayKey][index];
    
    AdminState.editingPhotoInfo = { category, index };
    
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('adm_photo_category', category);
    setVal('adm_photo_src', item.src);
    setVal('adm_photo_caption', item.caption);
    
    updatePhotoPreviewUI(item.src, item.caption, item.src.startsWith('data:') ? 'Embedded Photo' : item.src);
    
    const titleEl = document.getElementById('admPhotoFormTitle');
    if (titleEl) titleEl.innerHTML = `<i class="fas fa-edit text-secondary"></i> Edit Activity Photo: ${item.caption}`;
    
    const submitBtn = document.getElementById('admPhotoSubmitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Save Photo Update</span>';
        submitBtn.className = 'px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2';
    }
    
    const cancelBtn = document.getElementById('admPhotoCancelBtn');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    
    const card = document.getElementById('admPhotoFormCard');
    if (card) card.scrollIntoView({ behavior: 'smooth' });
};

window.adminCancelPhotoEdit = () => {
    AdminState.editingPhotoInfo = null;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('adm_photo_src', '');
    setVal('adm_photo_caption', '');
    
    const fileInputs = document.querySelectorAll('#adm_photo_file, input[type="file"][onchange*="adminHandlePhotoUpload"]');
    fileInputs.forEach(inp => { inp.value = ''; });
    
    updatePhotoPreviewUI('', '', '');
    
    const titleEl = document.getElementById('admPhotoFormTitle');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-camera text-secondary"></i> Add Photo to Activities Gallery';
    
    const submitBtn = document.getElementById('admPhotoSubmitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> <span>Add Photo</span>';
        submitBtn.className = 'px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2';
    }
    
    const cancelBtn = document.getElementById('admPhotoCancelBtn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
};

window.adminDeletePhoto = (category, index) => {
    if (!window.currentPortfolioData) return;
    const data = ensurePortfolioActivities(window.currentPortfolioData);
    const arrayKey = category === 'technical' ? 'technicalPhotos' : category === 'sports' ? 'sportsPhotos' : 'culturalPhotos';
    
    if (!confirm(`Are you sure you want to remove this photo from ${category} activities?`)) return;
    
    if (data[arrayKey] && data[arrayKey][index] !== undefined) {
        data[arrayKey].splice(index, 1);
        saveToCloud(data);
        renderAdminGalleryList();
        if (window.renderAllPortfolio) window.renderAllPortfolio(data);
        if (window.updateStandaloneMetrics) window.updateStandaloneMetrics();
        showAdminToast('Photo removed successfully.', 'info');
    }
};

window.adminAddPhoto = window.adminSavePhoto;

// Handle Direct Device Image Upload with Auto-Optimization
window.adminHandlePhotoUpload = async (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    
    showAdminToast('Optimizing photo from your device...', 'info');
    
    try {
        const { dataUrl, sizeBytes } = await compressImageFile(file, 1200, 0.82);
        const origSizeKb = Math.round(file.size / 1024);
        const compSizeKb = Math.round(sizeBytes / 1024);
        
        const srcInput = document.getElementById('adm_photo_src');
        if (srcInput) srcInput.value = dataUrl;
        
        updatePhotoPreviewUI(
            dataUrl, 
            file.name, 
            `Auto-Optimized: ${compSizeKb} KB (Reduced from ${origSizeKb} KB)`
        );
        
        showAdminToast(`Photo ready! (${compSizeKb} KB) Enter caption and click "Save Photo".`, 'success');
    } catch (err) {
        console.error('Image processing error:', err);
        showAdminToast('Could not process this image file. Please try another.', 'error');
    }
};

// Clear currently selected image upload
window.adminClearPhotoUpload = () => {
    const srcInput = document.getElementById('adm_photo_src');
    if (srcInput) srcInput.value = '';
    const fileInputs = document.querySelectorAll('#adm_photo_file, input[type="file"][onchange*="adminHandlePhotoUpload"]');
    fileInputs.forEach(inp => { inp.value = ''; });
    updatePhotoPreviewUI('', '', '');
    showAdminToast('Photo selection cleared.', 'info');
};

// Message Actions
window.adminDeleteMessage = deleteInboxMessage;
window.adminRefreshInbox = loadInboxMessages;

// Backup Actions
window.adminExportBackup = () => {
    if (window.currentPortfolioData) {
        exportPortfolioBackup(window.currentPortfolioData);
    }
};

window.adminImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported && imported.personalInfo) {
                const resolved = ensurePortfolioActivities(imported);
                window.currentPortfolioData = resolved;
                saveToCloud(resolved);
                if (window.renderAllPortfolio) window.renderAllPortfolio(resolved);
                renderAdminDashboard();
                showAdminToast('Backup restored successfully!', 'success');
            } else {
                showAdminToast('Invalid backup file format.', 'error');
            }
        } catch (err) {
            showAdminToast('Failed to parse JSON backup file.', 'error');
        }
    };
    reader.readAsText(file);
};

window.adminResetToFactory = () => {
    if (confirm('Are you sure you want to reset the entire portfolio to factory defaults? All unsynced local modifications will be lost.')) {
        localStorage.removeItem(DATA_STORAGE_KEY);
        location.reload();
    }
};

// Master Passcode Change
window.adminChangePasscode = () => {
    const newPin = prompt('Enter new master passcode (minimum 6 characters):');
    if (newPin && newPin.trim().length >= 6) {
        localStorage.setItem(PASSCODE_STORAGE_KEY, newPin.trim());
        showAdminToast('Master passcode updated successfully!', 'success');
    } else if (newPin) {
        showAdminToast('Passcode must be at least 6 characters.', 'error');
    }
};

// Cloud message & Save bindings
window.adminSaveMessageToCloud = saveMessageToCloud;
window.adminSaveToCloud = () => {
    if (window.currentPortfolioData) {
        saveToCloud(window.currentPortfolioData);
    }
};

// Keyboard Shortcut: Ctrl + Shift + A to open Admin
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        toggleAdminView();
    }
});

// Auto-check URL hash for #admin
window.addEventListener('load', () => {
    if (window.location.hash === '#admin') {
        setTimeout(toggleAdminView, 500);
    }
});
