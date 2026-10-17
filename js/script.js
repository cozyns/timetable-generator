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