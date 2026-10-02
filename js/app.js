// NASA Space Apps Challenge 2026 Complete Event Website & Admin Platform

import { EVENT_DETAILS, INITIAL_TEAMS, INITIAL_STATS, GALLERY_PHOTOS, VIDEO_SHOWCASE, WHY_PARTICIPATE_CARDS, FAQS_LIST } from './data.js';
import { validateFullRegistrationPayload, checkDatabaseDuplicates, RateLimiter } from './zodValidation.js';
import { generateMemberIDBadgeCanvas, downloadIDCard } from './idCardGenerator.js';
import { exportToCSV, exportToExcelHTML } from './exportUtils.js';
import { MockAPIService } from './mockApi.js';

class NASAEventPortal {
    constructor() {
        this.teams = JSON.parse(localStorage.getItem('nasa_teams')) || INITIAL_TEAMS;
        this.stats = INITIAL_STATS;
        this.isAuthenticated = localStorage.getItem('nasa_admin_auth') === 'true';
        this.currentView = 'home'; // 'home', 'register', 'success', 'verify', 'admin', 'admin-login'
        
        // Registration Form State (6 Steps)
        this.regStep = 1;
        this.regData = {
            category: 'College',
            teamName: '',
            institutionName: '',
            teamSize: 4,
            leaderName: '',
            leaderEmail: '',
            leaderMobile: '',
            members: [
                { name: '', email: '', mobile: '', role: 'Frontend Developer' },
                { name: '', email: '', mobile: '', role: 'Data Analyst' },
                { name: '', email: '', mobile: '', role: 'AI Researcher' }
            ],
            mentor: { name: '', email: '', mobile: '' },
            declarationInfo: false,
            declarationRules: false,
            declarationInstitution: false
        };

        this.createdTeam = null; // Stored after successful registration
        this.searchQuery = '';
        this.categoryFilter = 'All';
        this.statusFilter = 'All';
        this.mockApi = new MockAPIService(this.teams, this.stats);

        this.init();
    }

    init() {
        this.bindGlobalEvents();
        this.render();
        this.startCountdownTimer();
    }

    saveState() {
        localStorage.setItem('nasa_teams', JSON.stringify(this.teams));
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        const color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#00f0ff';
        toast.style.borderColor = color;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    bindGlobalEvents() {
        window.addEventListener('popstate', () => {
            const path = window.location.hash.replace('#', '');
            if (path) this.currentView = path;
            this.render();
        });
    }

    navigate(viewName) {
        this.currentView = viewName;
        window.location.hash = viewName;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    render() {
        const app = document.getElementById('app');

        if (this.currentView === 'admin' && !this.isAuthenticated) {
            this.currentView = 'admin-login';
        }

        app.innerHTML = `
            ${this.currentView !== 'admin-login' && this.currentView !== 'admin' ? this.renderPublicNavHtml() : ''}
            <div id="viewContainer">
                ${this.renderCurrentViewHtml()}
            </div>
            <div id="modalContainer"></div>
            <div class="toast-container" id="toastContainer"></div>
        `;

        this.attachViewEvents();
    }

    // 1. PUBLIC NAVIGATION HEADER
    renderPublicNavHtml() {
        return `
            <nav class="public-nav">
                <a class="nav-brand" href="#home" id="navBrandHome">
                    <div class="nasa-logo-badge">NASA</div>
                    <div class="nav-brand-text">
                        <h2>SPACE APPS 2026</h2>
                        <p>BIAS BHIMTAL • ASTROVERSE</p>
                    </div>
                </a>
                <ul class="nav-links">
                    <li><a class="nav-link-item ${this.currentView === 'home' ? 'active' : ''}" href="#home">Home</a></li>
                    <li><a class="nav-link-item" href="#about">About</a></li>
                    <li><a class="nav-link-item" href="#gallery">Gallery</a></li>
                    <li><a class="nav-link-item" href="#schedule">Schedule</a></li>
                    <li><a class="nav-link-item" href="#faq">FAQ</a></li>
                    <li><a class="nav-link-item" href="#contact">Contact</a></li>
                </ul>
                <div style="display:flex; align-items:center; gap:16px;">
                    <button class="nav-cta-btn" id="navRegisterBtn">REGISTER TEAM</button>
                    <button class="btn-secondary" id="navAdminPortalBtn" style="padding:8px 14px; font-size:11px;">ADMIN LOGIN</button>
                </div>
            </nav>
        `;
    }

    renderCurrentViewHtml() {
        switch (this.currentView) {
            case 'home': return this.renderLandingPageHtml();
            case 'register': return this.renderRegistrationWizardHtml();
            case 'success': return this.renderSuccessPageHtml();
            case 'verify': return this.renderQRVerifyHtml();
            case 'admin-login': return this.renderAdminLoginHtml();
            case 'admin': return this.renderAdminDashboardLayoutHtml();
            default: return this.renderLandingPageHtml();
        }
    }

    // 2. PAGE 1 - PUBLIC LANDING PAGE
    renderLandingPageHtml() {
        return `
            <!-- Hero Section -->
            <section class="hero-wrapper" id="home">
                <div class="hero-badge-pill">
                    <span style="color:#10b981;">●</span> OFFICIAL NASA SPACE APPS HACKATHON 2026
                </div>
                <h1 class="hero-title">IDEAS TODAY.<br>IMPACT TOMORROW.</h1>
                <p class="hero-sub">
                    Join the world's largest space innovation challenge at Birla Institute of Applied Sciences (BIAS), Bhimtal. Collaborate with coders, scientists, and designers to solve real-world problems on Earth and in Space using NASA open data.
                </p>

                <!-- Countdown Timer to College Edition -->
                <div class="countdown-container">
                    <div class="timer-box">
                        <div class="timer-num" id="cdDays">42</div>
                        <div class="timer-label">Days</div>
                    </div>
                    <div class="timer-box">
                        <div class="timer-num" id="cdHours">11</div>
                        <div class="timer-label">Hours</div>
                    </div>
                    <div class="timer-box">
                        <div class="timer-num" id="cdMins">34</div>
                        <div class="timer-label">Mins</div>
                    </div>
                    <div class="timer-box">
                        <div class="timer-num" id="cdSecs">20</div>
                        <div class="timer-label">Secs</div>
                    </div>
                </div>

                <div style="display:flex; gap:20px;">
                    <button class="btn-primary" id="heroRegisterBtn" style="width:auto; padding:16px 36px; font-size:16px;">
                        <span>REGISTER TEAM NOW</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                    <a href="#about" class="btn-secondary" style="padding:16px 28px; font-size:14px; text-decoration:none;">EXPLORE MISSIONS</a>
                </div>
            </section>

            <!-- About Section -->
            <section class="landing-section" id="about">
                <div class="section-header">
                    <span class="section-tag">GLOBAL MOVEMENT</span>
                    <h2 class="section-title">About NASA Space Apps Challenge</h2>
                    <p class="section-sub">
                        The NASA International Space Apps Challenge is an international hackathon for coders, scientists, designers, storytellers, makers, builders, technologists, and innovators.
                    </p>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;">
                    <div class="glass-panel" style="padding:40px;">
                        <h3 style="font-family:var(--font-heading); color:#fff; font-size:24px; margin-bottom:16px;">Why Participate at BIAS Bhimtal?</h3>
                        <p style="color:var(--text-muted); margin-bottom:16px;">
                            Birla Institute of Applied Sciences (BIAS), Bhimtal provides a state-of-the-art incubation infrastructure nestled in the serene Kumaon hills. Participants gain access to high-speed internet, mentorship from ISRO & space industry experts, and a platform to compete for global nominations.
                        </p>
                        <ul style="color:var(--text-main); list-style:none; display:flex; flex-direction:column; gap:12px;">
                            <li>✓ Free Registration & Accommodation Support</li>
                            <li>✓ Access to NASA & Earth Observation APIs</li>
                            <li>✓ National Recognition & Cash Prize Pool</li>
                        </ul>
                    </div>
                    <div class="glass-panel" style="padding:40px; text-align:center;">
                        <div style="font-family:var(--font-heading); font-size:64px; color:var(--accent-cyan); font-weight:900;">1,200+</div>
                        <p style="color:var(--text-muted); font-size:18px; margin-bottom:24px;">Participants Registered Across School & College Divisions</p>
                        <div style="display:flex; justify-content:center; gap:20px;">
                            <div><strong style="color:#fff; font-size:24px;">320+</strong><br><span style="color:var(--text-dim); font-size:12px;">Teams Hacking</span></div>
                            <div><strong style="color:#fff; font-size:24px;">8</strong><br><span style="color:var(--text-dim); font-size:12px;">Global Challenges</span></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Why Participate Section -->
            <section class="landing-section">
                <div class="section-header">
                    <span class="section-tag">PERKS & INCENTIVES</span>
                    <h2 class="section-title">What You Win & Experience</h2>
                </div>
                <div class="cards-grid">
                    ${WHY_PARTICIPATE_CARDS.map(c => `
                        <div class="glass-panel feature-card">
                            <div class="feature-icon">★</div>
                            <h3>${c.title}</h3>
                            <p>${c.desc}</p>
                        </div>
                    `).map(e => e).join('')}
                </div>
            </section>

            <!-- Photo & Video Gallery -->
            <section class="landing-section" id="gallery">
                <div class="section-header">
                    <span class="section-tag">PREVIOUS EDITIONS</span>
                    <h2 class="section-title">Photo & Video Showcase</h2>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                    ${GALLERY_PHOTOS.map(p => `
                        <div class="glass-panel photo-card" data-url="${p.url}" style="padding:12px; cursor:pointer;">
                            <img src="${p.url}" alt="${p.title}" style="width:100%; height:180px; object-fit:cover; border-radius:10px;" />
                            <h4 style="color:#fff; margin-top:10px; font-size:14px;">${p.title}</h4>
                            <p style="color:var(--text-dim); font-size:12px;">${p.caption}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Event Schedule -->
            <section class="landing-section" id="schedule">
                <div class="section-header">
                    <span class="section-tag">KEY DATES</span>
                    <h2 class="section-title">Event Schedule</h2>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px;">
                    <div class="glass-panel" style="padding:32px;">
                        <span class="category-tag school">SCHOOL EDITION</span>
                        <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px; margin:12px 0;">Classes 8th to 12th</h3>
                        <p style="color:var(--accent-cyan); font-weight:700;">Date: To Be Announced</p>
                        <p style="color:var(--text-muted); font-size:13px; margin-top:8px;">Mentorship sessions & junior hackathon tracks.</p>
                    </div>
                    <div class="glass-panel" style="padding:32px; border-color:var(--accent-cyan);">
                        <span class="category-tag college">COLLEGE EDITION</span>
                        <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px; margin:12px 0;">UG & PG Students</h3>
                        <p style="color:var(--accent-cyan); font-weight:700;">14–15 November 2026</p>
                        <p style="color:var(--text-muted); font-size:13px; margin-top:8px;">Venue: Birla Institute of Applied Sciences, Bhimtal.</p>
                    </div>
                </div>
            </section>

            <!-- FAQ Section -->
            <section class="landing-section" id="faq">
                <div class="section-header">
                    <span class="section-tag">FREQUENTLY ASKED QUESTIONS</span>
                    <h2 class="section-title">Have Questions? We Have Answers.</h2>
                </div>
                <div class="faq-accordion">
                    ${FAQS_LIST.map((f, i) => `
                        <div class="glass-panel faq-item ${i === 0 ? 'active' : ''}">
                            <div class="faq-question">
                                <span>${f.q}</span>
                                <span>+</span>
                            </div>
                            <div class="faq-answer">${f.a}</div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Contact Section -->
            <section class="landing-section" id="contact">
                <div class="glass-panel" style="padding:48px;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px;">
                        <div>
                            <span class="section-tag">GET IN TOUCH</span>
                            <h2 class="section-title" style="font-size:28px;">Contact Command Center</h2>
                            <p style="color:var(--text-muted); margin-bottom:24px;">Have inquiries regarding registration, travel, or sponsorship?</p>
                            <p style="color:#fff;"><strong>Email:</strong> spaceapps@bias.ac.in</p>
                            <p style="color:#fff;"><strong>Phone:</strong> +91 98765 43210</p>
                            <p style="color:#fff;"><strong>Venue:</strong> BIAS Campus, Bhimtal, Uttarakhand 263136</p>
                        </div>
                        <div>
                            <form id="contactForm" style="display:flex; flex-direction:column; gap:16px;">
                                <input type="text" class="input-field" placeholder="Your Full Name" style="padding-left:14px;" required />
                                <input type="email" class="input-field" placeholder="Your Email Address" style="padding-left:14px;" required />
                                <textarea class="input-field" rows="4" placeholder="Your Query Message..." style="padding-left:14px;" required></textarea>
                                <button type="submit" class="btn-primary" style="width:auto;">SEND MESSAGE</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // 3. PAGE 2 - 6-STEP REGISTRATION PORTAL WIZARD
    renderRegistrationWizardHtml() {
        const step = this.regStep;

        return `
            <div style="padding:120px 20px 60px 20px; max-width:900px; margin:0 auto;">
                <div class="section-header" style="margin-bottom:30px;">
                    <span class="section-tag">OFFICIAL TEAM REGISTRATION</span>
                    <h2 class="section-title">NASA Space Apps 2026 Portal</h2>
                </div>

                <!-- Step Wizard Header -->
                <div class="wizard-progress-bar">
                    ${[1, 2, 3, 4, 5, 6].map(s => `
                        <div class="step-node ${s === step ? 'active' : s < step ? 'completed' : ''}">
                            <div class="step-circle">${s < step ? '✓' : s}</div>
                            <div class="step-title">
                                ${s === 1 ? 'Category' : s === 2 ? 'Team Info' : s === 3 ? 'Leader' : s === 4 ? 'Members' : s === 5 ? 'Mentor' : 'Declaration'}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="glass-panel" style="padding:40px;">
                    ${this.renderWizardStepContentHtml()}
                </div>
            </div>
        `;
    }

    renderWizardStepContentHtml() {
        const step = this.regStep;
        const data = this.regData;

        if (step === 1) {
            return `
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px;">Step 1: Select Participation Category</h3>
                <p style="color:var(--text-muted); margin-bottom:20px;">Choose whether your team is competing in the School or College division.</p>
                
                <div class="category-choice-grid">
                    <div class="category-choice-card ${data.category === 'College' ? 'selected' : ''}" id="selectCollegeCat">
                        <div style="font-size:36px;">🎓</div>
                        <h3>College Level</h3>
                        <p style="color:var(--text-muted); font-size:13px;">Undergraduate & Postgraduate university students.</p>
                    </div>
                    <div class="category-choice-card ${data.category === 'School' ? 'selected' : ''}" id="selectSchoolCat">
                        <div style="font-size:36px;">🏫</div>
                        <h3>School Level</h3>
                        <p style="color:var(--text-muted); font-size:13px;">Students from Classes 8th to 12th.</p>
                    </div>
                </div>

                <div style="margin-top:32px; text-align:right;">
                    <button class="btn-primary" id="wizardStep1Next" style="width:auto; padding:12px 32px;">CONTINUE TO STEP 2 →</button>
                </div>
            `;
        }

        if (step === 2) {
            return `
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px;">Step 2: Team Information</h3>
                <p style="color:var(--text-muted); margin-bottom:24px;">Enter your team name, institution, and team size (4 to 6 members).</p>

                <div class="form-group">
                    <label>Team Name *</label>
                    <input type="text" id="wizTeamName" class="input-field" value="${data.teamName}" placeholder="e.g. AstroNova" style="padding-left:14px;" />
                </div>

                <div class="form-group">
                    <label>School / College Institution Name *</label>
                    <input type="text" id="wizInstitution" class="input-field" value="${data.institutionName}" placeholder="e.g. Birla Institute of Applied Sciences, Bhimtal" style="padding-left:14px;" />
                    <p style="font-size:11px; color:var(--text-dim);">Note: All team members MUST belong to this exact institution.</p>
                </div>

                <div class="form-group">
                    <label>Team Size (4 to 6 members) *</label>
                    <select id="wizTeamSize" class="input-field" style="padding-left:14px;">
                        <option value="4" ${data.teamSize === 4 ? 'selected' : ''}>4 Members (1 Leader + 3 Members)</option>
                        <option value="5" ${data.teamSize === 5 ? 'selected' : ''}>5 Members (1 Leader + 4 Members)</option>
                        <option value="6" ${data.teamSize === 6 ? 'selected' : ''}>6 Members (1 Leader + 5 Members)</option>
                    </select>
                </div>

                <div style="margin-top:32px; display:flex; justify-content:space-between;">
                    <button class="btn-secondary" id="wizardBackBtn">← BACK</button>
                    <button class="btn-primary" id="wizardStep2Next" style="width:auto; padding:12px 32px;">CONTINUE TO STEP 3 →</button>
                </div>
            `;
        }

        if (step === 3) {
            return `
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px;">Step 3: Team Leader Details</h3>
                <p style="color:var(--text-muted); margin-bottom:24px;">The team leader will serve as the primary point of contact.</p>

                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="wizLeaderName" class="input-field" value="${data.leaderName}" placeholder="e.g. Priya Singh" style="padding-left:14px;" />
                </div>
                <div class="form-group">
                    <label>Email Address *</label>
                    <input type="email" id="wizLeaderEmail" class="input-field" value="${data.leaderEmail}" placeholder="e.g. priya.singh@bias.ac.in" style="padding-left:14px;" />
                </div>
                <div class="form-group">
                    <label>Mobile Number *</label>
                    <input type="text" id="wizLeaderMobile" class="input-field" value="${data.leaderMobile}" placeholder="e.g. +91 98765 43210" style="padding-left:14px;" />
                </div>

                <div style="margin-top:32px; display:flex; justify-content:space-between;">
                    <button class="btn-secondary" id="wizardBackBtn">← BACK</button>
                    <button class="btn-primary" id="wizardStep3Next" style="width:auto; padding:12px 32px;">CONTINUE TO STEP 4 →</button>
                </div>
            `;
        }

        if (step === 4) {
            const memberCountNeeded = data.teamSize - 1; // excluding leader
            return `
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px;">Step 4: Team Members Details (${memberCountNeeded} Members)</h3>
                <p style="color:var(--text-muted); margin-bottom:24px;">Fill details for all remaining ${memberCountNeeded} team members.</p>

                ${Array.from({ length: memberCountNeeded }).map((_, idx) => {
                    const m = data.members[idx] || { name: '', email: '', mobile: '' };
                    return `
                        <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.08);">
                            <h4 style="color:var(--accent-cyan); margin-bottom:12px;">Member ${idx + 2} Details</h4>
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                                <input type="text" class="input-field wiz-member-name" data-idx="${idx}" value="${m.name}" placeholder="Full Name" style="padding-left:14px;" />
                                <input type="email" class="input-field wiz-member-email" data-idx="${idx}" value="${m.email}" placeholder="Email" style="padding-left:14px;" />
                                <input type="text" class="input-field wiz-member-mobile" data-idx="${idx}" value="${m.mobile}" placeholder="Mobile" style="padding-left:14px;" />
                            </div>
                        </div>
                    `;
                }).join('')}

                <div style="margin-top:32px; display:flex; justify-content:space-between;">
                    <button class="btn-secondary" id="wizardBackBtn">← BACK</button>
                    <button class="btn-primary" id="wizardStep4Next" style="width:auto; padding:12px 32px;">CONTINUE TO STEP 5 →</button>
                </div>
            `;
        }

        if (step === 5) {
            return `
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px;">Step 5: Faculty Mentor (Optional)</h3>
                <p style="color:var(--text-muted); margin-bottom:24px;">If your team has a faculty mentor from your institution, enter their details below.</p>

                <div class="form-group">
                    <label>Mentor Full Name</label>
                    <input type="text" id="wizMentorName" class="input-field" value="${data.mentor.name}" placeholder="e.g. Dr. H.S. Bhadauria" style="padding-left:14px;" />
                </div>
                <div class="form-group">
                    <label>Mentor Email</label>
                    <input type="email" id="wizMentorEmail" class="input-field" value="${data.mentor.email}" placeholder="e.g. bhadauria@bias.ac.in" style="padding-left:14px;" />
                </div>
                <div class="form-group">
                    <label>Mentor Mobile Number</label>
                    <input type="text" id="wizMentorMobile" class="input-field" value="${data.mentor.mobile}" placeholder="e.g. +91 94120 12345" style="padding-left:14px;" />
                </div>

                <div style="margin-top:32px; display:flex; justify-content:space-between;">
                    <button class="btn-secondary" id="wizardBackBtn">← BACK</button>
                    <button class="btn-primary" id="wizardStep5Next" style="width:auto; padding:12px 32px;">PROCEED TO DECLARATION →</button>
                </div>
            `;
        }

        if (step === 6) {
            return `
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:22px;">Step 6: Declaration & Submit</h3>
                <p style="color:var(--text-muted); margin-bottom:24px;">Please review the rules and confirm your team registration.</p>

                <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:32px;">
                    <label style="display:flex; align-items:center; gap:12px; color:#fff; cursor:pointer;">
                        <input type="checkbox" id="wizDeclInfo" ${data.declarationInfo ? 'checked' : ''} style="width:18px; height:18px;" />
                        <span>I confirm that all provided participant names, emails, and mobile numbers are accurate.</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:12px; color:#fff; cursor:pointer;">
                        <input type="checkbox" id="wizDeclRules" ${data.declarationRules ? 'checked' : ''} style="width:18px; height:18px;" />
                        <span>Our team agrees to adhere to NASA Space Apps Challenge 2026 & BIAS Bhimtal event rules.</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:12px; color:#fff; cursor:pointer;">
                        <input type="checkbox" id="wizDeclInst" ${data.declarationInstitution ? 'checked' : ''} style="width:18px; height:18px;" />
                        <span><strong>Institution Rule:</strong> All team members belong to the exact same institution (${data.institutionName || 'Your Institution'}).</span>
                    </label>
                </div>

                <div id="wizErrorAlert" style="color:#ef4444; font-size:13px; font-weight:600; margin-bottom:16px; display:none;"></div>

                <div style="display:flex; justify-content:space-between;">
                    <button class="btn-secondary" id="wizardBackBtn">← BACK</button>
                    <button class="btn-primary" id="wizardFinalSubmitBtn" style="width:auto; padding:14px 40px; font-size:15px;">
                        <span>SUBMIT REGISTRATION</span>
                    </button>
                </div>
            `;
        }
    }

    // 4. PAGE 3 - REGISTRATION SUCCESS PAGE
    renderSuccessPageHtml() {
        const team = this.createdTeam || this.teams[0];

        return `
            <div class="success-card glass-panel">
                <div class="success-badge-icon">✓</div>
                <h2 style="font-family:var(--font-heading); color:#fff; font-size:32px;">REGISTRATION SUCCESSFUL!</h2>
                <p style="color:var(--text-muted); font-size:16px; margin-top:8px;">Welcome to NASA Space Apps Challenge 2026 at BIAS Bhimtal.</p>
                
                <div class="reg-id-pill">${team.id}</div>
                <p style="color:#fff; font-size:18px; font-weight:700;">Team: ${team.teamName} (${team.category} Division)</p>
                <p style="color:var(--text-dim); font-size:14px;">Institution: ${team.institutionName || team.institution}</p>

                <div style="margin-top:36px; padding-top:24px; border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-family:var(--font-heading); color:#fff; font-size:18px; margin-bottom:16px;">Individual Member ID Cards</h3>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
                        ${(team.members || []).map((m, idx) => `
                            <div style="background:rgba(255,255,255,0.03); padding:12px 20px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                                <div style="text-align:left;">
                                    <strong style="color:#fff;">${m.name}</strong> <span style="color:var(--accent-cyan); font-size:12px;">(${m.role || 'Member'})</span>
                                </div>
                                <button class="btn-secondary download-single-pass-btn" data-idx="${idx}" style="padding:6px 14px; font-size:11px;">
                                    Download Pass (PNG)
                                </button>
                            </div>
                        `).join('')}
                    </div>

                    <div style="display:flex; gap:16px; justify-content:center;">
                        <button class="btn-primary" id="successGoHomeBtn" style="width:auto; padding:12px 28px;">RETURN TO HOME</button>
                        <a href="#verify?id=${team.id}" class="btn-secondary" style="padding:12px 24px; text-decoration:none;">VIEW QR VERIFICATION</a>
                    </div>
                </div>
            </div>

            <!-- Hidden Canvas for Badge Download -->
            <canvas id="hiddenPassCanvas" style="display:none;"></canvas>
        `;
    }

    // 5. PAGE 4 - QR CODE VERIFICATION PORTAL
    renderQRVerifyHtml() {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const id = urlParams.get('id') || 'NASA2026-BIAS-0042';
        const team = this.teams.find(t => t.id === id) || this.teams[0];

        return `
            <div style="padding:120px 20px; max-width:600px; margin:0 auto; text-align:center;">
                <div class="glass-panel" style="padding:40px;">
                    <div style="width:64px; height:64px; border-radius:50%; background:rgba(16,185,129,0.15); border:2px solid #10b981; color:#10b981; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto; font-size:24px; font-weight:bold;">✓</div>
                    <span class="section-tag" style="color:#10b981;">AUTHENTICATED PASS</span>
                    <h2 style="font-family:var(--font-heading); color:#fff; font-size:26px; margin:8px 0;">Official Verification Result</h2>
                    
                    <div class="reg-id-pill" style="font-size:20px; margin:16px 0;">${team.id}</div>
                    <div style="text-align:left; background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; margin-top:20px; display:flex; flex-direction:column; gap:8px;">
                        <div><strong style="color:var(--text-dim);">Team Name:</strong> <span style="color:#fff;">${team.teamName}</span></div>
                        <div><strong style="color:var(--text-dim);">Leader:</strong> <span style="color:#fff;">${team.leaderName}</span></div>
                        <div><strong style="color:var(--text-dim);">Category:</strong> <span style="color:var(--accent-cyan);">${team.category} Division</span></div>
                        <div><strong style="color:var(--text-dim);">Institution:</strong> <span style="color:#fff;">${team.institutionName || team.institution}</span></div>
                        <div><strong style="color:var(--text-dim);">Venue:</strong> <span style="color:#fff;">BIAS Bhimtal (14–15 Nov 2026)</span></div>
                    </div>
                </div>
            </div>
        `;
    }

    // 6. ADMIN LOGIN PAGE
    renderAdminLoginHtml() {
        return `
            <div class="login-wrapper">
                <div class="login-hero-side" style="background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop');">
                    <div class="login-hero-overlay"></div>
                    <div class="login-hero-content">
                        <div class="login-brand">
                            <div class="nasa-logo-badge">NASA</div>
                            <div class="brand-text">
                                <h1>BIAS SPACE 2026</h1>
                                <p>Birla Institute of Applied Sciences, Bhimtal</p>
                            </div>
                        </div>
                        <h2 class="login-hero-title">ADMIN COMMAND CONTROL</h2>
                        <p class="login-hero-sub">Protected route for hackathon operations, team verification, and badge reissuance.</p>
                    </div>
                </div>
                <div class="login-form-side">
                    <div class="glass-panel login-card">
                        <div class="login-card-header">
                            <h2>Admin Authentication</h2>
                            <p>Enter your admin credentials to access the control panel.</p>
                        </div>
                        <form id="adminLoginForm">
                            <div class="form-group">
                                <label>Admin Email</label>
                                <input type="email" id="loginEmail" class="input-field" value="admin@nasa.gov" style="padding-left:14px;" required />
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" id="loginPassword" class="input-field" value="spaceapps2026" style="padding-left:14px;" required />
                            </div>
                            <div id="loginError" style="color:#ef4444; font-size:12px; margin-bottom:12px; display:none;"></div>
                            <button type="submit" class="btn-primary"><span>LOG IN TO DASHBOARD</span></button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // 7. ADMIN DASHBOARD LAYOUT
    renderAdminDashboardLayoutHtml() {
        return `
            <div class="dashboard-layout">
                <aside class="sidebar">
                    <div>
                        <div class="sidebar-logo">
                            <div class="nasa-logo-badge" style="width:36px; height:36px; font-size:12px;">NASA</div>
                            <div class="sidebar-logo-text">BIAS SPACE 2026 <span>ADMIN CONTROL</span></div>
                        </div>
                        <ul class="nav-menu">
                            <li><a class="nav-item active"><span class="sidebar-text">Dashboard Overview</span></a></li>
                        </ul>
                    </div>
                    <div class="sidebar-footer">
                        <div class="user-mini-profile">
                            <div class="user-avatar">TS</div>
                            <div class="user-info sidebar-text">
                                <h4>Tushar Sati</h4>
                                <p>Chief Hackathon Admin</p>
                            </div>
                            <button id="adminLogoutBtn" style="margin-left:auto; background:none; border:none; color:#ef4444; cursor:pointer;">✕</button>
                        </div>
                    </div>
                </aside>
                <div class="main-content">
                    <header class="topbar">
                        <div class="search-box-wrapper">
                            <input type="text" id="adminSearchInput" class="search-input" placeholder="Search team name, registration ID, participant name..." value="${this.searchQuery}" />
                        </div>
                        <div class="topbar-actions">
                            <button class="btn-secondary" id="adminExitBtn">Exit Admin Portal</button>
                        </div>
                    </header>
                    <div class="page-body">
                        ${this.renderAdminDashboardContentHtml()}
                    </div>
                </div>
            </div>
        `;
    }

    renderAdminDashboardContentHtml() {
        const filtered = this.teams.filter(t => {
            const matchesSearch = !this.searchQuery || 
                t.teamName.toLowerCase().includes(this.searchQuery) ||
                t.id.toLowerCase().includes(this.searchQuery) ||
                t.leaderName.toLowerCase().includes(this.searchQuery);
            return matchesSearch;
        });

        return `
            <div class="page-header">
                <div class="page-title">
                    <h2>Admin Command Center</h2>
                    <p>Manage registrations, audit duplicate entries, and export reporting spreadsheets.</p>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary" id="adminExportCsvBtn">Export CSV</button>
                    <button class="btn-secondary" id="adminExportExcelBtn">Export Excel</button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="glass-panel stat-card">
                    <span class="stat-title">Total Teams</span>
                    <div class="stat-value">${this.teams.length}</div>
                </div>
                <div class="glass-panel stat-card">
                    <span class="stat-title">School Teams</span>
                    <div class="stat-value">${this.teams.filter(t => t.category === 'School').length}</div>
                </div>
                <div class="glass-panel stat-card">
                    <span class="stat-title">College Teams</span>
                    <div class="stat-value">${this.teams.filter(t => t.category === 'College').length}</div>
                </div>
            </div>

            <div class="glass-panel" style="padding:24px; margin-top:24px;">
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:18px; margin-bottom:16px;">Registered Teams Master List</h3>
                <div class="table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>TEAM NAME & INSTITUTION</th>
                                <th>LEADER</th>
                                <th>CATEGORY</th>
                                <th>STATUS</th>
                                <th style="text-align:right;">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(t => `
                                <tr>
                                    <td style="font-family:monospace; color:var(--accent-cyan); font-weight:700;">${t.id}</td>
                                    <td>
                                        <div class="team-name-cell">
                                            <span class="team-title">${t.teamName}</span>
                                            <span class="team-inst">${t.institutionName || t.institution}</span>
                                        </div>
                                    </td>
                                    <td>${t.leaderName}</td>
                                    <td><span class="category-tag ${t.category.toLowerCase()}">${t.category}</span></td>
                                    <td><span class="status-badge ${t.status.toLowerCase()}">${t.status}</span></td>
                                    <td style="text-align:right;">
                                        <button class="action-icon-btn admin-delete-btn" data-id="${t.id}">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // View Events & Interactions
    attachViewEvents() {
        // Nav Buttons
        const regBtn = document.getElementById('navRegisterBtn');
        const heroRegBtn = document.getElementById('heroRegisterBtn');
        const adminBtn = document.getElementById('navAdminPortalBtn');

        if (regBtn) regBtn.addEventListener('click', () => this.navigate('register'));
        if (heroRegBtn) heroRegBtn.addEventListener('click', () => this.navigate('register'));
        if (adminBtn) adminBtn.addEventListener('click', () => this.navigate('admin'));

        // Category Choice Cards (Step 1)
        const collegeCard = document.getElementById('selectCollegeCat');
        const schoolCard = document.getElementById('selectSchoolCat');
        if (collegeCard && schoolCard) {
            collegeCard.addEventListener('click', () => {
                this.regData.category = 'College';
                this.render();
            });
            schoolCard.addEventListener('click', () => {
                this.regData.category = 'School';
                this.render();
            });
        }

        // Wizard Step Buttons
        const s1Next = document.getElementById('wizardStep1Next');
        if (s1Next) s1Next.addEventListener('click', () => { this.regStep = 2; this.render(); });

        const s2Next = document.getElementById('wizardStep2Next');
        if (s2Next) {
            s2Next.addEventListener('click', () => {
                this.regData.teamName = document.getElementById('wizTeamName').value;
                this.regData.institutionName = document.getElementById('wizInstitution').value;
                this.regData.teamSize = parseInt(document.getElementById('wizTeamSize').value, 10);
                
                if (!this.regData.teamName || !this.regData.institutionName) {
                    this.showToast("Please fill Team Name and Institution Name", "error");
                    return;
                }
                this.regStep = 3;
                this.render();
            });
        }

        const s3Next = document.getElementById('wizardStep3Next');
        if (s3Next) {
            s3Next.addEventListener('click', () => {
                this.regData.leaderName = document.getElementById('wizLeaderName').value;
                this.regData.leaderEmail = document.getElementById('wizLeaderEmail').value;
                this.regData.leaderMobile = document.getElementById('wizLeaderMobile').value;
                
                if (!this.regData.leaderName || !this.regData.leaderEmail || !this.regData.leaderMobile) {
                    this.showToast("Please fill all Leader details", "error");
                    return;
                }
                this.regStep = 4;
                this.render();
            });
        }

        const s4Next = document.getElementById('wizardStep4Next');
        if (s4Next) {
            s4Next.addEventListener('click', () => {
                const names = document.querySelectorAll('.wiz-member-name');
                const emails = document.querySelectorAll('.wiz-member-email');
                const mobiles = document.querySelectorAll('.wiz-member-mobile');

                const membersList = [];
                let valid = true;
                names.forEach((n, idx) => {
                    if (!n.value || !emails[idx].value || !mobiles[idx].value) valid = false;
                    membersList.push({
                        name: n.value,
                        email: emails[idx].value,
                        mobile: mobiles[idx].value,
                        role: `Member ${idx + 2}`
                    });
                });

                if (!valid) {
                    this.showToast("Please fill all member details", "error");
                    return;
                }
                this.regData.members = membersList;
                this.regStep = 5;
                this.render();
            });
        }

        const s5Next = document.getElementById('wizardStep5Next');
        if (s5Next) {
            s5Next.addEventListener('click', () => {
                this.regData.mentor = {
                    name: document.getElementById('wizMentorName').value,
                    email: document.getElementById('wizMentorEmail').value,
                    mobile: document.getElementById('wizMentorMobile').value
                };
                this.regStep = 6;
                this.render();
            });
        }

        const backBtn = document.getElementById('wizardBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.regStep > 1) { this.regStep--; this.render(); }
            });
        }

        // Final Submit (Step 6)
        const finalSubmit = document.getElementById('wizardFinalSubmitBtn');
        if (finalSubmit) {
            finalSubmit.addEventListener('click', () => {
                this.regData.declarationInfo = document.getElementById('wizDeclInfo').checked;
                this.regData.declarationRules = document.getElementById('wizDeclRules').checked;
                this.regData.declarationInstitution = document.getElementById('wizDeclInst').checked;

                const validation = validateFullRegistrationPayload(this.regData, this.teams);
                if (!validation.isValid) {
                    const errAlert = document.getElementById('wizErrorAlert');
                    errAlert.innerText = validation.errors.duplicate || Object.values(validation.errors)[0];
                    errAlert.style.display = 'block';
                    return;
                }

                // Generate ID and create team record
                const newId = `NASA2026-BIAS-${Math.floor(1000 + Math.random() * 9000)}`;
                const newTeam = {
                    id: newId,
                    teamName: this.regData.teamName,
                    category: this.regData.category,
                    institutionName: this.regData.institutionName,
                    institution: this.regData.institutionName,
                    teamSize: this.regData.teamSize,
                    leaderName: this.regData.leaderName,
                    leaderEmail: this.regData.leaderEmail,
                    phone: this.regData.leaderMobile,
                    members: [
                        { name: this.regData.leaderName, email: this.regData.leaderEmail, phone: this.regData.leaderMobile, role: 'Team Leader', isLeader: true },
                        ...this.regData.members
                    ],
                    mentor: this.regData.mentor.name ? this.regData.mentor : null,
                    registrationDate: new Date().toISOString().split('T')[0],
                    status: 'Approved',
                    isDuplicate: false
                };

                this.teams.unshift(newTeam);
                this.createdTeam = newTeam;
                this.saveState();
                this.showToast("Registration Successful!", "success");
                this.navigate('success');
            });
        }

        // Success Page Pass Downloads
        document.querySelectorAll('.download-single-pass-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                const canvas = document.getElementById('hiddenPassCanvas');
                const team = this.createdTeam || this.teams[0];
                generateMemberIDBadgeCanvas(canvas, team, idx);
                downloadIDCard(canvas, `${team.id}_Badge_${idx + 1}.png`);
                this.showToast("ID Badge Downloaded!", "success");
            });
        });

        const successHomeBtn = document.getElementById('successGoHomeBtn');
        if (successHomeBtn) successHomeBtn.addEventListener('click', () => this.navigate('home'));

        // Admin Events
        const adminForm = document.getElementById('adminLoginForm');
        if (adminForm) {
            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const em = document.getElementById('loginEmail').value;
                const pw = document.getElementById('loginPassword').value;
                if (em === 'admin@nasa.gov' && pw === 'spaceapps2026') {
                    this.isAuthenticated = true;
                    localStorage.setItem('nasa_admin_auth', 'true');
                    this.navigate('admin');
                }
            });
        }

        const adminExit = document.getElementById('adminExitBtn');
        if (adminExit) adminExit.addEventListener('click', () => this.navigate('home'));

        const adminExportCsv = document.getElementById('adminExportCsvBtn');
        if (adminExportCsv) adminExportCsv.addEventListener('click', () => exportToCSV(this.teams));

        const adminExportExcel = document.getElementById('adminExportExcelBtn');
        if (adminExportExcel) adminExportExcel.addEventListener('click', () => exportToExcelHTML(this.teams));

        document.querySelectorAll('.admin-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm(`Delete team ${id}?`)) {
                    this.teams = this.teams.filter(t => t.id !== id);
                    this.saveState();
                    this.render();
                }
            });
        });

        // FAQ Accordions
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    }

    // Countdown Timer Logic
    startCountdownTimer() {
        const update = () => {
            const target = new Date('2026-11-14T09:00:00').getTime();
            const now = new Date().getTime();
            const diff = target - now;

            if (diff > 0) {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                const elD = document.getElementById('cdDays');
                const elH = document.getElementById('cdHours');
                const elM = document.getElementById('cdMins');
                const elS = document.getElementById('cdSecs');

                if (elD) elD.innerText = d;
                if (elH) elH.innerText = h;
                if (elM) elM.innerText = m;
                if (elS) elS.innerText = s;
            }
        };

        update();
        setInterval(update, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.nasaPortal = new NASAEventPortal();
});
