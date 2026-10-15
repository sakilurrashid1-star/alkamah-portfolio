/**
 * Alkamah Sakilur Rashid Portfolio — Admin System & Firebase Integration
 * 
 * Secure Authentication, Full Access Control Panel & Real-time Cloud Sync
 * Matching Giri Sompriti Architecture with Google Sign-in & Master Passcode
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

// Firebase Configuration (Matching Giri Sompriti)
const firebaseConfig = {
    apiKey: "AIzaSyBNlW4HX4Am295kuirFvBy7dblCbSuigI4",
    authDomain: "giri-somprity.firebaseapp.com",
    projectId: "giri-somprity",
    storageBucket: "giri-somprity.firebasestorage.app",
    messagingSenderId: "582709873059",
    appId: "1:582709873059:web:2b5d308f148be0594eb216"
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

// Admin State
export const AdminState = {
    isAdmin: false,
    user: null,
    authMethod: null, // 'google', 'email', 'passcode'
    activeTab: 'dashboard',
    inbox: [],
    editingProjectIndex: -1,
    editingClubIndex: -1
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
window.handleSecretLogoClick = handleSecretLogoClick;


// Authentication Listeners
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
            // Check if passcode session was active
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
    // 1. Try LocalStorage first (instant)
    const local = localStorage.getItem(DATA_STORAGE_KEY);
    let resolvedData = currentData;
    
    if (local) {
        try {
            const parsed = JSON.parse(local);
            resolvedData = { ...currentData, ...parsed };
        } catch (e) {
            console.warn('LocalStorage parse error:', e);
        }
    }
    
    // 2. Fetch from Firebase Firestore if available
    if (isFirebaseReady) {
        try {
            const siteDoc = await getDoc(doc(db, 'site', 'portfolio'));
            if (siteDoc.exists()) {
                const cloudData = siteDoc.data();
                resolvedData = { ...resolvedData, ...cloudData };
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
    // 1. Save to LocalStorage immediately
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(portfolioData));
    
    // 2. If Firebase and Admin, save to Firestore
    if (isFirebaseReady && AdminState.isAdmin && AdminState.user) {
        try {
            await setDoc(doc(db, 'site', 'portfolio'), portfolioData, { merge: true });
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
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

// Toggle View Helper
export function toggleAdminView() {
    if (AdminState.isAdmin) {
        openAdminDashboard();
    } else {
        openAdminAuthModal();
    }
}

// Switch Tab inside Admin Dashboard
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
}

// Render Admin Dashboard Data
export function renderAdminDashboard() {
    if (!window.currentPortfolioData) return;
    const data = window.currentPortfolioData;
    
    // Overview Metrics
    const mProjects = document.getElementById('admMetricProjects');
    const mClubs = document.getElementById('admMetricClubs');
    const mGallery = document.getElementById('admMetricGallery');
    const mInbox = document.getElementById('admMetricInbox');
    
    if (mProjects) mProjects.textContent = data.projects ? data.projects.length : 0;
    if (mClubs) mClubs.textContent = data.clubs ? data.clubs.length : 0;
    if (mGallery) mGallery.textContent = data.culturalPhotos ? data.culturalPhotos.length : 0;
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
    
    // Populate Projects Tab
    renderAdminProjectsList();
    
    // Populate Clubs Tab
    renderAdminClubsList();
    
    // Populate Gallery Tab
    renderAdminGalleryList();
    
    // Populate Inbox Tab
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
    let html = '';
    
    clubs.forEach((c, idx) => {
        html += `
            <div class="glass p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${c.color || 'text-white'} border border-white/10 shrink-0">
                        <i class="${c.icon || 'fas fa-users'}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-white text-base">${c.club}</h4>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs font-bold ${c.color || 'text-white'}">${c.role}</span>
                            <span class="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-white/5">${c.date}</span>
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

// Render Cultural Gallery List in Admin
export function renderAdminGalleryList() {
    const container = document.getElementById('admGalleryList');
    if (!container || !window.currentPortfolioData) return;
    
    const photos = window.currentPortfolioData.culturalPhotos || [];
    let html = '';
    
    photos.forEach((ph, idx) => {
        html += `
            <div class="glass p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <img src="${ph.src}" alt="${ph.caption}" class="w-20 h-16 object-cover rounded-xl border border-white/10 shrink-0" onerror="this.src='assets/sakil-profile.jpg'">
                <div class="flex-1 min-w-0">
                    <h5 class="text-xs font-bold text-white truncate">${ph.caption}</h5>
                    <p class="text-[10px] text-slate-400 truncate mt-0.5">${ph.src}</p>
                </div>
                <button type="button" onclick="window.adminDeletePhoto(${idx})" 
                        class="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all">
                    <i class="fas fa-trash"></i>
                </button>
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
    loginWithPasscode(code);
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
    const getVal = id => document.getElementById(id)?.value.trim() || '';
    
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
    const getVal = id => document.getElementById(id)?.value.trim() || '';
    
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
    
    if (AdminState.editingProjectIndex >= 0) {
        window.currentPortfolioData.projects[AdminState.editingProjectIndex] = newProj;
        AdminState.editingProjectIndex = -1;
        document.getElementById('admProjectFormTitle').textContent = 'Add New Project';
        document.getElementById('admProjectSubmitBtn').textContent = 'Add Project';
        showAdminToast('Project updated successfully!', 'success');
    } else {
        window.currentPortfolioData.projects.unshift(newProj);
        showAdminToast('New project added to portfolio successfully!', 'success');
    }
    
    // Clear form
    ['adm_proj_title', 'adm_proj_tech', 'adm_proj_desc', 'adm_proj_github', 'adm_proj_demo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    saveToCloud(window.currentPortfolioData);
    renderAdminProjectsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
};

window.adminEditProject = (idx) => {
    if (!window.currentPortfolioData || !window.currentPortfolioData.projects[idx]) return;
    const p = window.currentPortfolioData.projects[idx];
    AdminState.editingProjectIndex = idx;
    
    document.getElementById('adm_proj_title').value = p.title || '';
    document.getElementById('adm_proj_category').value = p.category || 'web-dev';
    document.getElementById('adm_proj_catLabel').value = p.categoryLabel || '';
    document.getElementById('adm_proj_catColor').value = p.categoryColor || '';
    document.getElementById('adm_proj_tech').value = p.tech || '';
    document.getElementById('adm_proj_desc').value = p.desc || '';
    document.getElementById('adm_proj_icon').value = p.icon || 'fas fa-code';
    document.getElementById('adm_proj_github').value = p.github || '';
    document.getElementById('adm_proj_demo').value = p.demo || '';
    
    document.getElementById('admProjectFormTitle').textContent = `Edit Project: ${p.title}`;
    document.getElementById('admProjectSubmitBtn').textContent = 'Save Update';
    document.getElementById('admProjectFormCard').scrollIntoView({ behavior: 'smooth' });
};

window.adminDeleteProject = (idx) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    window.currentPortfolioData.projects.splice(idx, 1);
    saveToCloud(window.currentPortfolioData);
    renderAdminProjectsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
    showAdminToast('Project deleted successfully.', 'info');
};

// Club CRUD
window.adminSaveClub = () => {
    if (!window.currentPortfolioData) return;
    const getVal = id => document.getElementById(id)?.value.trim() || '';
    
    const club = getVal('adm_club_name');
    if (!club) {
        showAdminToast('Club name is required.', 'error');
        return;
    }
    
    const newClub = {
        club: club,
        role: getVal('adm_club_role') || 'Executive Member',
        prevRole: getVal('adm_club_prevRole'),
        date: getVal('adm_club_date') || 'Present',
        icon: getVal('adm_club_icon') || 'fas fa-shield-halved',
        color: getVal('adm_club_color') || 'text-emerald-400',
        borderHover: 'hover:border-emerald-500/50',
        shadowHover: 'group-hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]',
        desc: getVal('adm_club_desc') || ''
    };
    
    if (AdminState.editingClubIndex >= 0) {
        window.currentPortfolioData.clubs[AdminState.editingClubIndex] = newClub;
        AdminState.editingClubIndex = -1;
        document.getElementById('admClubFormTitle').textContent = 'Add New Club Leadership Role';
        document.getElementById('admClubSubmitBtn').textContent = 'Save Club';
        showAdminToast('Club information updated successfully!', 'success');
    } else {
        window.currentPortfolioData.clubs.push(newClub);
        showAdminToast('New club role added successfully!', 'success');
    }
    
    ['adm_club_name', 'adm_club_role', 'adm_club_prevRole', 'adm_club_date', 'adm_club_desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    saveToCloud(window.currentPortfolioData);
    renderAdminClubsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
};

window.adminEditClub = (idx) => {
    if (!window.currentPortfolioData || !window.currentPortfolioData.clubs[idx]) return;
    const c = window.currentPortfolioData.clubs[idx];
    AdminState.editingClubIndex = idx;
    
    document.getElementById('adm_club_name').value = c.club || '';
    document.getElementById('adm_club_role').value = c.role || '';
    document.getElementById('adm_club_prevRole').value = c.prevRole || '';
    document.getElementById('adm_club_date').value = c.date || '';
    document.getElementById('adm_club_desc').value = c.desc || '';
    document.getElementById('adm_club_icon').value = c.icon || 'fas fa-shield-halved';
    document.getElementById('adm_club_color').value = c.color || 'text-emerald-400';
    
    document.getElementById('admClubFormTitle').textContent = `Edit Club: ${c.club}`;
    document.getElementById('admClubSubmitBtn').textContent = 'Save Update';
    document.getElementById('admClubFormCard').scrollIntoView({ behavior: 'smooth' });
};

window.adminDeleteClub = (idx) => {
    if (!confirm('Are you sure you want to delete this club entry?')) return;
    window.currentPortfolioData.clubs.splice(idx, 1);
    saveToCloud(window.currentPortfolioData);
    renderAdminClubsList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
    showAdminToast('Club information deleted successfully.', 'info');
};

// Gallery Photo Management
window.adminAddPhoto = () => {
    if (!window.currentPortfolioData) return;
    const src = document.getElementById('adm_photo_src')?.value.trim();
    const caption = document.getElementById('adm_photo_caption')?.value.trim() || 'Pohela Boishakh Celebration';
    
    if (!src) {
        showAdminToast('Please enter the image URL or path.', 'error');
        return;
    }
    
    if (!window.currentPortfolioData.culturalPhotos) {
        window.currentPortfolioData.culturalPhotos = [];
    }
    
    window.currentPortfolioData.culturalPhotos.push({ src, caption });
    document.getElementById('adm_photo_src').value = '';
    document.getElementById('adm_photo_caption').value = '';
    
    saveToCloud(window.currentPortfolioData);
    renderAdminGalleryList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
    showAdminToast('New photo added to gallery successfully!', 'success');
};

window.adminDeletePhoto = (idx) => {
    if (!confirm('Are you sure you want to remove this photo from the gallery?')) return;
    window.currentPortfolioData.culturalPhotos.splice(idx, 1);
    saveToCloud(window.currentPortfolioData);
    renderAdminGalleryList();
    if (window.renderAllPortfolio) window.renderAllPortfolio(window.currentPortfolioData);
    showAdminToast('Photo removed successfully.', 'info');
};

// Handle Image File Upload directly to DataURL
window.adminHandlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        showAdminToast('Image file exceeds 2 MB. Please upload an optimized image.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('adm_photo_src').value = e.target.result;
        showAdminToast('Photo loaded! Enter caption and click "Add Photo".', 'success');
    };
    reader.readAsDataURL(file);
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
            if (imported && imported.personalInfo && imported.projects) {
                window.currentPortfolioData = imported;
                saveToCloud(imported);
                if (window.renderAllPortfolio) window.renderAllPortfolio(imported);
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

