// NASA Space Apps 2026 - Sci-Fi Badge ID Card Generator & Reissuer

export function generateIDCardCanvas(canvas, teamData, participantIndex = 0) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 600;
    const height = 900;

    canvas.width = width;
    canvas.height = height;

    const member = (teamData.members && teamData.members[participantIndex]) 
        ? teamData.members[participantIndex] 
        : { name: teamData.leaderName, role: "Team Leader", email: teamData.leaderEmail };

    // 1. Background Cosmic Dark Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#050811');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Cosmic Nebular Overlay & Stars
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(450, 150, 250, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(138, 43, 226, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 750, 300, 0, Math.PI * 2);
    ctx.fill();

    // Draw grid lines (sci-fi HUD texture)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.toLine ? ctx.lineTo(i, height) : ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let j = 0; j < height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
    }

    // 3. Card Outer Glowing Frame
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Corner Sci-fi Accents
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 5;
    // Top-left
    ctx.beginPath(); ctx.moveTo(20, 60); ctx.lineTo(20, 20); ctx.lineTo(60, 20); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(width - 60, 20); ctx.lineTo(width - 20, 20); ctx.lineTo(width - 20, 60); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(20, height - 60); ctx.lineTo(20, height - 20); ctx.lineTo(60, height - 20); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(width - 60, height - 20); ctx.lineTo(width - 20, height - 20); ctx.lineTo(width - 20, height - 60); ctx.stroke();

    // 4. Top Header Banner
    ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.fillRect(25, 25, width - 50, 110);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.strokeRect(25, 25, width - 50, 110);

    // NASA Blue Vector Emblem
    ctx.fillStyle = '#0b3d91';
    ctx.beginPath();
    ctx.arc(75, 80, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fc3d21';
    ctx.beginPath();
    ctx.moveTo(40, 80); ctx.lineTo(110, 65); ctx.lineTo(95, 95); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Orbitron", sans-serif, Arial';
    ctx.fillText('NASA', 52, 87);

    // Header Text
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 22px "Orbitron", sans-serif, Arial';
    ctx.fillText('NASA SPACE APPS 2026', 130, 65);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    ctx.fillText('BIAS - BIRLA INSTITUTE OF APPLIED SCIENCES', 130, 90);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('BHIMTAL, UTTARAKHAND | OFFICIAL ACCESS PASS', 130, 110);

    // 5. Holographic Status Seal
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width - 70, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', width - 70, 78);
    ctx.fillText('PASS', width - 70, 90);
    ctx.textAlign = 'left';

    // 6. Photo Avatar Frame
    const avatarX = width / 2 - 80;
    const avatarY = 165;
    const avatarSize = 160;

    // Glowing border around avatar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.strokeStyle = teamData.category === 'College' ? '#00f0ff' : '#a855f7';
    ctx.lineWidth = 3;
    ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);

    // Draw stylized astronaut / participant silhouette graphics
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(width / 2, avatarY + 65, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width / 2, avatarY + 160, 65, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    const initials = member.name.split(' ').map(n => n[0]).join('');
    ctx.fillText(initials, width / 2, avatarY + 95);
    ctx.textAlign = 'left';

    // 7. Participant Information Section
    const infoStartY = 360;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(member.name.toUpperCase(), width / 2, infoStartY);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 16px "Orbitron", monospace';
    ctx.fillText(`[ ${member.role.toUpperCase()} ]`, width / 2, infoStartY + 30);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px sans-serif';
    ctx.fillText(`TEAM: ${teamData.teamName.toUpperCase()}`, width / 2, infoStartY + 65);

    // Category Pill (College vs School)
    const pillWidth = 140;
    const pillHeight = 32;
    const pillX = width / 2 - pillWidth / 2;
    const pillY = infoStartY + 85;

    ctx.fillStyle = teamData.category === 'College' ? 'rgba(0, 114, 255, 0.25)' : 'rgba(168, 85, 247, 0.25)';
    ctx.strokeStyle = teamData.category === 'College' ? '#0072ff' : '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = teamData.category === 'College' ? '#38bdf8' : '#c084fc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${teamData.category.toUpperCase()} DIVISION`, width / 2, pillY + 21);

    // Institution Name
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(teamData.institution, width / 2, pillY + 55);

    // Challenge Track Box
    const trackY = pillY + 75;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(40, trackY, width - 80, 60);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(40, trackY, width - 80, 60);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('MISSION CHALLENGE TRACK', width / 2, trackY + 22);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(teamData.challenge, width / 2, trackY + 45);

    // 8. Security Barcode & QR Code Simulation
    const footerY = trackY + 80;

    // Left Details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText('REGISTRATION ID:', 50, footerY + 20);
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(teamData.id, 50, footerY + 42);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText('ISSUED BY ADMIN:', 50, footerY + 70);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px monospace';
    ctx.fillText(`BIAS HQ (${teamData.issueDate || '2026-09-15'})`, 50, footerY + 88);

    // Draw QR Code Box (Simulated SVG / Matrix)
    const qrSize = 90;
    const qrX = width - 150;
    const qrY = footerY + 10;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = '#000000';

    // QR finder patterns
    ctx.fillRect(qrX + 6, qrY + 6, 24, 24);
    ctx.clearRect(qrX + 10, qrY + 10, 16, 16);
    ctx.fillRect(qrX + 14, qrY + 14, 8, 8);

    ctx.fillRect(qrX + qrSize - 30, qrY + 6, 24, 24);
    ctx.clearRect(qrX + qrSize - 26, qrY + 10, 16, 16);
    ctx.fillRect(qrX + qrSize - 22, qrY + 14, 8, 8);

    ctx.fillRect(qrX + 6, qrY + qrSize - 30, 24, 24);
    ctx.clearRect(qrX + 10, qrY + qrSize - 26, 16, 16);
    ctx.fillRect(qrX + 14, qrY + qrSize - 22, 8, 8);

    // Random matrix blocks
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            if ((r + c) % 2 === 0) {
                ctx.fillRect(qrX + 35 + c * 7, qrY + 35 + r * 7, 5, 5);
            }
        }
    }

    // 9. Bottom Barcode Lines
    const barcodeY = height - 70;
    ctx.fillStyle = '#ffffff';
    for (let b = 50; b < width - 50; b += 6) {
        const barWidth = ((b * 7) % 5 === 0) ? 4 : 2;
        ctx.fillRect(b, barcodeY, barWidth, 30);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SECURITY HASH: NASA-2026-BIAS-AUTH-${teamData.id.replace('REG-', '')}-SECURED`, width / 2, height - 25);

    return canvas.toDataURL('image/png');
}

export function downloadIDCard(canvas, filename = "NASA_Space_Apps_ID_Card.png") {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
