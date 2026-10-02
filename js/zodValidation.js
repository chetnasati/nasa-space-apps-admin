// NASA Space Apps 2026 - Zod Schema Validation & Duplicate Prevention Engine

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>]/g, function(c) {
            return { '<': '&lt;', '>': '&gt;' }[c];
        })
        .trim();
}

// Full 6-Step Registration Payload Validation
export function validateFullRegistrationPayload(formData, existingTeams = []) {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Category check
    if (!['School', 'College'].includes(formData.category)) {
        errors.category = "Please select either School Level or College Level";
    }

    // 2. Team Info check
    const teamName = sanitizeInput(formData.teamName || '');
    if (!teamName || teamName.length < 3) {
        errors.teamName = "Team name must be at least 3 characters long";
    }

    const institutionName = sanitizeInput(formData.institutionName || '');
    if (!institutionName || institutionName.length < 2) {
        errors.institutionName = "School/College name is required";
    }

    const teamSize = parseInt(formData.teamSize, 10);
    if (isNaN(teamSize) || teamSize < 4 || teamSize > 6) {
        errors.teamSize = "Team size must be between 4 and 6 members";
    }

    // 3. Team Leader check
    const leaderName = sanitizeInput(formData.leaderName || '');
    if (!leaderName || leaderName.length < 2) {
        errors.leaderName = "Leader full name is required";
    }

    const leaderEmail = sanitizeInput(formData.leaderEmail || '').toLowerCase();
    if (!leaderEmail || !emailRegex.test(leaderEmail)) {
        errors.leaderEmail = "Valid email address required";
    }

    const leaderMobile = (formData.leaderMobile || '').replace(/[^0-9]/g, '');
    if (!leaderMobile || leaderMobile.length < 10) {
        errors.leaderMobile = "Valid 10-digit mobile number required";
    }

    // 4. Team Members check (must equal teamSize)
    const members = formData.members || [];
    if (members.length !== teamSize) {
        errors.members = `Please fill details for all ${teamSize} team members`;
    } else {
        members.forEach((m, idx) => {
            const mName = sanitizeInput(m.name || '');
            const mEmail = sanitizeInput(m.email || '').toLowerCase();
            const mMobile = (m.mobile || '').replace(/[^0-9]/g, '');

            if (!mName) errors[`member_${idx}_name`] = `Member ${idx + 1} name required`;
            if (!mEmail || !emailRegex.test(mEmail)) errors[`member_${idx}_email`] = `Member ${idx + 1} valid email required`;
            if (!mMobile || mMobile.length < 10) errors[`member_${idx}_mobile`] = `Member ${idx + 1} valid 10-digit mobile required`;
        });
    }

    // 5. Declaration check
    if (!formData.declarationInfo || !formData.declarationRules || !formData.declarationInstitution) {
        errors.declaration = "You must agree to all declaration terms before registering";
    }

    // 6. Duplicate Detection (Cross-check all emails & mobile numbers in database)
    const duplicateError = checkDatabaseDuplicates(formData, existingTeams);
    if (duplicateError) {
        errors.duplicate = duplicateError;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: {
            ...formData,
            teamName,
            institutionName,
            leaderName,
            leaderEmail,
            leaderMobile
        }
    };
}

// Duplicate Detection Logic across all existing teams
export function checkDatabaseDuplicates(formData, existingTeams = []) {
    const allFormEmails = new Set();
    const allFormMobiles = new Set();

    // Collect all emails and mobiles from form
    if (formData.leaderEmail) allFormEmails.add(formData.leaderEmail.toLowerCase().trim());
    if (formData.leaderMobile) allFormMobiles.add(formData.leaderMobile.replace(/[^0-9]/g, ''));

    if (formData.members) {
        formData.members.forEach(m => {
            if (m.email) allFormEmails.add(m.email.toLowerCase().trim());
            if (m.mobile) allFormMobiles.add(m.mobile.replace(/[^0-9]/g, ''));
        });
    }

    if (formData.mentor && formData.mentor.email) {
        allFormEmails.add(formData.mentor.email.toLowerCase().trim());
        if (formData.mentor.mobile) allFormMobiles.add(formData.mentor.mobile.replace(/[^0-9]/g, ''));
    }

    // Internal duplicate check inside the form submission itself
    const totalEntriesCount = 1 + (formData.members?.length || 0) + (formData.mentor?.email ? 1 : 0);
    if (allFormEmails.size < totalEntriesCount || allFormMobiles.size < totalEntriesCount) {
        return "Participant already registered with another team. (Duplicate email or mobile found in your team list)";
    }

    // Database check against existing teams
    for (const team of existingTeams) {
        if (formData.id && team.id === formData.id) continue;

        // Check leader & members in existing team
        const existingPeople = [...(team.members || [])];
        if (team.mentor) existingPeople.push(team.mentor);

        for (const person of existingPeople) {
            const personEmail = (person.email || '').toLowerCase().trim();
            const personMobile = (person.phone || person.mobile || '').replace(/[^0-9]/g, '');

            if (personEmail && allFormEmails.has(personEmail)) {
                return `Participant already registered with another team. Email '${personEmail}' is registered under Team '${team.teamName}' (${team.id}).`;
            }

            if (personMobile && personMobile.length >= 10 && allFormMobiles.has(personMobile)) {
                return `Participant already registered with another team. Mobile '${personMobile}' is registered under Team '${team.teamName}' (${team.id}).`;
            }
        }
    }

    return null;
}

// Token Bucket Rate Limiter
export class RateLimiter {
    constructor(maxRequests = 5, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    checkRateLimit(ip = '127.0.0.1') {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.windowMs);

        if (this.requests.length >= this.maxRequests) {
            const retryAfterSec = Math.ceil((this.requests[0] + this.windowMs - now) / 1000);
            return {
                allowed: false,
                statusCode: 429,
                message: `Rate limit exceeded. Too many requests from ${ip}.`,
                retryAfterSec
            };
        }

        this.requests.push(now);
        return { allowed: true, statusCode: 200 };
    }
}
