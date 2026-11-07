// --Universal Scripts--
let draggedElement = null;
let activeDragDuration = 1;
let editingCard = null;

// Close Buttons for Dialogs
const closeButtons = document.querySelectorAll("dialog button[type='button']");

closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        button.closest("dialog").close();
    });
});

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
});

// Add Subject Script
const subjectDialog = document.getElementById("subject-dialog");
const addSubjectBtn = document.getElementById("add-subject");
const subjectForm = subjectDialog.querySelector("form");

const dialogTitle = subjectDialog.querySelector("h3");
const submitBtn = subjectForm.querySelector("button[type='submit']");

function openEditDialog(card, data) {
    editingCard = card;
    dialogTitle.textContent = "Edit Subject";
    submitBtn.textContent = "Update Subject";

    document.getElementById("id").value = data.id;
    document.getElementById("name").value = data.name;
    document.getElementById("duration").value = data.duration;

    if (data.location) {
        locationTypeSelect.value = "offline";
        locationContainer.style.display = "block";
        locationInput.value = data.location;
    } else {
        locationTypeSelect.value = "online";
        locationContainer.style.display = "none";
        locationInput.value = "";
    }

    subjectDialog.showModal();
}

addSubjectBtn.addEventListener("click", () => {
    editingCard = null;
    dialogTitle.textContent = "Add new subject";
    submitBtn.textContent = "Add subject";
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

    if (editingCard) {
        editingCard.subjectData = subject;

        editingCard.querySelector("h4").textContent = subject.id;
        editingCard.querySelector("p").textContent = subject.name;
        editingCard.querySelector("small").textContent =
            `${subject.duration} hours | ${subject.location || "Online"}`;

        if (editingCard.classList.contains("placed-subject")) {
            const duration = parseInt(subject.duration) || 1;
            editingCard.dataset.duration = duration;
            editingCard.style.height = `calc(${duration * 100}% + ${(duration - 1)}px)`;
        }
    } else {
        // Add Subject card to subject list
        const card = document.createElement("div");

        card.classList.add("subject-card");
        card.setAttribute("draggable", "true");
        card.subjectData = subject;

        card.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", JSON.stringify(card.subjectData));
            activeDragDuration = parseInt(card.subjectData.duration) || 1;
            document.body.classList.add("dragging-active");
        });

        card.addEventListener("dragend", () => {
            draggedElement = null;
            activeDragDuration = 1;
            document.body.classList.remove("dragging-active");
        });

        card.innerHTML = `
            <div class="card-header">
                <h4>${subject.id}</h4>
                <div class="card-actions">
                    <button type="button" class="btn-edit" title="Edit">✏️</button>
                    <button type="button" class="btn-delete" title="Delete">✕</button>
                </div>
            </div>
            <p>${subject.name}</p>
            <small>${subject.duration} hours | ${subject.location || "Online"}</small>
        `;

        const deleteBtn = card.querySelector(".btn-delete");
        deleteBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            card.remove();
        });

        const editBtn = card.querySelector(".btn-edit");
        editBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            openEditDialog(card, card.subjectData);
        });

        document.getElementById("subject-list").appendChild(card);
    }

    subjectDialog.close();
});

subjectDialog.addEventListener("close", () => {
    subjectForm.reset();
    locationContainer.style.display = "none";

    editingCard = null;
    dialogTitle.textContent = "Add new subject";
    submitBtn.textContent = "Add subject";
});

// Timetable Grid script
const dayPresets = {
    monday: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    sunday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
};

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

    grid.style.gridTemplateColumns = `70px repeat(${currentDays.length}, minmax(0, 1fr))`;

    const corner = document.createElement("div");

    corner.classList.add("grid-header");
    corner.textContent = "Time";
    grid.appendChild(corner);

    currentDays.forEach(day => {
        const header = document.createElement("div");

        header.classList.add("grid-header");
        header.textContent = day;
        grid.appendChild(header);
    });

    timeSlots.forEach(time => {
        const timeCell = document.createElement("div");

        timeCell.classList.add("time-cell");
        timeCell.textContent = time;
        grid.appendChild(timeCell);

        currentDays.forEach(day => {
            const slot = document.createElement("div");

            slot.addEventListener("dragover", (event) => {
                event.preventDefault();
                slot.style.setProperty("--hover-duration", activeDragDuration);
                slot.classList.add("drag-over");

                const startIndex = timeSlots.indexOf(slot.dataset.time);
                const endIndex = startIndex + activeDragDuration;

                let isInvalid = endIndex > timeSlots.length;

                if (!isInvalid) {
                    const existingSubjects = document.querySelectorAll(".placed-subject");
                    for (const other of existingSubjects) {
                        if (other === draggedElement) continue;
                        if (other.dataset.day !== slot.dataset.day) continue;
                        const otherStart = timeSlots.indexOf(other.dataset.time);
                        const otherDuration = parseInt(other.dataset.duration) || 1;
                        const otherEnd = otherStart + otherDuration;
                        if (Math.max(startIndex, otherStart) < Math.min(endIndex, otherEnd)) {
                            isInvalid = true;
                            break;
                        }
                    }
                }

                if (isInvalid) {
                    slot.classList.add("conflict");
                    event.dataTransfer.dropEffect = "none";
                } else {
                    slot.classList.remove("conflict");
                    event.dataTransfer.dropEffect = "move";
                }
            });

            slot.addEventListener("dragleave", () => {
                slot.classList.remove("drag-over");
                slot.classList.remove("conflict");
                slot.style.removeProperty("--hover-duration");
            });

            slot.addEventListener("drop", (event) => {
                event.preventDefault();
                slot.classList.remove("drag-over");
                slot.classList.remove("conflict");

                if (draggedElement && draggedElement.parentElement === slot) {
                    return;
                }

                const subjectData = JSON.parse(event.dataTransfer.getData("text/plain"));
                const duration = parseInt(subjectData.duration);
                const targetDay = slot.dataset.day;
                const newStart = timeSlots.indexOf(slot.dataset.time);
                const newEnd = newStart + duration;

                if (newEnd > timeSlots.length) {
                    return;
                }

                const existingSubjects = document.querySelectorAll(".placed-subject");

                for (const other of existingSubjects) {
                    if (other === draggedElement) continue;
                    if (other.dataset.day !== targetDay) continue;
                    const otherStart = timeSlots.indexOf(other.dataset.time);
                    const otherDuration = parseInt(other.dataset.duration) || 1;
                    const otherEnd = otherStart + otherDuration;

                    if (Math.max(newStart, otherStart) < Math.min(newEnd, otherEnd)) {
                        return;
                    }
                }

                if (draggedElement && draggedElement.classList.contains("placed-subject")) {
                    draggedElement.remove();
                }

                const placedSubject = document.createElement("div");

                placedSubject.setAttribute("draggable", "true");
                placedSubject.classList.add("placed-subject");

                placedSubject.dataset.day = slot.dataset.day;
                placedSubject.dataset.time = slot.dataset.time;
                placedSubject.dataset.duration = duration;
                placedSubject.subjectData = subjectData;

                placedSubject.innerHTML = `
                    <div class="card-header">
                        <h4>${subjectData.id}</h4>
                        <div class="card-actions">
                            <button type="button" class="btn-edit" title="Edit">✏️</button>
                            <button type="button" class="btn-delete" title="Delete">✕</button>
                        </div>
                    </div>
                    <p>${subjectData.name}</p>
                    <small>${subjectData.duration} hours | ${subjectData.location || "Online"}</small>
                `;

                const deleteBtn = placedSubject.querySelector(".btn-delete");
                deleteBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    placedSubject.remove();
                });

                const editBtn = placedSubject.querySelector(".btn-edit");
                editBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    openEditDialog(placedSubject, placedSubject.subjectData);
                });

                placedSubject.style.height = `calc(${duration * 100}% + ${(duration - 1)}px)`;

                placedSubject.addEventListener("dragstart", (event) => {
                    draggedElement = placedSubject;
                    activeDragDuration = parseInt(placedSubject.subjectData.duration) || 1;
                    event.dataTransfer.setData("text/plain", JSON.stringify(placedSubject.subjectData));
                    document.body.classList.add("dragging-active");

                    setTimeout(() => {
                        placedSubject.classList.add("is-dragging");
                    }, 0);
                });

                placedSubject.addEventListener("dragend", () => {
                    draggedElement = null;
                    activeDragDuration = 1;
                    placedSubject.classList.remove("is-dragging");
                    document.body.classList.remove("dragging-active");
                });

                slot.appendChild(placedSubject);
            });
            slot.classList.add("slot");

            slot.dataset.day = day;
            slot.dataset.time = time;

            grid.appendChild(slot);
        });
    });
}

const timetableModeSelect = document.getElementById("timetable-mode");

timetableModeSelect.addEventListener("change", () => {
    renderTimetable();
});
// Initial rendering
renderTimetable();
