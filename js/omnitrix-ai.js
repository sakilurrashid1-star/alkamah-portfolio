/**
 * Omnitrix AI Assistant — Ben 10 Cartoon Style Virtual Guide for Alkamah's Portfolio
 * 
 * Features:
 * - Iconic Ben 10 Omnitrix dial widget with glowing alien neon green HUD
 * - 5 Alien Persona Modes: Omni (Classic Hero), Grey Matter (Deep Tech/Cyber), 
 *   XLR8 (Lightning Summary), Four Arms (Leadership & Strengths), Upgrade (Code/Full-Stack)
 * - Native Web Audio API futuristic Ben 10 SFX (no external audio assets required)
 * - Full knowledge base of Alkamah Sakilur Rashid's bio, skills, leadership, projects, and contact
 * - Interactive action chips & clickable in-chat links
 */

(function () {
    // -------------------------------------------------------------------------
    // 1. Audio Engine (Native Web Audio API Synth for Ben 10 Sci-Fi SFX)
    // -------------------------------------------------------------------------
    let audioCtx = null;
    let sfxEnabled = true;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playOmnitrixSfx(type) {
        if (!sfxEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            if (type === 'open') {
                // Omnitrix Pop-Up Dial Chirp
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
                osc.frequency.exponentialRampToValueAtTime(1320, now + 0.32);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'beep') {
                // Futuristic Alien UI Tap
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1050, now);
                osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.09);
            } else if (type === 'transform') {
                // Alien Mode Transformation Sweep
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.linearRampToValueAtTime(750, now + 0.15);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);
                gain.gain.setValueAtTime(0.14, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.42);
            }
        } catch (e) {
            // Audio policy fallback
        }
    }

    // -------------------------------------------------------------------------
    // 2. Knowledge Base & Persona Engines
    // -------------------------------------------------------------------------
    const ALKAMAH_DATA = {
        name: "Alkamah Sakilur Rashid",
        shortName: "Alkamah",
        title: "Cybersecurity SOC Specialist & Full-Stack Developer",
        education: "B.Sc. in Computer Science & Engineering at Presidency University (Dhaka, Bangladesh)",
        contacts: {
            email: "sakilurrashid1@gmail.com",
            phone: "+8801329544365",
            whatsapp: "https://wa.me/8801329544365",
            linkedin: "https://www.linkedin.com/in/alkamah-sakilur-rashid-70855b42a",
            github: "https://github.com/sakilurrashid1-star"
        },
        skills: {
            cyber: "PCAP/Wireshark Analysis, MITRE ATT&CK Framework, Threat Triage & Incident Handling, Network Traffic Auditing, JWT Security",
            ml: "Machine Learning Intrusion Detection, Multiclass Threat Classification, Data Preprocessing, Scikit-learn",
            coding: "Python (Advanced), C, C++, Java, JavaScript (ES6+)",
            web: "React.js, Node.js, Express.js, MongoDB Atlas, HTML5 Canvas, Tailwind CSS, REST APIs"
        },
        leadership: [
            "Vice President — Presidency University Cyber Security Club (PUCSC)",
            "Vice President — Presidency University Theatre Club (PUTC)",
            "Former General Secretary — Presidency University Cultural Club (PUCC)",
            "Executive Member — Presidency University Photography Society (PUPS)"
        ],
        projects: [
            {
                name: "Machine Learning-Based Multiclass Network Intrusion Detection",
                desc: "High-accuracy cyber threat classification system trained on network PCAP telemetry with live confusion matrix and ROC evaluations.",
                tech: "Python, Scikit-Learn, Pandas, PCAP Analysis",
                github: "https://github.com/sakilurrashid1-star"
            },
            {
                name: "Giri-Sompriti Cultural Preservation Platform",
                desc: "Full-stack web application preserving indigenous heritage with dual-sync Cloud Firestore backend and Google authentication.",
                tech: "Firebase Auth, Cloud Firestore, JavaScript, Tailwind CSS",
                github: "https://github.com/sakilurrashid1-star"
            },
            {
                name: "Personal Portfolio & Admin Control Cockpit",
                desc: "Interactive developer portfolio with client-side canvas photo auto-compression, Google OAuth, and real-time Firestore synchronization.",
                tech: "HTML5, Tailwind, Firebase Firestore, ES Modules"
            }
        ],
        activities: {
            technical: "Workshops on ethical hacking, network analysis, PCAP packet inspection, and competitive programming.",
            cultural: "Pohela Boishakh celebrations at Presidency University, stage dramas, musical performance coordination.",
            sports: "Presidency University CSE Football Tournaments, championship trophies, and runner-up medals."
        }
    };

    let activePersona = 'omni'; // 'omni' | 'greyMatter' | 'xlr8' | 'fourArms' | 'upgrade'

    const PERSONAS = {
        omni: {
            name: "Omnitrix Core",
            alien: "Omni-Hero",
            icon: "fas fa-bolt",
            color: "#00ff66",
            badge: "HERO MODE",
            intro: "It's Hero Time! ⚡ I am the Omnitrix AI Assistant. Ask me anything about Alkamah Sakilur Rashid—his cybersecurity skills, university leadership, projects, or how to get in touch!"
        },
        greyMatter: {
            name: "Grey Matter",
            alien: "Galvan Intellect",
            icon: "fas fa-brain",
            color: "#38bdf8",
            badge: "DEEP INTELLECT",
            intro: "Galvan neural link established. 🧠 I provide high-precision technical evaluations of Alkamah's cybersecurity, packet analysis, and machine learning architectures."
        },
        xlr8: {
            name: "XLR8",
            alien: "Kineceleran",
            icon: "fas fa-gauge-high",
            color: "#22d3ee",
            badge: "HIGH SPEED",
            intro: "Zooming in at Mach 5! ⚡ Need lightning-fast summaries of Alkamah's background and achievements? You got it!"
        },
        fourArms: {
            name: "Four Arms",
            alien: "Tetramand",
            icon: "fas fa-dumbbell",
            color: "#f87171",
            badge: "STRENGTH & LEADERSHIP",
            intro: "Raw power and commanding presence! 💪 Ask me about Alkamah's executive leadership across 4 major student clubs at Presidency University!"
        },
        upgrade: {
            name: "Upgrade",
            alien: "Galvanic Mechamorph",
            icon: "fas fa-microchip",
            color: "#a855f7",
            badge: "CODE & FULL-STACK",
            intro: "Upgrading systems. 🔮 Merged with Alkamah's digital repositories, tech stacks, and cloud architectures. What code shall we inspect?"
        }
    };

    // -------------------------------------------------------------------------
    // 3. Intelligent Response Generator
    // -------------------------------------------------------------------------
    function generateOmniResponse(rawInput) {
        const query = (rawInput || '').toLowerCase().trim();
        const p = PERSONAS[activePersona];

        // 1. Easter Eggs & Ben 10 Lore
        if (query.includes('ben 10') || query.includes('omnitrix') || query.includes('vilgax') || query.includes('alien') || query.includes('hero time')) {
            return `
                <p class="font-bold text-[#00ff66] mb-1">⚡ "IT'S HERO TIME!"</p>
                <p>The Omnitrix has calibrated its DNA scanner onto <strong>Alkamah Sakilur Rashid</strong>! He doesn't turn into Heatblast, but his <strong>Cybersecurity SOC reflexes</strong> and <strong>Full-Stack powers</strong> are just as legendary!</p>
                <p class="mt-2 text-xs text-slate-300">Switch my alien modes above (like <em>Grey Matter</em> for deep tech or <em>XLR8</em> for fast facts) to experience different perspectives!</p>
            `;
        }

        // 2. Who is Alkamah / Bio / Background
        if (query.includes('who is') || query.includes('about') || query.includes('intro') || query.includes('background') || query.includes('tell me about')) {
            if (activePersona === 'xlr8') {
                return `
                    <p class="font-bold text-[#22d3ee] mb-1">⚡ XLR8 Flash Profile:</p>
                    <ul class="space-y-1 text-xs">
                        <li>• <strong>Name:</strong> Alkamah Sakilur Rashid</li>
                        <li>• <strong>Studies:</strong> Computer Science @ Presidency University</li>
                        <li>• <strong>Core Domain:</strong> Cybersecurity SOC Analysis & Full-Stack Web</li>
                        <li>• <strong>Leadership:</strong> VP of PU Cyber Security Club & PU Theatre Club</li>
                        <li>• <strong>Location:</strong> Gulshan, Dhaka, Bangladesh</li>
                    </ul>
                `;
            }
            if (activePersona === 'greyMatter') {
                return `
                    <p class="font-bold text-[#38bdf8] mb-1">🧠 Galvanic Biographical Scan:</p>
                    <p>Subject <strong>Alkamah Sakilur Rashid</strong> is a high-caliber Computer Science student at Presidency University. His cognitive matrix demonstrates significant specialization in <strong>Network Intrusion Triage</strong>, <strong>Wireshark Packet Telemetry</strong>, and <strong>Supervised Machine Learning classification</strong>.</p>
                `;
            }
            return `
                <p class="font-bold text-[#00ff66] mb-1">🛡️ Meet Alkamah Sakilur Rashid</p>
                <p>Alkamah is a passionate <strong>Computer Science student at Presidency University</strong> based in Dhaka, Bangladesh. He pairs practical defense expertise in <strong>Cybersecurity SOC operations</strong> with robust <strong>Full-Stack engineering</strong> skills.</p>
                <p class="mt-2 text-xs text-slate-300">He is also deeply involved in student leadership as the Vice President of the <em>PU Cyber Security Club</em> and <em>PU Theatre Club</em>!</p>
            `;
        }

        // 3. Cybersecurity & SOC
        if (query.includes('cyber') || query.includes('security') || query.includes('soc') || query.includes('pcap') || query.includes('wireshark') || query.includes('threat') || query.includes('mitre')) {
            return `
                <p class="font-bold text-[#00ff66] mb-1"><i class="fas fa-shield-halved text-emerald-400 mr-1"></i> Cybersecurity & SOC Capabilities</p>
                <p>Alkamah is trained in proactive threat detection and incident triage:</p>
                <ul class="mt-2 space-y-1.5 text-xs text-slate-300">
                    <li>🔹 <strong>Network Investigation:</strong> Deep PCAP packet capture inspection via Wireshark and TCP/IP stream reconstruction.</li>
                    <li>🔹 <strong>Frameworks:</strong> Mapping adversary tactics and techniques using the <strong>MITRE ATT&CK</strong> framework.</li>
                    <li>🔹 <strong>Threat Detection:</strong> Building automated Machine Learning classifiers for multiclass network intrusion detection.</li>
                    <li>🔹 <strong>Authentication Security:</strong> Hardening token-based auth flows (JWT), role-based access control, and Firestore rules.</li>
                </ul>
            `;
        }

        // 4. Skills & Tech Stack
        if (query.includes('skill') || query.includes('stack') || query.includes('tech') || query.includes('program') || query.includes('language') || query.includes('python')) {
            if (activePersona === 'upgrade') {
                return `
                    <p class="font-bold text-[#a855f7] mb-1">🔮 Upgrade System Diagnostics (Tech Stack):</p>
                    <div class="space-y-1 text-xs">
                        <p><strong class="text-white">Languages:</strong> Python (Advanced), C, C++, Java, JavaScript (ES6+)</p>
                        <p><strong class="text-white">Security:</strong> Wireshark, PCAP Telemetry, Threat Triage, MITRE ATT&CK</p>
                        <p><strong class="text-white">Frontend:</strong> React.js, Tailwind CSS, HTML5 Canvas, Responsive UI</p>
                        <p><strong class="text-white">Backend & Cloud:</strong> Node.js, Express, MongoDB Atlas, Firebase Firestore</p>
                    </div>
                `;
            }
            return `
                <p class="font-bold text-[#00ff66] mb-1">⚙️ Alkamah's Technical Arsenal</p>
                <p>Here are his core competencies across security and software engineering:</p>
                <div class="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div class="bg-white/5 p-2 rounded-lg border border-white/10">
                        <p class="font-bold text-emerald-400">Cybersecurity</p>
                        <p class="text-[11px] text-slate-300">Wireshark, PCAP, SOC Triage, MITRE ATT&CK</p>
                    </div>
                    <div class="bg-white/5 p-2 rounded-lg border border-white/10">
                        <p class="font-bold text-cyan-400">Languages</p>
                        <p class="text-[11px] text-slate-300">Python, C, C++, Java, JavaScript</p>
                    </div>
                    <div class="bg-white/5 p-2 rounded-lg border border-white/10">
                        <p class="font-bold text-purple-400">Web & Cloud</p>
                        <p class="text-[11px] text-slate-300">React, Node, Express, Firebase Firestore</p>
                    </div>
                    <div class="bg-white/5 p-2 rounded-lg border border-white/10">
                        <p class="font-bold text-amber-400">Machine Learning</p>
                        <p class="text-[11px] text-slate-300">Intrusion Detection, Scikit-learn, Pandas</p>
                    </div>
                </div>
            `;
        }

        // 5. Leadership & University Clubs
        if (query.includes('club') || query.includes('leadership') || query.includes('presidency') || query.includes('pucsc') || query.includes('putc') || query.includes('pucc') || query.includes('pups') || query.includes('university') || query.includes('role')) {
            return `
                <p class="font-bold text-[#f87171] mb-1">💪 Four Arms Leadership Breakdown</p>
                <p>Alkamah commands key executive leadership responsibilities at <strong>Presidency University</strong>:</p>
                <ul class="mt-2 space-y-1.5 text-xs text-slate-300">
                    <li>🏛️ <strong>PU Cyber Security Club (PUCSC):</strong> Vice President — Organizing workshops, hackathons, and security awareness.</li>
                    <li>🎭 <strong>PU Theatre Club (PUTC):</strong> Vice President — Spearheading annual productions, drama rehearsals, and team coordination.</li>
                    <li>🎨 <strong>PU Cultural Club (PUCC):</strong> Former General Secretary — Managed major university-wide cultural celebrations.</li>
                    <li>📷 <strong>PU Photography Society (PUPS):</strong> Executive Member — Documenting campus events and visual storytelling.</li>
                </ul>
            `;
        }

        // 6. Projects & GitHub
        if (query.includes('project') || query.includes('github') || query.includes('repo') || query.includes('build') || query.includes('work') || query.includes('code')) {
            return `
                <p class="font-bold text-[#00ff66] mb-1">🚀 Flagship Projects</p>
                <div class="space-y-2 mt-2 text-xs">
                    <div class="bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <h5 class="font-bold text-white">1. ML Network Intrusion Detection</h5>
                        <p class="text-slate-300 text-[11px] mt-0.5">Machine Learning model classifying malicious attacks from network PCAP flow statistics with high accuracy.</p>
                    </div>
                    <div class="bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <h5 class="font-bold text-white">2. Giri-Sompriti Web Application</h5>
                        <p class="text-slate-300 text-[11px] mt-0.5">Cultural heritage repository platform powered by Firebase Auth, Cloud Firestore, and responsive design.</p>
                    </div>
                    <div class="bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <h5 class="font-bold text-white">3. Portfolio CMS & Admin Cockpit</h5>
                        <p class="text-slate-300 text-[11px] mt-0.5">In-browser CMS with canvas photo compression, multi-factor admin login, and dual real-time Firestore sync.</p>
                    </div>
                </div>
                <div class="mt-3">
                    <a href="https://github.com/sakilurrashid1-star" target="_blank" rel="noopener noreferrer" 
                       class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all">
                        <i class="fab fa-github"></i> Open GitHub Profile
                    </a>
                </div>
            `;
        }

        // 7. Contact / Hire / Message
        if (query.includes('contact') || query.includes('hire') || query.includes('email') || query.includes('phone') || query.includes('whatsapp') || query.includes('message') || query.includes('reach')) {
            return `
                <p class="font-bold text-[#00ff66] mb-1">📬 Connect with Alkamah</p>
                <p>Looking to collaborate, recruit, or discuss a project? Here are his direct channels:</p>
                <div class="space-y-1.5 mt-2 text-xs">
                    <p>📧 <strong>Email:</strong> <a href="mailto:sakilurrashid1@gmail.com" class="text-emerald-400 hover:underline">sakilurrashid1@gmail.com</a></p>
                    <p>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/8801329544365" target="_blank" class="text-emerald-400 hover:underline">+880 1329-544365</a></p>
                    <p>💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/alkamah-sakilur-rashid-70855b42a" target="_blank" class="text-emerald-400 hover:underline">View Profile</a></p>
                </div>
                <div class="mt-3 flex gap-2">
                    <button type="button" onclick="document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}); window.omnitrixClose();" 
                            class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md">
                        <i class="fas fa-paper-plane mr-1"></i> Send a Message
                    </button>
                </div>
            `;
        }

        // 8. Resume / CV
        if (query.includes('resume') || query.includes('cv') || query.includes('download')) {
            return `
                <p class="font-bold text-[#00ff66] mb-1">📄 Curriculum Vitae (CV)</p>
                <p>You can inspect or print Alkamah's complete resume directly:</p>
                <div class="mt-3 flex gap-2">
                    <button type="button" onclick="if(window.openResumeModal){window.openResumeModal();} window.omnitrixClose();" 
                            class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all shadow-md">
                        <i class="fas fa-file-arrow-down mr-1"></i> Open Full Resume
                    </button>
                </div>
            `;
        }

        // 9. Activities (Cultural, Sports, Technical)
        if (query.includes('activit') || query.includes('cultural') || query.includes('sport') || query.includes('football') || query.includes('pohela') || query.includes('boishakh') || query.includes('theatre')) {
            return `
                <p class="font-bold text-[#00ff66] mb-1">🏆 Campus Life & Activities</p>
                <p>Alkamah balances technical rigor with rich campus participation:</p>
                <ul class="mt-2 space-y-1.5 text-xs text-slate-300">
                    <li>⚽ <strong>Sports:</strong> Active striker/player in Presidency University CSE Football Tournaments, earning championship and runner-up trophies.</li>
                    <li>🎭 <strong>Cultural Celebrations:</strong> Leading event management and performances at Pohela Boishakh festivals.</li>
                    <li>💻 <strong>Technical Seminars:</strong> Conducting and attending student workshops on cybersecurity defenses.</li>
                </ul>
            `;
        }

        // Default / Fallback
        return `
            <p class="font-bold text-[#00ff66] mb-1">👽 Omnitrix Query Processed</p>
            <p>I scanned the galvanic database for: <em>"${escapeHtml(rawInput)}"</em>.</p>
            <p class="mt-2 text-xs text-slate-300">You can ask me anything about Alkamah, such as:</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
                <button type="button" onclick="window.omnitrixAsk('Tell me about Alkamah')" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-emerald-400">Who is he?</button>
                <button type="button" onclick="window.omnitrixAsk('What are his cybersecurity skills?')" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-cyan-400">Cybersecurity</button>
                <button type="button" onclick="window.omnitrixAsk('Tell me about his university leadership')" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-pink-400">Club Roles</button>
                <button type="button" onclick="window.omnitrixAsk('How can I contact or hire him?')" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-amber-400">Contact</button>
            </div>
        `;
    }

    function escapeHtml(text) {
        return (text || '').replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }

    // -------------------------------------------------------------------------
    // 4. Inject UI Components & CSS
    // -------------------------------------------------------------------------
    function injectOmnitrixStyles() {
        const style = document.createElement('style');
        style.id = 'omnitrix-ai-styles';
        style.innerHTML = `
            /* Ben 10 Omnitrix Glow & Animations */
            @keyframes omnitrixPulse {
                0%, 100% {
                    box-shadow: 0 0 15px rgba(0, 255, 102, 0.4), inset 0 0 10px rgba(0, 255, 102, 0.2);
                    border-color: #00ff66;
                }
                50% {
                    box-shadow: 0 0 35px rgba(0, 255, 102, 0.8), inset 0 0 20px rgba(0, 255, 102, 0.5);
                    border-color: #34d399;
                }
            }
            @keyframes omnitrixSpinRing {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes omnitrixHoloScan {
                0% { background-position: 0% 0%; }
                100% { background-position: 0% 100%; }
            }
            .omnitrix-dial-btn {
                animation: omnitrixPulse 2.8s infinite ease-in-out;
            }
            .omnitrix-holo-panel {
                background: linear-gradient(180deg, rgba(5, 15, 10, 0.96) 0%, rgba(3, 7, 18, 0.98) 100%);
                border: 2px solid rgba(0, 255, 102, 0.35);
                box-shadow: 0 0 40px rgba(0, 255, 102, 0.25), 0 25px 50px -12px rgba(0, 0, 0, 0.7);
            }
            .omnitrix-scanline {
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 255, 102, 0.04) 50%);
                background-size: 100% 4px;
            }
            .omnitrix-bubble-ai {
                background: rgba(6, 30, 16, 0.75);
                border: 1px solid rgba(0, 255, 102, 0.3);
                box-shadow: 0 0 12px rgba(0, 255, 102, 0.1);
            }
            .omnitrix-bubble-user {
                background: rgba(30, 41, 59, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.12);
            }
            .omnitrix-custom-scrollbar::-webkit-scrollbar {
                width: 5px;
            }
            .omnitrix-custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(0, 255, 102, 0.3);
                border-radius: 9999px;
            }
            .omnitrix-custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 255, 102, 0.6);
            }
        `;
        document.head.appendChild(style);
    }

    function injectOmnitrixMarkup() {
        if (document.getElementById('omnitrixContainer')) return;

        const container = document.createElement('div');
        container.id = 'omnitrixContainer';
        container.innerHTML = `
            <!-- FLOATING BEN 10 CARTOON WIDGET -->
            <div id="omnitrixTriggerWrap" class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex items-end gap-2.5">
                <!-- Playful Ben 10 Speech Bubble -->
                <div id="omnitrixHint" onclick="window.omnitrixToggle()" 
                     class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/95 border-2 border-[#00ff66] text-[#00ff66] text-xs font-bold shadow-[0_0_20px_rgba(0,255,102,0.5)] backdrop-blur-md cursor-pointer transition-all hover:scale-105 select-none relative animate-bounce">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-ping"></span>
                    <span>Hey! I'm Ben 10! Ask me about Alkamah</span>
                </div>

                <!-- Ben 10 Cartoon Sticker Dial Trigger -->
                <button type="button" id="omnitrixDialBtn" onclick="window.omnitrixToggle()" 
                        class="omnitrix-dial-btn relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-950 border-4 border-[#00ff66] flex items-center justify-center shadow-[0_0_30px_rgba(0,255,102,0.8)] hover:scale-110 active:scale-95 transition-transform duration-200 focus:outline-none overflow-hidden group"
                        aria-label="Open Ben 10 Cartoon AI Assistant" title="Ben 10 Cartoon AI Assistant">
                    
                    <!-- Omnitrix Rotating Energy Ring -->
                    <div class="absolute inset-0 rounded-full border border-dashed border-[#00ff66]/50 animate-spin pointer-events-none" style="animation-duration: 10s;"></div>
                    
                    <!-- Direct Ben 10 Cartoon Character Image -->
                    <img src="assets/ben10-avatar.png" alt="Ben 10 Cartoon" 
                         class="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-300 pointer-events-none">

                    <!-- Green status blip -->
                    <span class="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-[#00ff66] border-2 border-slate-950 shadow-[0_0_10px_#00ff66]"></span>
                </button>
            </div>

            <!-- OMNITRIX HOLOGRAPHIC CHAT WINDOW -->
            <div id="omnitrixModal" class="fixed bottom-24 right-3 sm:right-6 z-[9999] hidden w-[94vw] sm:w-[440px] max-h-[84vh] rounded-[2rem] omnitrix-holo-panel text-slate-100 flex-col overflow-hidden transition-all duration-300 scale-95 opacity-0 shadow-2xl">
                
                <!-- TOP HEADER BAR -->
                <div class="p-4 sm:p-5 border-b border-emerald-500/20 bg-slate-950/90 backdrop-blur-md flex items-center justify-between relative">
                    <div class="flex items-center gap-3">
                        <!-- Direct Ben 10 Avatar in Header -->
                        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border-2 border-[#00ff66]/50 overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.4)] flex-shrink-0">
                            <img src="assets/ben10-avatar.png" alt="Ben 10" class="w-full h-full object-cover object-top scale-110">
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 id="omnitrixHeaderTitle" class="font-extrabold text-sm sm:text-base tracking-wide text-white flex items-center gap-1.5">
                                    BEN 10 AI ASSISTANT
                                </h3>
                            </div>
                            <p id="omnitrixHeaderSubtitle" class="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></span>
                                "It's Hero Time!" // Ready
                            </p>
                        </div>
                    </div>

                    <!-- Header Controls -->
                    <div class="flex items-center gap-1.5">
                        <!-- Sound FX Toggle -->
                        <button type="button" id="omnitrixSfxBtn" onclick="window.omnitrixToggleSfx()" 
                                class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-all"
                                title="Toggle Sound FX">
                            <i class="fas fa-volume-high"></i>
                        </button>

                        <!-- Close Button -->
                        <button type="button" onclick="window.omnitrixClose()" 
                                class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-all"
                                title="Minimize Omnitrix">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- ALIEN HERO PERSONA SELECTOR BAR -->
                <div class="px-3.5 py-2.5 bg-black/40 border-b border-emerald-500/15 flex items-center gap-1.5 overflow-x-auto omnitrix-custom-scrollbar text-[11px] font-bold">
                    <span class="text-[10px] text-slate-400 uppercase tracking-widest font-mono mr-1">Modes:</span>
                    <button type="button" onclick="window.omnitrixSetPersona('omni')" class="omni-persona-btn px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center gap-1 flex-shrink-0" data-persona="omni">
                        <i class="fas fa-bolt text-[10px]"></i> Omni
                    </button>
                    <button type="button" onclick="window.omnitrixSetPersona('greyMatter')" class="omni-persona-btn px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1 flex-shrink-0" data-persona="greyMatter">
                        <i class="fas fa-brain text-[10px] text-sky-400"></i> Grey Matter
                    </button>
                    <button type="button" onclick="window.omnitrixSetPersona('xlr8')" class="omni-persona-btn px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1 flex-shrink-0" data-persona="xlr8">
                        <i class="fas fa-gauge-high text-[10px] text-cyan-400"></i> XLR8
                    </button>
                    <button type="button" onclick="window.omnitrixSetPersona('fourArms')" class="omni-persona-btn px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1 flex-shrink-0" data-persona="fourArms">
                        <i class="fas fa-dumbbell text-[10px] text-red-400"></i> Four Arms
                    </button>
                    <button type="button" onclick="window.omnitrixSetPersona('upgrade')" class="omni-persona-btn px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1 flex-shrink-0" data-persona="upgrade">
                        <i class="fas fa-microchip text-[10px] text-purple-400"></i> Upgrade
                    </button>
                </div>

                <!-- MESSAGES STREAM -->
                <div id="omnitrixMessages" class="p-4 space-y-3.5 overflow-y-auto max-h-[50vh] sm:max-h-[52vh] omnitrix-custom-scrollbar omnitrix-scanline text-xs leading-relaxed">
                    <!-- Initial Welcome Message -->
                    <div class="flex items-start gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border-2 border-[#00ff66]/50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                            <img src="assets/ben10-avatar.png" alt="Ben 10" class="w-full h-full object-cover object-top scale-110">
                        </div>
                        <div class="p-3.5 rounded-2xl omnitrix-bubble-ai text-slate-200">
                            <p class="font-bold text-[#00ff66] mb-1">"It's Hero Time!" ⚡</p>
                            <p>Hey! I am <strong>Ben 10</strong>, your virtual AI guide. Ask me anything about Alkamah—his Cybersecurity expertise, university leadership, development projects, or how to reach him!</p>
                        </div>
                    </div>
                </div>

                <!-- QUICK TOPIC PROMPT CHIPS -->
                <div class="p-2.5 bg-black/30 border-t border-emerald-500/10 flex items-center gap-1.5 overflow-x-auto omnitrix-custom-scrollbar text-[11px]">
                    <button type="button" onclick="window.omnitrixAsk('Tell me about Alkamah')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex-shrink-0">
                        👤 Bio
                    </button>
                    <button type="button" onclick="window.omnitrixAsk('What are his cybersecurity skills?')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex-shrink-0">
                        🛡️ Cybersecurity
                    </button>
                    <button type="button" onclick="window.omnitrixAsk('Tell me about his university leadership roles')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex-shrink-0">
                        🏛️ Leadership
                    </button>
                    <button type="button" onclick="window.omnitrixAsk('What projects has he built?')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex-shrink-0">
                        🚀 Projects
                    </button>
                    <button type="button" onclick="window.omnitrixAsk('How can I contact or hire Alkamah?')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex-shrink-0">
                        📬 Contact
                    </button>
                    <button type="button" onclick="window.omnitrixAsk('Can I view his resume?')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex-shrink-0">
                        📄 CV
                    </button>
                </div>

                <!-- INPUT BAR -->
                <form id="omnitrixForm" onsubmit="window.omnitrixSubmit(event)" class="p-3 bg-slate-950/90 border-t border-emerald-500/20 flex items-center gap-2">
                    <input type="text" id="omnitrixInput" placeholder="Ask the Omnitrix anything..." autocomplete="off"
                           class="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]">
                    
                    <button type="submit" 
                            class="w-10 h-10 rounded-xl bg-[#00ff66] hover:bg-[#34d399] text-slate-950 font-bold flex items-center justify-center transition-all shadow-[0_0_12px_rgba(0,255,102,0.4)] hover:scale-105 active:scale-95 flex-shrink-0"
                            title="Transmit Query">
                        <i class="fas fa-bolt"></i>
                    </button>
                </form>

            </div>
        `;

        document.body.appendChild(container);
    }

    // -------------------------------------------------------------------------
    // 5. Global API & Controller
    // -------------------------------------------------------------------------
    let isOpen = false;

    window.omnitrixToggle = function () {
        if (isOpen) {
            window.omnitrixClose();
        } else {
            window.omnitrixOpen();
        }
    };

    window.omnitrixOpen = function () {
        const modal = document.getElementById('omnitrixModal');
        const hint = document.getElementById('omnitrixHint');
        if (!modal) return;
        isOpen = true;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modal.classList.remove('scale-95', 'opacity-0');
            modal.classList.add('scale-100', 'opacity-100');
        }, 10);
        if (hint) hint.classList.add('hidden');
        playOmnitrixSfx('open');
        document.getElementById('omnitrixInput')?.focus();
    };

    window.omnitrixClose = function () {
        const modal = document.getElementById('omnitrixModal');
        if (!modal) return;
        isOpen = false;
        modal.classList.add('scale-95', 'opacity-0');
        modal.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 200);
        playOmnitrixSfx('beep');
    };

    window.omnitrixToggleSfx = function () {
        sfxEnabled = !sfxEnabled;
        const btn = document.getElementById('omnitrixSfxBtn');
        if (btn) {
            btn.innerHTML = sfxEnabled ? '<i class="fas fa-volume-high"></i>' : '<i class="fas fa-volume-xmark text-slate-500"></i>';
        }
        if (sfxEnabled) playOmnitrixSfx('beep');
    };

    window.omnitrixSetPersona = function (personaKey) {
        if (!PERSONAS[personaKey]) return;
        activePersona = personaKey;
        playOmnitrixSfx('transform');

        // Update Buttons UI
        document.querySelectorAll('.omni-persona-btn').forEach(btn => {
            const key = btn.dataset.persona;
            if (key === personaKey) {
                btn.className = "omni-persona-btn px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 flex-shrink-0";
            } else {
                btn.className = "omni-persona-btn px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 flex items-center gap-1 flex-shrink-0";
            }
        });

        // Update Header Icon & Subtitle
        const cur = PERSONAS[personaKey];
        const icon = document.getElementById('omnitrixHeaderIcon');
        const sub = document.getElementById('omnitrixHeaderSubtitle');
        if (icon) icon.className = `${cur.icon} text-lg`;
        if (sub) {
            sub.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></span> Mode: ${cur.name} (${cur.badge})`;
        }

        // Add Persona Transform Announcement in Chat
        appendAiMessage(`
            <p class="font-bold text-[#00ff66] flex items-center gap-1.5">
                <i class="${cur.icon}"></i> ${cur.name} Mode Engaged!
            </p>
            <p class="text-xs text-slate-200 mt-0.5">${cur.intro}</p>
        `);
    };

    window.omnitrixAsk = function (questionText) {
        const input = document.getElementById('omnitrixInput');
        if (input) input.value = questionText;
        window.omnitrixSubmit();
    };

    window.omnitrixSubmit = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        const input = document.getElementById('omnitrixInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        playOmnitrixSfx('beep');
        appendUserMessage(text);
        input.value = '';

        // Show typing indicator
        const typingId = showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator(typingId);
            const responseHtml = generateOmniResponse(text);
            appendAiMessage(responseHtml);
            playOmnitrixSfx('beep');
        }, 500);
    };

    function appendUserMessage(text) {
        const feed = document.getElementById('omnitrixMessages');
        if (!feed) return;
        const div = document.createElement('div');
        div.className = 'flex items-start justify-end gap-2.5';
        div.innerHTML = `
            <div class="p-3 rounded-2xl omnitrix-bubble-user text-white max-w-[82%] break-words">
                ${escapeHtml(text)}
            </div>
            <div class="w-7 h-7 rounded-lg bg-white/10 border border-white/20 text-slate-300 flex items-center justify-center flex-shrink-0 text-xs">
                <i class="fas fa-user"></i>
            </div>
        `;
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
    }

    function appendAiMessage(htmlContent) {
        const feed = document.getElementById('omnitrixMessages');
        if (!feed) return;
        const p = PERSONAS[activePersona];
        const div = document.createElement('div');
        div.className = 'flex items-start gap-2.5 animate-fadeIn';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border-2 border-[#00ff66]/50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                <img src="assets/ben10-avatar.png" alt="Ben 10" class="w-full h-full object-cover object-top scale-110">
            </div>
            <div class="p-3.5 rounded-2xl omnitrix-bubble-ai text-slate-200 max-w-[85%] break-words">
                ${htmlContent}
            </div>
        `;
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
    }

    function showTypingIndicator() {
        const feed = document.getElementById('omnitrixMessages');
        if (!feed) return null;
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex items-start gap-2.5';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border-2 border-[#00ff66]/50 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                <img src="assets/ben10-avatar.png" alt="Ben 10" class="w-full h-full object-cover object-top scale-110 animate-pulse">
            </div>
            <div class="p-3 rounded-2xl omnitrix-bubble-ai text-slate-400 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200"></span>
                <span class="text-[11px] font-mono text-[#00ff66] ml-1">Ben 10 is analyzing Omnitrix...</span>
            </div>
        `;
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        if (!id) return;
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // -------------------------------------------------------------------------
    // 6. Initialization
    // -------------------------------------------------------------------------
    function initOmnitrix() {
        injectOmnitrixStyles();
        injectOmnitrixMarkup();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOmnitrix);
    } else {
        initOmnitrix();
    }

})();
