// --Universal Scripts--

// Close Buttons for Dialogs
const closeButtons = document.querySelectorAll("dialog button[type='button']");

closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        button.closest("dialog").close();
    })
})

// Location Type Script
const locationTypeSelect = document.getElementById("location-type");
const locationContainer = document.getElementById("location-container");
const locationInput = document.getElementById("location");

locationTypeSelect.addEventListener("change", () => {
    if (locationTypeSelect.value === "offline") {
        locationContainer.style.display = "block";
    } else {
        locationContainer.style.display = "none";
        locationInput.value = "";
    }
})



// Add Subject Script
const subjectDialog = document.getElementById("subject-dialog");
const addSubjectBtn = document.getElementById("add-subject");
const subjectForm = subjectDialog.querySelector("form");

addSubjectBtn.addEventListener("click", () => {
    subjectDialog.showModal();
});

subjectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(subjectForm);
    const subject = {
        id: formData.get("id"),
        name: formData.get("name"),
        duration: formData.get("duration"),
        location: formData.get("location"),
    };
    console.log(subject);

    // Add Subject card to subject list
    const card = document.createElement("div");
    card.classList.add("subject-card");
    card.innerHTML = `
        <h4>${subject.id}</h4>
        <p>${subject.name}</p>
        <small>${subject.duration} hours | ${subject.location || 'Online'}</small>
    `;
    document.getElementById("subject-list").appendChild(card);

    subjectDialog.close();
});

subjectDialog.addEventListener("close", () => {
    subjectForm.reset();
    locationContainer.style.display = "none";
})

// Timetable Grid script
const dayPresets = {
    monday: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    sunday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
}

const timeSlots = [
    "08:00 - 08:50", "09:00 - 09:50", "10:00 - 10:50", "11:00 - 11:50", "12:00 - 12:50",
    "13:00 - 13:50", "14:00 - 14:50", "15:00 - 15:50", "16:00 - 16:50", "17:00 - 17:50",
    "18:00 - 18:50"
];

function renderTimetable() {
    const grid = document.getElementById("timetable-grid");
    grid.innerHTML = "";

    const mode = document.getElementById("timetable-mode").value;
    const currentDays = dayPresets[mode];

    grid.style.gridTemplateColumns = `70px repeat(${currentDays.length}, 1fr)`;

    const corner = document.createElement("div");
    corner.classList.add("grid-header");
    corner.textContent = "Time";
    grid.appendChild(corner);

    currentDays.forEach(day => {
        const header = document.createElement("div");
        header.classList.add("grid-header");
        header.textContent = day;
        grid.appendChild(header);
    })

    timeSlots.forEach(time => {
        const timeCell = document.createElement("div");
        timeCell.classList.add("time-cell");
        timeCell.textContent = time;
        grid.appendChild(timeCell);

        currentDays.forEach(day => {
            const slot = document.createElement("div");
            slot.classList.add("slot");

            slot.dataset.day = day;
            slot.dataset.time = time;

            grid.appendChild(slot);
        })
    })
}

const timetableModeSelect = document.getElementById("timetable-mode");

timetableModeSelect.addEventListener("change", () => {
    renderTimetable();
});
// Initial rendering
renderTimetable();