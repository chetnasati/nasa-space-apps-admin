// Export Utilities for NASA Space Apps 2026 Admin Portal

export function exportToCSV(teamsList, filename = "NASA_Space_Apps_2026_Teams.csv") {
    if (!teamsList || !teamsList.length) {
        alert("No teams available to export!");
        return;
    }

    const headers = [
        "Registration ID",
        "Team Name",
        "Category",
        "Institution",
        "Leader Name",
        "Leader Email",
        "Phone Number",
        "Members Count",
        "Challenge Track",
        "Registration Date",
        "Status",
        "Duplicate Flagged"
    ];

    const rows = teamsList.map(team => [
        `"${team.id}"`,
        `"${team.teamName.replace(/"/g, '""')}"`,
        `"${team.category}"`,
        `"${team.institution.replace(/"/g, '""')}"`,
        `"${team.leaderName.replace(/"/g, '""')}"`,
        `"${team.leaderEmail}"`,
        `"${team.phone}"`,
        team.membersCount || 1,
        `"${team.challenge.replace(/"/g, '""')}"`,
        `"${team.registrationDate}"`,
        `"${team.status}"`,
        team.isDuplicate ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToExcelHTML(teamsList, filename = "NASA_Space_Apps_2026_Teams.xls") {
    if (!teamsList || !teamsList.length) {
        alert("No teams available to export!");
        return;
    }

    let tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Teams Summary</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                th { background-color: #0b3d91; color: white; font-weight: bold; }
                td, th { border: 1px solid #cccccc; padding: 6px; }
            </style>
        </head>
        <body>
            <h2>BIAS NASA Space Hackathon 2026 - Master Registration Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Registration ID</th>
                        <th>Team Name</th>
                        <th>Category</th>
                        <th>Institution</th>
                        <th>Leader Name</th>
                        <th>Leader Email</th>
                        <th>Phone</th>
                        <th>Challenge Track</th>
                        <th>Reg Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;

    teamsList.forEach(team => {
        tableHtml += `
            <tr>
                <td>${team.id}</td>
                <td><b>${team.teamName}</b></td>
                <td>${team.category}</td>
                <td>${team.institution}</td>
                <td>${team.leaderName}</td>
                <td>${team.leaderEmail}</td>
                <td>${team.phone}</td>
                <td>${team.challenge}</td>
                <td>${team.registrationDate}</td>
                <td>${team.status}</td>
            </tr>
        `;
    });

    tableHtml += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
