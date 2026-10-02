// NASA Space Apps Hackathon 2026 Admin Portal - Main Application

import { INITIAL_TEAMS, INITIAL_STATS, UPCOMING_EVENTS } from './data.js';
import { validateRegistrationPayload, checkDuplicates, sanitizeInput } from './zodValidation.js';
import { generateIDCardCanvas, downloadIDCard } from './idCardGenerator.js';
import { exportToCSV, exportToExcelHTML } from './exportUtils.js';
import { MockAPIService } from './mockApi.js';

class AdminPortal {
    constructor() {
        this.teams = JSON.parse(localStorage.getItem('nasa_teams')) || INITIAL_TEAMS;
        this.stats = INITIAL_STATS;
        this.isAuthenticated = localStorage.getItem('nasa_admin_auth') === 'true';
        this.currentView = 'dashboard'; // 'login', 'dashboard', 'registrations', 'idcards', 'security', 'api'
        this.searchQuery = '';
        this.categoryFilter = 'All';
        this.statusFilter = 'All';
        this.mockApi = new MockAPIService(this.teams, this.stats);
        
        this.init();
    }

    init() {
        this.bindEvents();
        if (!this.isAuthenticated) {
            this.renderView('login');
        } else {
            this.renderView('dashboard');
        }
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
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    bindEvents() {
        // Global search bar
        document.addEventListener('input', (e) => {
            if (e.target && e.target.id === 'globalSearchInput') {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.refreshCurrentView();
            }
        });
    }

    renderView(viewName) {
        this.currentView = viewName;
        const appContainer = document.getElementById('app');

        if (!this.isAuthenticated && viewName !== 'login') {
            viewName = 'login';
            this.currentView = 'login';
        }

        if (viewName === 'login') {
            appContainer.innerHTML = this.renderLoginHtml();
            this.attachLoginEvents();
            return;
        }

        appContainer.innerHTML = `
            <div class="dashboard-layout">
                ${this.renderSidebarHtml()}
                <div class="main-content">
                    ${this.renderTopbarHtml()}
                    <div class="page-body" id="pageBody">
                        ${this.renderCurrentViewContent()}
                    </div>
                </div>
            </div>
            <div id="modalContainer"></div>
            <div class="toast-container" id="toastContainer"></div>
        `;

        this.attachDashboardEvents();
        this.afterRenderView();
    }

    refreshCurrentView() {
        const body = document.getElementById('pageBody');
        if (body) {
            body.innerHTML = this.renderCurrentViewContent();
            this.afterRenderView();
        }
    }

    renderCurrentViewContent() {
        switch (this.currentView) {
            case 'dashboard':
                return this.renderDashboardContentHtml();
            case 'registrations':
                return this.renderRegistrationsContentHtml();
            case 'idcards':
                return this.renderIDCardsContentHtml();
            case 'security':
                return this.renderSecurityContentHtml();
            case 'api':
                return this.renderAPIPlaygroundContentHtml();
            default:
                return this.renderDashboardContentHtml();
        }
    }

    // 1. LOGIN PAGE HTML & LOGIC
    renderLoginHtml() {
        return `
            <div class="login-wrapper">
                <div class="login-hero-side" style="background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop');">
                    <div class="login-hero-overlay"></div>
                    <div class="login-hero-content">
                        <div class="login-brand">
                            <div class="nasa-logo-badge">NASA</div>
                            <div class="brand-text">
                                <h1>BIAS HACKATHON 2026</h1>
                                <p>Birla Institute of Applied Sciences, Bhimtal</p>
                            </div>
                        </div>
                        <h2 class="login-hero-title">EXPLORE.<br>INNOVATE.<br>COLLABORATE.</h2>
                        <p class="login-hero-sub">Welcome to the NASA Space Apps 2026 Command Center. Manage team registrations, issue official mission ID passes, audit duplicates, and monitor security telemetry.</p>
                    </div>
                    <div style="position: relative; z-index: 2; color: #64748b; font-family: monospace; font-size: 12px;">
                        SECURITY CLEARANCE REQUIRED | SYSTEM STATUS: ONLINE
                    </div>
                </div>

                <div class="login-form-side">
                    <div class="glass-panel login-card">
                        <div class="login-card-header">
                            <h2>Admin Authentication</h2>
                            <p>Enter your credentials to access the protected dashboard.</p>
                        </div>
                        <form id="loginForm">
                            <div class="form-group">
                                <label>Admin Email</label>
                                <div class="input-with-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <input type="email" id="loginEmail" class="input-field" value="admin@nasa.gov" required />
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <div class="input-with-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    <input type="password" id="loginPassword" class="input-field" value="spaceapps2026" required />
                                </div>
                            </div>
                            <div id="loginError" style="color: #ef4444; font-size: 12px; margin-bottom: 12px; display: none;"></div>
                            <button type="submit" class="btn-primary">
                                <span>AUTHENTICATE & LOG IN</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        </form>
                        <div class="demo-credentials-badge">
                            <div>
                                <strong>Demo Credentials:</strong><br>
                                <span style="font-family: monospace;">admin@nasa.gov</span> / <span style="font-family: monospace;">spaceapps2026</span>
                            </div>
                            <button type="button" class="demo-btn" id="fillDemoBtn">Quick Fill</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="toast-container" id="toastContainer"></div>
        `;
    }

    attachLoginEvents() {
        const form = document.getElementById('loginForm');
        const fillBtn = document.getElementById('fillDemoBtn');

        if (fillBtn) {
            fillBtn.addEventListener('click', () => {
                document.getElementById('loginEmail').value = 'admin@nasa.gov';
                document.getElementById('loginPassword').value = 'spaceapps2026';
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                if (email === 'admin@nasa.gov' && password === 'spaceapps2026') {
                    this.isAuthenticated = true;
                    localStorage.setItem('nasa_admin_auth', 'true');
                    this.showToast("Authentication Successful! Redirecting...", "success");
                    setTimeout(() => this.renderView('dashboard'), 800);
                } else {
                    const err = document.getElementById('loginError');
                    err.innerText = "Invalid credentials. Use admin@nasa.gov / spaceapps2026.";
                    err.style.display = 'block';
                }
            });
        }
    }

    // 2. SHELL LAYOUT (Sidebar & Topbar)
    renderSidebarHtml() {
        return `
            <aside class="sidebar">
                <div>
                    <div class="sidebar-logo">
                        <div class="nasa-logo-badge" style="width:36px; height:36px; font-size:12px;">NASA</div>
                        <div class="sidebar-logo-text">
                            BIAS SPACE 2026
                            <span>ADMIN CONTROL</span>
                        </div>
                    </div>
                    <ul class="nav-menu">
                        <li>
                            <a class="nav-item ${this.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                <span class="sidebar-text">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a class="nav-item ${this.currentView === 'registrations' ? 'active' : ''}" data-view="registrations">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <span class="sidebar-text">Teams & Registrations</span>
                                <span class="nav-badge">${this.teams.length}</span>
                            </a>
                        </li>
                        <li>
                            <a class="nav-item ${this.currentView === 'idcards' ? 'active' : ''}" data-view="idcards">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8h4"></path><path d="M6 12h8"></path><path d="M6 16h12"></path></svg>
                                <span class="sidebar-text">ID Card Reissue</span>
                            </a>
                        </li>
                        <li>
                            <a class="nav-item ${this.currentView === 'security' ? 'active' : ''}" data-view="security">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                <span class="sidebar-text">Security & Zod Audit</span>
                            </a>
                        </li>
                        <li>
                            <a class="nav-item ${this.currentView === 'api' ? 'active' : ''}" data-view="api">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                <span class="sidebar-text">API Endpoint Console</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="sidebar-footer">
                    <div class="user-mini-profile">
                        <div class="user-avatar">TS</div>
                        <div class="user-info sidebar-text">
                            <h4>Tushar Sati</h4>
                            <p>Chief Hackathon Admin</p>
                        </div>
                        <button id="logoutBtn" title="Logout" style="margin-left:auto; background:none; border:none; color:#ef4444; cursor:pointer;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </div>
            </aside>
        `;
    }

    renderTopbarHtml() {
        return `
            <header class="topbar">
                <div class="search-box-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="globalSearchInput" class="search-input" placeholder="Search team name, registration ID, participant name..." value="${this.searchQuery}" />
                </div>
                <div class="topbar-actions">
                    <div class="date-range-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>Sep 1, 2026 - Nov 30, 2026</span>
                    </div>
                    <button class="icon-btn" id="notifBtn" title="Notifications">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <span class="notification-dot"></span>
                    </button>
                </div>
            </header>
        `;
    }

    attachDashboardEvents() {
        // Sidebar navigation clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetView = e.currentTarget.getAttribute('data-view');
                if (targetView) this.renderView(targetView);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.isAuthenticated = false;
                localStorage.removeItem('nasa_admin_auth');
                this.renderView('login');
            });
        }
    }

    // 3. DASHBOARD VIEW CONTENT
    renderDashboardContentHtml() {
        const schoolCount = this.teams.filter(t => t.category === 'School').length;
        const collegeCount = this.teams.filter(t => t.category === 'College').length;
        const totalTeamsCount = this.teams.length;
        let totalParticipantsCount = 0;
        this.teams.forEach(t => { totalParticipantsCount += (t.membersCount || t.members?.length || 1); });

        const filteredTeams = this.getFilteredTeams().slice(0, 5);

        return `
            <div class="page-header">
                <div class="page-title">
                    <h2>Admin Dashboard</h2>
                    <p>Manage, Monitor & Empower Space Innovation at BIAS Bhimtal.</p>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary" id="quickExportCsvBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Export CSV</span>
                    </button>
                    <button class="btn-primary" id="addRegistrationModalBtn" style="width:auto; padding:10px 18px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Add Team</span>
                    </button>
                </div>
            </div>

            <!-- Statistics Grid -->
            <div class="stats-grid">
                <div class="glass-panel stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Total Registrations</span>
                        <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                    </div>
                    <div class="stat-value">${(1200 + totalParticipantsCount).toLocaleString()}</div>
                    <div class="stat-footer">
                        <span class="stat-trend positive">↑ 12%</span>
                        <span class="stat-desc">vs last month</span>
                    </div>
                </div>

                <div class="glass-panel stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Total Teams</span>
                        <div class="stat-icon" style="color:var(--accent-purple); background:rgba(138,43,226,0.1); border-color:rgba(138,43,226,0.3);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 21a8 8 0 0 0-16 0"></path><circle cx="10" cy="8" r="5"></circle><path d="M22 20c0-3.37-2-6.5-5-8"></path></svg></div>
                    </div>
                    <div class="stat-value">${totalTeamsCount}</div>
                    <div class="stat-footer">
                        <span class="stat-trend positive">↑ 8%</span>
                        <span class="stat-desc">registered teams</span>
                    </div>
                </div>

                <div class="glass-panel stat-card">
                    <div class="stat-header">
                        <span class="stat-title">School Teams</span>
                        <div class="stat-icon" style="color:#c084fc; background:rgba(192,132,252,0.1); border-color:rgba(192,132,252,0.3);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg></div>
                    </div>
                    <div class="stat-value">${schoolCount}</div>
                    <div class="stat-footer">
                        <span class="stat-desc">${((schoolCount / totalTeamsCount) * 100).toFixed(1)}% of total</span>
                    </div>
                </div>

                <div class="glass-panel stat-card">
                    <div class="stat-header">
                        <span class="stat-title">College Teams</span>
                        <div class="stat-icon" style="color:#38bdf8; background:rgba(56,189,248,0.1); border-color:rgba(56,189,248,0.3);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>
                    </div>
                    <div class="stat-value">${collegeCount}</div>
                    <div class="stat-footer">
                        <span class="stat-desc">${((collegeCount / totalTeamsCount) * 100).toFixed(1)}% of total</span>
                    </div>
                </div>
            </div>

            <!-- Charts Section (Growth + Breakdown) -->
            <div class="charts-grid">
                <div class="glass-panel chart-card">
                    <div class="chart-header">
                        <h3>Registrations Overview</h3>
                        <select class="chart-filter-select">
                            <option>Last 4 Months</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div class="svg-chart-container">
                        <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.4"/>
                                    <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.0"/>
                                </linearGradient>
                            </defs>
                            <!-- Grid lines -->
                            <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
                            <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
                            <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
                            
                            <!-- Area fill -->
                            <polygon points="0,170 80,140 200,90 350,110 500,40 600,60 600,180 0,180" fill="url(#lineGrad)" />
                            <!-- Smooth line -->
                            <path d="M0,170 Q80,140 200,90 T350,110 T500,40 T600,60" fill="none" stroke="#00f0ff" stroke-width="3" />
                            <!-- Data dots -->
                            <circle cx="80" cy="140" r="4" fill="#00f0ff" />
                            <circle cx="200" cy="90" r="4" fill="#00f0ff" />
                            <circle cx="350" cy="110" r="4" fill="#00f0ff" />
                            <circle cx="500" cy="40" r="4" fill="#00f0ff" />
                            <circle cx="600" cy="60" r="4" fill="#00f0ff" />
                        </svg>
                    </div>
                </div>

                <div class="glass-panel chart-card">
                    <div class="chart-header">
                        <h3>Team Distribution</h3>
                    </div>
                    <div class="donut-wrapper">
                        <svg width="140" height="140" viewBox="0 0 100 100">
                            <!-- College Circle -->
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#0072ff" stroke-width="12" stroke-dasharray="140 251.2" stroke-dashoffset="0" />
                            <!-- School Circle -->
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" stroke-width="12" stroke-dasharray="111.2 251.2" stroke-dashoffset="-140" />
                            <text x="50" y="52" text-anchor="middle" fill="#fff" font-family="Orbitron" font-size="16" font-weight="bold">${totalTeamsCount}</text>
                            <text x="50" y="64" text-anchor="middle" fill="#94a3b8" font-size="9">Teams</text>
                        </svg>
                        <div class="donut-legend">
                            <div class="legend-item">
                                <div><span class="legend-color-dot" style="background:#0072ff;"></span>College Teams</div>
                                <strong>${collegeCount} (${((collegeCount/totalTeamsCount)*100).toFixed(0)}%)</strong>
                            </div>
                            <div class="legend-item">
                                <div><span class="legend-color-dot" style="background:#a855f7;"></span>School Teams</div>
                                <strong>${schoolCount} (${((schoolCount/totalTeamsCount)*100).toFixed(0)}%)</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Registrations Table -->
            <div class="glass-panel" style="padding:24px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                    <h3 style="font-family:var(--font-heading); color:#fff; font-size:18px;">Recent Registrations</h3>
                    <a class="nav-item" data-view="registrations" style="color:var(--accent-cyan); cursor:pointer; font-size:13px;">View All Teams →</a>
                </div>
                ${this.renderTeamsTableHtml(filteredTeams)}
            </div>
        `;
    }

    // 4. TEAMS & REGISTRATION MANAGEMENT CONTENT
    renderRegistrationsContentHtml() {
        const teamsToDisplay = this.getFilteredTeams();

        return `
            <div class="page-header">
                <div class="page-title">
                    <h2>Manage Registrations</h2>
                    <p>View teams, edit participant records, reissue ID passes, and audit duplicates.</p>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary" id="exportCsvBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Export CSV</span>
                    </button>
                    <button class="btn-secondary" id="exportExcelBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18"></path><path d="M15 3v18"></path></svg>
                        <span>Export Excel</span>
                    </button>
                    <button class="btn-primary" id="openAddModalBtn" style="width:auto; padding:10px 18px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>New Registration</span>
                    </button>
                </div>
            </div>

            <div class="glass-panel" style="padding:24px;">
                <div class="table-controls">
                    <div class="filter-pills">
                        <button class="pill-btn ${this.categoryFilter === 'All' ? 'active' : ''}" data-cat="All">All Categories</button>
                        <button class="pill-btn ${this.categoryFilter === 'College' ? 'active' : ''}" data-cat="College">College Teams</button>
                        <button class="pill-btn ${this.categoryFilter === 'School' ? 'active' : ''}" data-cat="School">School Teams</button>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:12px; color:var(--text-dim);">STATUS:</span>
                        <select id="statusFilterSelect" class="chart-filter-select">
                            <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                            <option value="Approved" ${this.statusFilter === 'Approved' ? 'selected' : ''}>Approved</option>
                            <option value="Pending" ${this.statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Flagged" ${this.statusFilter === 'Flagged' ? 'selected' : ''}>Flagged (Duplicates)</option>
                        </select>
                    </div>
                </div>

                ${this.renderTeamsTableHtml(teamsToDisplay)}
            </div>
        `;
    }

    renderTeamsTableHtml(teamsArray) {
        if (!teamsArray || teamsArray.length === 0) {
            return `
                <div style="text-align:center; padding:40px; color:var(--text-muted);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px; opacity:0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <p>No matching team registrations found.</p>
                </div>
            `;
        }

        return `
            <div class="table-wrapper">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>REG ID</th>
                            <th>TEAM NAME & INSTITUTION</th>
                            <th>TEAM LEADER</th>
                            <th>CONTACT PHONE</th>
                            <th>CATEGORY</th>
                            <th>STATUS</th>
                            <th style="text-align:right;">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teamsArray.map(t => `
                            <tr>
                                <td style="font-family:monospace; color:var(--accent-cyan); font-weight:700;">${t.id}</td>
                                <td>
                                    <div class="team-name-cell">
                                        <span class="team-title">${t.teamName} ${t.isDuplicate ? '⚠️' : ''}</span>
                                        <span class="team-inst">${t.institution}</span>
                                    </div>
                                </td>
                                <td>
                                    <div><strong>${t.leaderName}</strong></div>
                                    <div style="font-size:11px; color:var(--text-muted);">${t.leaderEmail}</div>
                                </td>
                                <td style="font-family:monospace; font-size:12px;">${t.phone}</td>
                                <td>
                                    <span class="category-tag ${t.category.toLowerCase()}">${t.category}</span>
                                </td>
                                <td>
                                    <span class="status-badge ${t.status.toLowerCase()}">
                                        ${t.status === 'Approved' ? '✓ Approved' : t.status === 'Pending' ? '⏳ Pending' : '⚠️ Flagged'}
                                    </span>
                                </td>
                                <td style="text-align:right;">
                                    <div class="action-buttons" style="justify-content:flex-end;">
                                        <button class="action-icon-btn view-team-btn" data-id="${t.id}" title="View Team Details">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </button>
                                        <button class="action-icon-btn edit-team-btn" data-id="${t.id}" title="Edit Team Record">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button class="action-icon-btn reissue-id-btn" data-id="${t.id}" title="Reissue ID Card">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8h4"></path><path d="M6 12h8"></path></svg>
                                        </button>
                                        <button class="action-icon-btn danger delete-team-btn" data-id="${t.id}" title="Delete Record">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 5. ID CARD REISSUE VIEW
    renderIDCardsContentHtml() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h2>ID Card Reissue Center</h2>
                    <p>Regenerate, preview, and download official NASA Space Apps 2026 security badges.</p>
                </div>
            </div>

            <div class="glass-panel" style="padding:32px;">
                <div style="max-width:500px; margin:0 auto 32px auto; display:flex; flex-direction:column; gap:16px;">
                    <label style="font-weight:600; color:var(--text-muted);">SELECT REGISTERED TEAM:</label>
                    <select id="idCardTeamSelect" class="input-field" style="padding-left:14px;">
                        ${this.teams.map(t => `
                            <option value="${t.id}">${t.id} - ${t.teamName} (${t.leaderName})</option>
                        `).join('')}
                    </select>
                </div>

                <div class="id-card-view-wrapper">
                    <canvas id="idCardCanvas" class="canvas-preview-box"></canvas>
                    <div style="display:flex; gap:16px;">
                        <button class="btn-secondary" id="regenHashBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                            <span>Regenerate Security Hash</span>
                        </button>
                        <button class="btn-primary" id="downloadBadgePngBtn" style="width:auto; padding:10px 24px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            <span>Download ID Badge (PNG)</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 6. SECURITY & ZOD AUDIT VIEW
    renderSecurityContentHtml() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h2>Security, Sanitization & Zod Validation Audit</h2>
                    <p>Live telemetry monitoring rate limits, XSS prevention, duplicate email/phone flags, and Zod schemas.</p>
                </div>
            </div>

            <div class="charts-grid">
                <div class="glass-panel" style="padding:24px;">
                    <h3 style="font-family:var(--font-heading); color:#fff; font-size:18px; margin-bottom:16px;">Rate Limiting Simulator</h3>
                    <p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">Prevents spam registration attacks (Token Bucket: 5 requests / min per IP).</p>
                    <button class="btn-primary" id="triggerSpamRateLimitBtn" style="width:auto; padding:10px 18px; margin-bottom:16px;">
                        <span>Simulate 6 Rapid Registration Calls</span>
                    </button>
                    <div id="rateLimitLog" class="terminal-box" style="height:140px;">
                        <div>[SYSTEM] Rate Limiter initialized. Limit: 5 req/min.</div>
                    </div>
                </div>

                <div class="glass-panel" style="padding:24px;">
                    <h3 style="font-family:var(--font-heading); color:#fff; font-size:18px; margin-bottom:16px;">Duplicate Audit Scanner</h3>
                    <p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">Scans email & phone numbers for collision across teams.</p>
                    <div style="font-size:36px; font-weight:700; font-family:var(--font-heading); color:#ef4444; margin-bottom:8px;">
                        ${this.teams.filter(t => t.isDuplicate).length} Flagged Teams
                    </div>
                    <p style="color:var(--text-dim); font-size:12px;">Automatic prevention active during POST /registration.</p>
                </div>
            </div>

            <div class="glass-panel" style="padding:24px; margin-top:24px;">
                <h3 style="font-family:var(--font-heading); color:#fff; font-size:18px; margin-bottom:16px;">Zod Schema Validation Playground</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div>
                        <div class="form-group">
                            <label>Test Team Name</label>
                            <input type="text" id="zodTestTeam" class="input-field" value="Ab" style="padding-left:14px;" />
                        </div>
                        <div class="form-group">
                            <label>Test Email</label>
                            <input type="text" id="zodTestEmail" class="input-field" value="invalid-email-format" style="padding-left:14px;" />
                        </div>
                        <div class="form-group">
                            <label>Test Phone</label>
                            <input type="text" id="zodTestPhone" class="input-field" value="123" style="padding-left:14px;" />
                        </div>
                        <button class="btn-secondary" id="runZodTestBtn" style="width:100%;">
                            <span>Execute Zod Schema Check</span>
                        </button>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:600; color:var(--text-muted);">ZOD VALIDATION OUTPUT:</label>
                        <div id="zodTestOutput" class="terminal-box" style="height:210px; margin-top:8px;">
                            <div>// Click 'Execute Zod Schema Check' to view Zod response</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 7. API PLAYGROUND VIEW
    renderAPIPlaygroundContentHtml() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h2>API Endpoint Console</h2>
                    <p>Test the 4 specified REST endpoints directly against the simulated mock backend.</p>
                </div>
            </div>

            <div class="glass-panel" style="padding:24px;">
                <div style="display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap;">
                    <button class="pill-btn active api-endpoint-btn" data-ep="stats">GET /admin/stats</button>
                    <button class="pill-btn api-endpoint-btn" data-ep="get-reg">GET /registration/REG-2026-8891</button>
                    <button class="pill-btn api-endpoint-btn" data-ep="id-card">GET /id-card/REG-2026-8891</button>
                    <button class="pill-btn api-endpoint-btn" data-ep="post-reg">POST /registration</button>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div id="apiStatusBadge" style="font-family:monospace; color:#10b981; font-weight:700;">HTTP STATUS: 200 OK</div>
                    <div id="apiTimeBadge" style="font-family:monospace; color:var(--text-muted); font-size:12px;">RESPONSE TIME: 18ms</div>
                </div>

                <div id="apiConsoleOutput" class="terminal-box" style="height:340px;">
                    <div>Executing initial GET /admin/stats...</div>
                </div>
            </div>
        `;
    }

    // View Event listeners & Modals
    afterRenderView() {
        // Handle filter buttons in Registrations view
        document.querySelectorAll('.filter-pills .pill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.categoryFilter = e.target.getAttribute('data-cat');
                this.refreshCurrentView();
            });
        });

        const statusSelect = document.getElementById('statusFilterSelect');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.refreshCurrentView();
            });
        }

        // Export CSV & Excel buttons
        const csvBtns = [document.getElementById('exportCsvBtn'), document.getElementById('quickExportCsvBtn')];
        csvBtns.forEach(b => {
            if (b) b.addEventListener('click', () => {
                exportToCSV(this.getFilteredTeams());
                this.showToast("CSV Export generated successfully!", "success");
            });
        });

        const excelBtn = document.getElementById('exportExcelBtn');
        if (excelBtn) {
            excelBtn.addEventListener('click', () => {
                exportToExcelHTML(this.getFilteredTeams());
                this.showToast("Excel Export generated successfully!", "success");
            });
        }

        // Open Add Modal
        const addBtns = [document.getElementById('openAddModalBtn'), document.getElementById('addRegistrationModalBtn')];
        addBtns.forEach(b => {
            if (b) b.addEventListener('click', () => this.showRegistrationModal());
        });

        // Table Action Buttons
        document.querySelectorAll('.view-team-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showViewModal(e.currentTarget.getAttribute('data-id')));
        });
        document.querySelectorAll('.edit-team-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showRegistrationModal(e.currentTarget.getAttribute('data-id')));
        });
        document.querySelectorAll('.reissue-id-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.renderView('idcards');
                setTimeout(() => {
                    const select = document.getElementById('idCardTeamSelect');
                    if (select) {
                        select.value = id;
                        select.dispatchEvent(new Event('change'));
                    }
                }, 100);
            });
        });
        document.querySelectorAll('.delete-team-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.confirmDeleteTeam(e.currentTarget.getAttribute('data-id')));
        });

        // ID Card Canvas rendering logic
        if (this.currentView === 'idcards') {
            const select = document.getElementById('idCardTeamSelect');
            const canvas = document.getElementById('idCardCanvas');
            const downloadBtn = document.getElementById('downloadBadgePngBtn');
            const regenBtn = document.getElementById('regenHashBtn');

            const drawCard = () => {
                const teamId = select.value;
                const team = this.teams.find(t => t.id === teamId);
                if (team && canvas) {
                    generateIDCardCanvas(canvas, team);
                }
            };

            if (select) select.addEventListener('change', drawCard);
            drawCard();

            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    const teamId = select.value;
                    downloadIDCard(canvas, `NASA_ID_Card_${teamId}.png`);
                    this.showToast(`ID Card downloaded for ${teamId}`, "success");
                });
            }

            if (regenBtn) {
                regenBtn.addEventListener('click', () => {
                    drawCard();
                    this.showToast("Security hash regenerated!", "info");
                });
            }
        }

        // Security View Events
        if (this.currentView === 'security') {
            const spamBtn = document.getElementById('triggerSpamRateLimitBtn');
            const logBox = document.getElementById('rateLimitLog');

            if (spamBtn) {
                spamBtn.addEventListener('click', async () => {
                    logBox.innerHTML = '';
                    for (let i = 1; i <= 6; i++) {
                        const res = await this.mockApi.createRegistration({
                            teamName: `SpamTeam ${i}`,
                            category: "School",
                            institution: "Spam Academy",
                            leaderName: "Spammer",
                            leaderEmail: `spam${i}@test.com`,
                            phone: "+91 99999 99999",
                            challenge: "Exoplanet Climate Modeling"
                        });

                        const line = document.createElement('div');
                        if (res.status === 429) {
                            line.style.color = '#ef4444';
                            line.innerHTML = `[REQ #${i}] HTTP 429 TOO MANY REQUESTS: ${res.error}`;
                        } else {
                            line.style.color = '#10b981';
                            line.innerHTML = `[REQ #${i}] HTTP ${res.status}: Team Registered. (Remaining: ${res.status === 201 ? 'Allowed' : 0})`;
                        }
                        logBox.appendChild(line);
                    }
                });
            }

            const runZodBtn = document.getElementById('runZodTestBtn');
            const zodOut = document.getElementById('zodTestOutput');
            if (runZodBtn) {
                runZodBtn.addEventListener('click', () => {
                    const teamName = document.getElementById('zodTestTeam').value;
                    const email = document.getElementById('zodTestEmail').value;
                    const phone = document.getElementById('zodTestPhone').value;

                    const res = validateRegistrationPayload({
                        teamName,
                        category: "School",
                        institution: "Test School",
                        leaderName: "Test Leader",
                        leaderEmail: email,
                        phone,
                        challenge: "Exoplanet"
                    });

                    zodOut.innerHTML = `<pre style="color:${res.isValid ? '#10b981' : '#ef4444'};">${JSON.stringify(res, null, 2)}</pre>`;
                });
            }
        }

        // API Playground Events
        if (this.currentView === 'api') {
            const consoleOut = document.getElementById('apiConsoleOutput');
            const statusBadge = document.getElementById('apiStatusBadge');
            const timeBadge = document.getElementById('apiTimeBadge');

            const executeEp = async (type) => {
                let res;
                if (type === 'stats') res = await this.mockApi.getAdminStats();
                else if (type === 'get-reg') res = await this.mockApi.getRegistration('REG-2026-8891');
                else if (type === 'id-card') res = await this.mockApi.getIDCard('REG-2026-8891');
                else if (type === 'post-reg') {
                    res = await this.mockApi.createRegistration({
                        teamName: "Supernova AI",
                        category: "College",
                        institution: "IIT Bombay",
                        leaderName: "Sahil Kumar",
                        leaderEmail: "sahil.k@iitb.ac.in",
                        phone: "+91 99881 12233",
                        challenge: "Deep Space Signal Processing"
                    });
                }

                statusBadge.innerText = `HTTP STATUS: ${res.status} ${res.statusText}`;
                statusBadge.style.color = res.status < 300 ? '#10b981' : '#ef4444';
                timeBadge.innerText = `RESPONSE TIME: ${res.timeMs}ms`;

                consoleOut.innerHTML = `<pre style="color:#38bdf8;">${JSON.stringify(res, null, 2)}</pre>`;
            };

            document.querySelectorAll('.api-endpoint-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.api-endpoint-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    executeEp(e.currentTarget.getAttribute('data-ep'));
                });
            });

            // Initial exec
            executeEp('stats');
        }
    }

    getFilteredTeams() {
        return this.teams.filter(t => {
            const matchesSearch = !this.searchQuery || 
                t.teamName.toLowerCase().includes(this.searchQuery) ||
                t.id.toLowerCase().includes(this.searchQuery) ||
                t.leaderName.toLowerCase().includes(this.searchQuery) ||
                t.leaderEmail.toLowerCase().includes(this.searchQuery);

            const matchesCat = this.categoryFilter === 'All' || t.category === this.categoryFilter;
            const matchesStatus = this.statusFilter === 'All' || t.status === this.statusFilter;

            return matchesSearch && matchesCat && matchesStatus;
        });
    }

    // Modal Implementations
    showViewModal(id) {
        const team = this.teams.find(t => t.id === id);
        if (!team) return;

        const container = document.getElementById('modalContainer');
        container.innerHTML = `
            <div class="modal-overlay active">
                <div class="glass-panel modal-content">
                    <div class="modal-header">
                        <h3>Team Details: ${team.id}</h3>
                        <button class="close-modal-btn">&times;</button>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <div><strong style="color:var(--accent-cyan); font-size:18px;">${team.teamName}</strong> <span class="category-tag ${team.category.toLowerCase()}">${team.category}</span></div>
                        <div style="font-size:13px; color:var(--text-muted);">Institution: <strong>${team.institution}</strong></div>
                        <div style="font-size:13px; color:var(--text-muted);">Challenge Track: <strong>${team.challenge}</strong></div>
                        <div style="font-size:13px; color:var(--text-muted);">Registration Date: ${team.registrationDate}</div>
                        ${team.isDuplicate ? `<div style="padding:10px; background:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#ef4444; border-radius:8px; font-size:12px;">⚠️ ${team.duplicateReason}</div>` : ''}
                        
                        <h4 style="font-family:var(--font-heading); color:#fff; margin-top:12px;">Registered Members (${team.members?.length || 1})</h4>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${(team.members || [{ name: team.leaderName, role: 'Leader', email: team.leaderEmail, phone: team.phone }]).map(m => `
                                <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <div style="font-weight:600; color:#fff;">${m.name} <span style="font-size:11px; color:var(--accent-cyan);">(${m.role})</span></div>
                                        <div style="font-size:11px; color:var(--text-dim);">${m.email} | ${m.phone}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.querySelector('.close-modal-btn').addEventListener('click', () => {
            container.innerHTML = '';
        });
    }

    showRegistrationModal(editId = null) {
        const team = editId ? this.teams.find(t => t.id === editId) : null;
        const container = document.getElementById('modalContainer');

        container.innerHTML = `
            <div class="modal-overlay active">
                <div class="glass-panel modal-content">
                    <div class="modal-header">
                        <h3>${team ? 'Edit Team Registration' : 'New Team Registration'}</h3>
                        <button class="close-modal-btn">&times;</button>
                    </div>
                    <form id="regForm">
                        <div class="form-group">
                            <label>Team Name *</label>
                            <input type="text" id="formTeamName" class="input-field" value="${team ? team.teamName : ''}" style="padding-left:14px;" required />
                            <div class="field-error" id="errTeamName"></div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label>Category *</label>
                                <select id="formCategory" class="input-field" style="padding-left:14px;">
                                    <option value="College" ${team && team.category === 'College' ? 'selected' : ''}>College Division</option>
                                    <option value="School" ${team && team.category === 'School' ? 'selected' : ''}>School Division</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select id="formStatus" class="input-field" style="padding-left:14px;">
                                    <option value="Approved" ${team && team.status === 'Approved' ? 'selected' : ''}>Approved</option>
                                    <option value="Pending" ${team && team.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Flagged" ${team && team.status === 'Flagged' ? 'selected' : ''}>Flagged</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>School / College Name *</label>
                            <input type="text" id="formInstitution" class="input-field" value="${team ? team.institution : ''}" style="padding-left:14px;" required />
                            <div class="field-error" id="errInstitution"></div>
                        </div>
                        <div class="form-group">
                            <label>Team Leader Full Name *</label>
                            <input type="text" id="formLeaderName" class="input-field" value="${team ? team.leaderName : ''}" style="padding-left:14px;" required />
                            <div class="field-error" id="errLeaderName"></div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label>Leader Email *</label>
                                <input type="email" id="formLeaderEmail" class="input-field" value="${team ? team.leaderEmail : ''}" style="padding-left:14px;" required />
                                <div class="field-error" id="errLeaderEmail"></div>
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="text" id="formPhone" class="input-field" value="${team ? team.phone : ''}" style="padding-left:14px;" required />
                                <div class="field-error" id="errPhone"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>NASA Challenge Track *</label>
                            <select id="formChallenge" class="input-field" style="padding-left:14px;">
                                <option value="Exoplanet Climate Modeling">Exoplanet Climate Modeling</option>
                                <option value="Interactive Mapping of Space Debris">Interactive Mapping of Space Debris</option>
                                <option value="Lunar Habitat Life Support System">Lunar Habitat Life Support System</option>
                                <option value="Solar Storm Early Warning App">Solar Storm Early Warning App</option>
                                <option value="Deep Space Signal Processing">Deep Space Signal Processing</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary" style="margin-top:16px;">
                            <span>${team ? 'SAVE CHANGES' : 'CREATE REGISTRATION'}</span>
                        </button>
                    </form>
                </div>
            </div>
        `;

        container.querySelector('.close-modal-btn').addEventListener('click', () => container.innerHTML = '');

        const form = document.getElementById('regForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Clear errors
            document.querySelectorAll('.field-error').forEach(el => el.innerText = '');

            const payload = {
                teamName: document.getElementById('formTeamName').value,
                category: document.getElementById('formCategory').value,
                institution: document.getElementById('formInstitution').value,
                leaderName: document.getElementById('formLeaderName').value,
                leaderEmail: document.getElementById('formLeaderEmail').value,
                phone: document.getElementById('formPhone').value,
                challenge: document.getElementById('formChallenge').value,
                status: document.getElementById('formStatus').value
            };

            const validation = validateRegistrationPayload(payload);
            if (!validation.isValid) {
                Object.keys(validation.errors).forEach(key => {
                    const errEl = document.getElementById(`err${key.charAt(0).toUpperCase() + key.slice(1)}`);
                    if (errEl) errEl.innerText = validation.errors[key];
                });
                return;
            }

            if (team) {
                // Update existing
                const index = this.teams.findIndex(t => t.id === team.id);
                if (index !== -1) {
                    const dupCheck = checkDuplicates(validation.sanitizedData, this.teams, team.id);
                    this.teams[index] = {
                        ...this.teams[index],
                        ...validation.sanitizedData,
                        status: payload.status,
                        isDuplicate: dupCheck.hasDuplicate,
                        duplicateReason: dupCheck.hasDuplicate ? dupCheck.matches[0].reason : null
                    };
                    this.saveState();
                    this.showToast("Registration record updated!", "success");
                }
            } else {
                // Create new
                const res = await this.mockApi.createRegistration(payload);
                if (res.status === 201) {
                    this.saveState();
                    this.showToast(res.message, "success");
                } else {
                    this.showToast(res.error, "error");
                }
            }

            container.innerHTML = '';
            this.refreshCurrentView();
        });
    }

    confirmDeleteTeam(id) {
        if (confirm(`Are you sure you want to delete registration record ${id}?`)) {
            this.teams = this.teams.filter(t => t.id !== id);
            this.saveState();
            this.showToast(`Registration ${id} deleted!`, "info");
            this.refreshCurrentView();
        }
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminPortal = new AdminPortal();
});
