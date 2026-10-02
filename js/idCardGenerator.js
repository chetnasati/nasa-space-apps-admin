// NASA Space Apps 2026 - ID Badge & PDF Canvas Generator

export function generateMemberIDBadgeCanvas(canvas, teamData, memberIndex = 0, isMentor = false) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 600;
    const height = 900;

    canvas.width = width;
    canvas.height = height;

    let person = { name: teamData.leaderName, role: "Team Leader", email: teamData.leaderEmail };
    if (isMentor && teamData.mentor) {
        person = { name: teamData.mentor.name, role: "Faculty Mentor", email: teamData.mentor.email };
    } else if (teamData.members && teamData.members[memberIndex]) {
        person = teamData.members[memberIndex];
    }

    // 1. Cosmic Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#050811');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Glowing Accents & Starfield
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(450, 150, 250, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(138, 43, 226, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 750, 300, 0, Math.PI * 2);
    ctx.fill();

    // HUD Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let j = 0; j < height; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke();
    }

    // Outer Card Frame
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Corner Sci-fi Accents
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(20, 60); ctx.lineTo(20, 20); ctx.lineTo(60, 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width - 60, 20); ctx.lineTo(width - 20, 20); ctx.lineTo(width - 20, 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, height - 60); ctx.lineTo(20, height - 20); ctx.lineTo(60, height - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width - 60, height - 20); ctx.lineTo(width - 20, height - 20); ctx.lineTo(width - 20, height - 60); ctx.stroke();

    // Header Bar
    ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.fillRect(25, 25, width - 50, 110);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.strokeRect(25, 25, width - 50, 110);

    // NASA Vector Emblem
    ctx.fillStyle = '#0b3d91';
    ctx.beginPath(); ctx.arc(75, 80, 35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fc3d21';
    ctx.beginPath(); ctx.moveTo(40, 80); ctx.lineTo(110, 65); ctx.lineTo(95, 95); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Orbitron", sans-serif';
    ctx.fillText('NASA', 52, 87);

    // Header Text
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 22px "Orbitron", sans-serif';
    ctx.fillText('NASA SPACE APPS 2026', 130, 65);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px sans-serif';
    ctx.fillText('BIRLA INSTITUTE OF APPLIED SCIENCES, BHIMTAL', 130, 88);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('OFFICIAL HACKATHON PARTICIPANT PASS', 130, 108);

    // Holographic Verified Pass Seal
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(width - 70, 80, 25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', width - 70, 78);
    ctx.fillText('2026 PASS', width - 70, 90);
    ctx.textAlign = 'left';

    // Avatar Box
    const avatarX = width / 2 - 80;
    const avatarY = 165;
    const avatarSize = 160;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.strokeStyle = teamData.category === 'College' ? '#00f0ff' : '#a855f7';
    ctx.lineWidth = 3;
    ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);

    // Avatar Icon & Initials
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.beginPath(); ctx.arc(width / 2, avatarY + 65, 38, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(width / 2, avatarY + 160, 65, Math.PI, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    const initials = person.name.split(' ').map(n => n[0]).join('');
    ctx.fillText(initials, width / 2, avatarY + 95);

    // Member Info Text
    const infoStartY = 360;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(person.name.toUpperCase(), width / 2, infoStartY);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 16px "Orbitron", monospace';
    ctx.fillText(`[ ${(person.role || 'MEMBER').toUpperCase()} ]`, width / 2, infoStartY + 30);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px sans-serif';
    ctx.fillText(`TEAM: ${teamData.teamName.toUpperCase()}`, width / 2, infoStartY + 65);

    // Category Pill
    const pillWidth = 160;
    const pillHeight = 32;
    const pillX = width / 2 - pillWidth / 2;
    const pillY = infoStartY + 85;

    ctx.fillStyle = teamData.category === 'College' ? 'rgba(0, 114, 255, 0.25)' : 'rgba(168, 85, 247, 0.25)';
    ctx.strokeStyle = teamData.category === 'College' ? '#0072ff' : '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 16); ctx.fill(); ctx.stroke();

    ctx.fillStyle = teamData.category === 'College' ? '#38bdf8' : '#c084fc';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`${teamData.category.toUpperCase()} DIVISION`, width / 2, pillY + 21);

    // Institution Name
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(teamData.institutionName || teamData.institution, width / 2, pillY + 55);

    // Event Dates & Venue Box
    const trackY = pillY + 75;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(40, trackY, width - 80, 60);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(40, trackY, width - 80, 60);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('EVENT DATES & VENUE', width / 2, trackY + 22);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('14–15 Nov 2026 | BIAS Bhimtal', width / 2, trackY + 45);

    // Registration ID & QR Verification Box
    const footerY = trackY + 80;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText('REGISTRATION ID:', 50, footerY + 20);
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(teamData.id, 50, footerY + 44);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText('SECURITY STATUS:', 50, footerY + 72);
    ctx.fillStyle = '#10b981';
    ctx.font = '12px monospace';
    ctx.fillText('AUTHENTICATED PASS', 50, footerY + 90);

    // QR Code Box
    const qrSize = 90;
    const qrX = width - 150;
    const qrY = footerY + 10;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = '#000000';

    ctx.fillRect(qrX + 6, qrY + 6, 24, 24);
    ctx.clearRect(qrX + 10, qrY + 10, 16, 16);
    ctx.fillRect(qrX + 14, qrY + 14, 8, 8);

    ctx.fillRect(qrX + qrSize - 30, qrY + 6, 24, 24);
    ctx.clearRect(qrX + qrSize - 26, qrY + 10, 16, 16);
    ctx.fillRect(qrX + qrSize - 22, qrY + 14, 8, 8);

    ctx.fillRect(qrX + 6, qrY + qrSize - 30, 24, 24);
    ctx.clearRect(qrX + 10, qrY + qrSize - 26, 16, 16);
    ctx.fillRect(qrX + 14, qrY + qrSize - 22, 8, 8);

    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            if ((r + c) % 2 === 0) ctx.fillRect(qrX + 35 + c * 7, qrY + 35 + r * 7, 5, 5);
        }
    }

    // Barcode Line Footer
    const barcodeY = height - 70;
    ctx.fillStyle = '#ffffff';
    for (let b = 50; b < width - 50; b += 6) {
        const barWidth = ((b * 7) % 5 === 0) ? 4 : 2;
        ctx.fillRect(b, barcodeY, barWidth, 30);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`VERIFY AT: /verify?id=${teamData.id}`, width / 2, height - 25);

    return canvas.toDataURL('image/png');
}

export function downloadIDCard(canvas, filename = "NASA_Space_Apps_ID_Badge.png") {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
