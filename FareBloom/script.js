const fareForm = document.getElementById("fareForm");

const dateInput = document.getElementById("date");
const transportInput = document.getElementById("transport");
const routeInput = document.getElementById("route");
const fareInput = document.getElementById("fare");
const ridesInput = document.getElementById("rides");

const calculatedFare = document.getElementById("calculatedFare");

let records = JSON.parse(localStorage.getItem("fareRecords")) || [];

// Set today's date
dateInput.value = new Date().toLocaleDateString("en-CA");

// Calculate fare automatically
function calculateFare() {
    const fare = Number(fareInput.value);
    const rides = Number(ridesInput.value);

    const total = fare * rides;

    calculatedFare.textContent =
        "₱" + (Number.isFinite(total) ? total.toFixed(2) : "0.00");
}

fareInput.addEventListener("input", calculateFare);
ridesInput.addEventListener("input", calculateFare);

// Add commute record
fareForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const fare = Number(fareInput.value);
    const rides = Number(ridesInput.value);

    if (!Number.isFinite(fare) || fare <= 0 ||
        !Number.isInteger(rides) || rides < 1) {
        alert("Please enter a valid fare and number of rides.");
        return;
    }

    const record = {
        id: Date.now(),
        date: dateInput.value,
        transport: transportInput.value,
        route: routeInput.value.trim(),
        fare: fare,
        rides: rides,
        total: fare * rides
    };

    records.push(record);

    saveRecords();
    displayRecords();

    fareForm.reset();
    dateInput.value = new Date().toLocaleDateString("en-CA");
    calculatedFare.textContent = "₱0.00";
});

// Save records in browser
function saveRecords() {
    localStorage.setItem("fareRecords", JSON.stringify(records));
}

// Display commute history
function displayRecords() {
    const history = document.getElementById("fareHistory");

    const today = new Date().toLocaleDateString("en-CA");

    const todayRecords = records.filter(
        record => record.date === today
    );

    const dailyTotal = todayRecords.reduce(
        (sum, record) => sum + record.total, 0
    );

    const totalRides = todayRecords.reduce(
        (sum, record) => sum + record.rides, 0
    );

    const allExpenses = records.reduce(
        (sum, record) => sum + record.total, 0
    );

// Calculate weekly expenses (Monday to Sunday)
const now = new Date();

const startOfWeek = new Date(now);
const day = (now.getDay() + 6) % 7;
startOfWeek.setDate(now.getDate() - day);
startOfWeek.setHours(0, 0, 0, 0);

const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 7);

const weeklyTotal = records
    .filter(record => {
        const [year, month, date] = record.date.split("-").map(Number);
        const recordDate = new Date(year, month - 1, date);

        return recordDate >= startOfWeek &&
               recordDate < endOfWeek;
    })
    .reduce((sum, record) => sum + record.total, 0);

// Calculate monthly expenses
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const monthlyTotal = records
    .filter(record => {
        const [year, month] = record.date.split("-").map(Number);

        return month - 1 === currentMonth &&
               year === currentYear;
    })
    .reduce((sum, record) => sum + record.total, 0);

// Display weekly and monthly expenses
document.getElementById("weeklyExpenses").textContent =
    "₱" + weeklyTotal.toFixed(2);

document.getElementById("monthlyExpenses").textContent =
    "₱" + monthlyTotal.toFixed(2);

    document.getElementById("dailyTotal").textContent =
        "₱" + dailyTotal.toFixed(2);

    document.getElementById("totalRides").textContent =
        totalRides;

    document.getElementById("totalExpenses").textContent =
        "₱" + allExpenses.toFixed(2);

    if (records.length === 0) {
        history.innerHTML =
            '<p class="empty">No commute records yet.</p>';
        return;
    }

    history.innerHTML = "";

    records.slice().reverse().forEach(record => {
        const item = document.createElement("div");
        item.className = "history-item";

        const title = document.createElement("h3");
        title.textContent = "🚍 " + record.transport;

        const date = document.createElement("p");
        date.textContent = "Date: " + record.date;

        const route = document.createElement("p");
        route.textContent = "Route: " + record.route;

        const rides = document.createElement("p");
        rides.textContent = "Number of rides: " + record.rides;

        const amount = document.createElement("p");
        amount.textContent = "Total Fare: ₱" +
            record.total.toFixed(2);

// Edit commute record
const editButton = document.createElement("button");
editButton.textContent = "Edit Record";

editButton.addEventListener("click", function() {

    const newDate = prompt("Enter new date:", record.date);
    if (newDate === null) return;

    const newTransport = prompt("Enter transportation:", record.transport);
    if (newTransport === null) return;

    const newRoute = prompt("Enter route:", record.route);
    if (newRoute === null) return;

    const newFareInput = prompt("Enter fare per ride:", record.fare);
    if (newFareInput === null) return;

    const newRidesInput = prompt("Enter number of rides:", record.rides);
    if (newRidesInput === null) return;

    const newFare = Number(newFareInput);
    const newRides = Number(newRidesInput);

    if (!newDate.trim() || !newTransport.trim() ||
        !newRoute.trim() || !Number.isFinite(newFare) ||
        newFare <= 0 || !Number.isInteger(newRides) ||
        newRides < 1) {

        alert("Please enter valid information.");
        return;
    }

    record.date = newDate;
    record.transport = newTransport.trim();
    record.route = newRoute.trim();
    record.fare = newFare;
    record.rides = newRides;
    record.total = newFare * newRides;

    saveRecords();
    displayRecords();

    alert("Commute record updated successfully!");
});

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Record";

        deleteButton.addEventListener("click", function() {
            records = records.filter(
                r => r.id !== record.id
            );

            saveRecords();
            displayRecords();
        });

        item.append(title, date, route, rides, amount, editButton, deleteButton);
        history.appendChild(item);
    });
}

// Show saved records when opening the app
displayRecords();
// Export commute history as CSV
document.getElementById("exportButton")
    .addEventListener("click", function() {

    if (records.length === 0) {
        alert("No commute records to export.");
        return;
    }

    const headers = [
        "Date",
        "Transportation",
        "Route",
        "Fare per Ride",
        "Number of Rides",
        "Total Fare"
    ];

    const rows = records.map(record => [
        record.date,
        record.transport,
        record.route,
        record.fare,
        record.rides,
        record.total.toFixed(2)
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(","))
        .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "FareBloom_Commute_History.csv";
    link.click();

    URL.revokeObjectURL(url);

    alert("Commute history exported successfully!");
});
// Register FareBloom Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("FareBloom is ready to work offline!");
            })
            .catch(error => {
                console.error("Service Worker registration failed:", error);
            });
    });
}
