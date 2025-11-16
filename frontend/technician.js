const scheduleJobs = [
  {
    id: 1,
    time: "9:00 AM",
    title: "Plumbing Repair",
    status: ["confirmed", "high"],
    customer: "Sarah Johnson",
    address: "123 Main St, Downtown",
    phone: "(555) 123-4567",
    serviceType: "Plumbing Repair",
    description: "Kitchen sink leak repair",
    duration: "2 hours",
    notes: "Customer has pets. Use side gate."
  },
  {
    id: 2,
    time: "1:00 PM",
    title: "Electrical Install",
    status: ["confirmed", "medium"],
    customer: "Marcus Bell",
    address: "482 Pine Ave, Midtown",
    phone: "(555) 765-4321",
    serviceType: "Ceiling Fan Install",
    description: "Install and wire two ceiling fans",
    duration: "2.5 hours",
    notes: "Bring extra ladder."
  },
  {
    id: 3,
    time: "4:30 PM",
    title: "HVAC Tune-Up",
    status: ["confirmed", "medium"],
    customer: "Olivia Chen",
    address: "77 Oak Lane, Northside",
    phone: "(555) 222-8899",
    serviceType: "Seasonal Maintenance",
    description: "Inspect furnace + change filters",
    duration: "1.5 hours",
    notes: "Access panel behind garage."
  }
];

const historyJobs = [
  {
    id: 31,
    time: "Yesterday",
    title: "Water Heater Install",
    status: ["completed"],
    customer: "Luis Ramirez",
    address: "91 Lakeview Dr",
    phone: "(555) 890-1222",
    serviceType: "Water Heater",
    description: "Installed tankless system",
    duration: "3 hours",
    notes: "Follow-up inspection next week."
  },
  {
    id: 32,
    time: "2 days ago",
    title: "Emergency Leak",
    status: ["completed", "high"],
    customer: "Karen Patel",
    address: "621 Grove St",
    phone: "(555) 340-9876",
    serviceType: "Pipe Repair",
    description: "Stopped basement leak",
    duration: "1 hour",
    notes: "Recommended full pipe replacement."
  }
];

const tabs = document.querySelectorAll(".tab-bar .tab");
const scheduleList = document.getElementById("scheduleList");
const jobDetails = document.getElementById("jobDetails");
const detailsTime = jobDetails.querySelector(".details-time");
const detailsList = jobDetails.querySelector("dl");

let activeTab = "schedule";
let selectedJob = scheduleJobs[0];

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    if (!target) return;
    if (target === "profile") {
      alert("Profile & Tools coming soon.");
      return;
    }
    activeTab = target;
    tabs.forEach((t) => t.classList.toggle("active", t === tab));
    renderList();
  });
});

function renderList() {
  const data = activeTab === "schedule" ? scheduleJobs : historyJobs;
  if (!data.length) {
    scheduleList.innerHTML = `<div class="empty-state">No jobs to show.</div>`;
    renderDetails(null);
    return;
  }

  if (!data.includes(selectedJob)) {
    selectedJob = data[0];
  }

  scheduleList.innerHTML = data
    .map(
      (job) => `
      <article class="job-card ${job.id === selectedJob.id ? "active" : ""}" data-id="${job.id}">
        <div class="job-time">${job.time}</div>
        <h4>${job.title}</h4>
        <div class="job-meta">
          <span>👤 ${job.customer}</span>
          <span>📍 ${job.address}</span>
          <span>📞 ${job.phone}</span>
        </div>
        <div class="tag-row">
          ${job.status
            .map((tag) => `<span class="tag ${tag}">${tag}</span>`)
            .join("")}
        </div>
      </article>
    `
    )
    .join("");

  scheduleList.querySelectorAll(".job-card").forEach((card) => {
    card.addEventListener("click", () => {
      const job = data.find((j) => j.id === Number(card.dataset.id));
      if (!job) return;
      selectedJob = job;
      renderList();
      renderDetails(job);
    });
  });

  renderDetails(selectedJob);
}

function renderDetails(job) {
  if (!job) {
    detailsTime.textContent = "";
    detailsList.innerHTML = "";
    return;
  }

  detailsTime.textContent = `${job.customer} • ${job.time}`;
  detailsList.innerHTML = `
    <dt>Service Type</dt>
    <dd>${job.serviceType}</dd>
    <dt>Description</dt>
    <dd>${job.description}</dd>
    <dt>Estimated Duration</dt>
    <dd>${job.duration}</dd>
    <dt>Notes</dt>
    <dd>${job.notes}</dd>
  `;
}

renderList();
