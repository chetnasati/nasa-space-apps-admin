// NASA Space Apps 2026 - Simulated REST API Handlers

import { validateFullRegistrationPayload, checkDatabaseDuplicates, RateLimiter } from './zodValidation.js';

export class MockAPIService {
    constructor(teamsState, statsState) {
        this.teams = teamsState;
        this.stats = statsState;
        this.rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
    }

    // 1. GET /admin/stats
    async getAdminStats() {
        // Calculate dynamic stats from current teams array
        const totalTeams = this.teams.length;
        const schoolTeams = this.teams.filter(t => t.category === 'School').length;
        const collegeTeams = this.teams.filter(t => t.category === 'College').length;
        const pendingApprovals = this.teams.filter(t => t.status === 'Pending').length;
        const flaggedDuplicates = this.teams.filter(t => t.isDuplicate).length;
        
        let totalParticipants = 0;
        this.teams.forEach(t => { totalParticipants += (t.membersCount || t.members?.length || 1); });

        const data = {
            totalRegistrations: totalParticipants,
            totalTeams,
            schoolTeams,
            collegeTeams,
            activeMissions: 8,
            upcomingEvents: 6,
            pendingApprovals,
            flaggedDuplicates,
            lastUpdated: new Date().toISOString()
        };

        return {
            status: 200,
            statusText: "OK",
            timeMs: Math.floor(Math.random() * 20) + 15,
            data
        };
    }

    // 2. GET /registration/{id}
    async getRegistration(id) {
        const team = this.teams.find(t => t.id.toLowerCase() === id.toLowerCase());
        if (!team) {
            return {
                status: 404,
                statusText: "Not Found",
                timeMs: 12,
                error: `Registration with ID '${id}' was not found in NASA database.`
            };
        }

        return {
            status: 200,
            statusText: "OK",
            timeMs: 18,
            data: team
        };
    }

    // 3. GET /id-card/{id}
    async getIDCard(id) {
        const team = this.teams.find(t => t.id.toLowerCase() === id.toLowerCase());
        if (!team) {
            return {
                status: 404,
                statusText: "Not Found",
                timeMs: 15,
                error: `Cannot generate ID Card. Registration ID '${id}' not found.`
            };
        }

        return {
            status: 200,
            statusText: "OK",
            timeMs: 25,
            data: {
                registrationId: team.id,
                teamName: team.teamName,
                leaderName: team.leaderName,
                category: team.category,
                institution: team.institution || team.institutionName,
                badgeUrl: `/id-card/${team.id}`,
                issuedStatus: team.idCardIssued ? "ISSUED" : "PENDING_REISSUE",
                securityToken: `NASA-SEC-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            }
        };
    }

    // 4. POST /registration
    async createRegistration(payload, clientIp = '192.168.1.100') {
        // Rate limiting check
        const rateCheck = this.rateLimiter.checkRateLimit(clientIp);
        if (!rateCheck.allowed) {
            return {
                status: 429,
                statusText: "Too Many Requests",
                timeMs: 8,
                error: rateCheck.message,
                retryAfterSec: rateCheck.retryAfterSec
            };
        }

        // Zod Validation
        const validation = validateFullRegistrationPayload(payload, this.teams);
        if (!validation.isValid) {
            return {
                status: 400,
                statusText: "Bad Request (Validation Failed)",
                timeMs: 14,
                error: "Zod Schema Validation Error",
                validationErrors: validation.errors
            };
        }

        const newId = `NASA2026-BIAS-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTeam = {
            id: newId,
            teamName: validation.sanitizedData.teamName,
            category: validation.sanitizedData.category || "College",
            institution: validation.sanitizedData.institutionName || validation.sanitizedData.institution,
            institutionName: validation.sanitizedData.institutionName || validation.sanitizedData.institution,
            leaderName: validation.sanitizedData.leaderName,
            leaderEmail: validation.sanitizedData.leaderEmail,
            phone: validation.sanitizedData.leaderMobile,
            membersCount: validation.sanitizedData.teamSize || 4,
            members: validation.sanitizedData.members || [
                {
                    name: validation.sanitizedData.leaderName,
                    role: "Team Leader",
                    email: validation.sanitizedData.leaderEmail,
                    phone: validation.sanitizedData.leaderMobile
                }
            ],
            challenge: validation.sanitizedData.challenge || "Space Innovation",
            registrationDate: new Date().toISOString().split('T')[0],
            status: "Approved",
            isDuplicate: false,
            idCardIssued: true,
            issueDate: new Date().toISOString().split('T')[0]
        };

        this.teams.unshift(newTeam);

        return {
            status: 201,
            statusText: "Created",
            timeMs: 35,
            message: "Registration successful!",
            data: newTeam
        };
    }
}

