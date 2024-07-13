document.addEventListener("DOMContentLoaded", function() {
    fetch('scholarships_data.csv')
    .then(response => response.text())
    .then(data => {
        let rows = data.split('\\n').slice(1); // Skip the header row
        let scholarships = rows.map(row => {
            let cols = row.split(',');
            return {
                title: cols[0],
                dueDate: new Date(cols[1])
            };
        });

        // Filter out invalid dates
        scholarships = scholarships.filter(sch => !isNaN(sch.dueDate));

        // Calculate days till due
        const currentDate = new Date();
        scholarships.forEach(sch => {
            sch.daysTillDue = Math.ceil((sch.dueDate - currentDate) / (1000 * 60 * 60 * 24));
        });

        // Filter out past due scholarships
        scholarships = scholarships.filter(sch => sch.daysTillDue > 0);

        // Sort by days till due
        scholarships.sort((a, b) => a.daysTillDue - b.daysTillDue);

        // Create HTML table
        let table = '<table class="styled-table"><thead><tr><th>Days til due</th><th>Scholarship Title</th><th>Due Date</th></tr></thead><tbody>';
        scholarships.forEach(sch => {
            table += `<tr>
                <td>${sch.daysTillDue}</td>
                <td>${sch.title}</td>
                <td>${sch.dueDate.toLocaleDateString('en-US')}</td>
            </tr>`;
        });
        table += '</tbody></table>';

        document.getElementById('scholarships-table').innerHTML = table;
    })
    .catch(error => console.error('Error fetching the CSV file:', error));
});
