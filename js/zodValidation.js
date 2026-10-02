// Zod-like runtime schema validation, XSS sanitization, duplicate detection, and rate limiting

// 1. Input Sanitization (strips script tags and dangerous HTML attributes)
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>]/g, function(c) {
            return { '<': '&lt;', '>': '&gt;' }[c];
        })
        .trim();
}

// 2. Zod-style Registration Validation Schema
export function validateRegistrationPayload(data) {
    const errors = {};

    // Team Name validation: string, min 3 chars, max 50 chars
    const teamName = sanitizeInput(data.teamName || '');
    if (!teamName) {
        errors.teamName = "Team name is required";
    } else if (teamName.length < 3) {
        errors.teamName = "Team name must be at least 3 characters";
    } else if (teamName.length > 50) {
        errors.teamName = "Team name cannot exceed 50 characters";
    }

    // Category validation: enum ['School', 'College']
    if (!['School', 'College'].includes(data.category)) {
        errors.category = "Category must be either 'School' or 'College'";
    }

    // Institution validation
    const institution = sanitizeInput(data.institution || '');
    if (!institution || institution.length < 2) {
        errors.institution = "School/College name is required";
    }

    // Leader Name validation
    const leaderName = sanitizeInput(data.leaderName || '');
    if (!leaderName || leaderName.length < 2) {
        errors.leaderName = "Leader full name is required";
    }

    // Leader Email validation (Regex check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const leaderEmail = sanitizeInput(data.leaderEmail || '').toLowerCase();
    if (!leaderEmail) {
        errors.leaderEmail = "Email address is required";
    } else if (!emailRegex.test(leaderEmail)) {
        errors.leaderEmail = "Invalid email format (e.g. name@domain.com)";
    }

    // Phone Number validation (min 10 digits)
    const phoneClean = (data.phone || '').replace(/[^0-9+]/g, '');
    if (!phoneClean || phoneClean.replace(/[^0-9]/g, '').length < 10) {
        errors.phone = "Valid 10-digit phone number is required";
    }

    // Challenge track validation
    if (!data.challenge) {
        errors.challenge = "Please select a NASA Space Apps challenge";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: {
            ...data,
            teamName,
            institution,
            leaderName,
            leaderEmail,
            phone: data.phone
        }
    };
}

// 3. Duplicate Detection Engine (Email & Phone Number matching)
export function checkDuplicates(newPayload, existingTeams, excludeId = null) {
    const targetEmail = (newPayload.leaderEmail || '').toLowerCase().trim();
    const targetPhone = (newPayload.phone || '').replace(/[^0-9]/g, '');

    const duplicateMatches = [];

    existingTeams.forEach(team => {
        if (excludeId && team.id === excludeId) return;

        const teamEmail = (team.leaderEmail || '').toLowerCase().trim();
        const teamPhone = (team.phone || '').replace(/[^0-9]/g, '');

        if (targetEmail && teamEmail === targetEmail) {
            duplicateMatches.push({
                field: 'email',
                matchedTeamId: team.id,
                matchedTeamName: team.teamName,
                matchedLeader: team.leaderName,
                value: team.leaderEmail,
                reason: `Email '${team.leaderEmail}' is already registered with Team '${team.teamName}' (${team.id})`
            });
        }

        if (targetPhone && teamPhone.length >= 10 && teamPhone === targetPhone) {
            duplicateMatches.push({
                field: 'phone',
                matchedTeamId: team.id,
                matchedTeamName: team.teamName,
                matchedLeader: team.leaderName,
                value: team.phone,
                reason: `Phone number '${team.phone}' is already registered with Team '${team.teamName}' (${team.id})`
            });
        }
    });

    return {
        hasDuplicate: duplicateMatches.length > 0,
        matches: duplicateMatches
    };
}

// 4. Rate Limiting System (Token Bucket Simulator)
export class RateLimiter {
    constructor(maxRequests = 5, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    checkRateLimit(ip = '127.0.0.1') {
        const now = Date.now();
        // Clear requests outside time window
        this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);

        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const retryAfterSec = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
            return {
                allowed: false,
                statusCode: 429,
                message: `Rate limit exceeded. Too many registration attempts from ${ip}.`,
                retryAfterSec,
                remaining: 0,
                total: this.maxRequests
            };
        }

        this.requests.push(now);
        return {
            allowed: true,
            statusCode: 200,
            remaining: this.maxRequests - this.requests.length,
            total: this.maxRequests
        };
    }

    reset() {
        this.requests = [];
    }
}
