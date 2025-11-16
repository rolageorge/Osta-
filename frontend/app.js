const DEFAULT_BASE_URL = "http://localhost:5000";
let apiBaseUrl = localStorage.getItem("osta:baseUrl") || DEFAULT_BASE_URL;
let statusElement;

document.addEventListener("DOMContentLoaded", () => {
  const baseInput = document.getElementById("baseUrl");
  statusElement = document.getElementById("connectionStatus");
  baseInput.value = apiBaseUrl;
  setStatus("Ready to send requests.", "info");

  document.getElementById("baseUrlForm").addEventListener("submit", (event) => {
    event.preventDefault();
    apiBaseUrl = baseInput.value.trim().replace(/\/$/, "");
    localStorage.setItem("osta:baseUrl", apiBaseUrl);
    setStatus(`Base URL set to ${apiBaseUrl}`, "info");
  });

  document.getElementById("pingButton").addEventListener("click", async () => {
    try {
      const data = await apiRequest({ path: "Auth/Index" });
      renderResult("dashboardOutput", data, { title: "Auth controller response" });
    } catch (error) {
      renderError("dashboardOutput", error);
    }
  });

  setupNavigation();
  setupForms();
});

function setStatus(message, tone = "info") {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;
}

function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const panels = document.querySelectorAll(".panel");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === button.dataset.target);
      });
    });
  });
}

function setupForms() {
  wireForm("healthForm", (formData) => {
    const path = formData.get("pingRoute");
    return { method: "GET", path, successMessage: `Pinged ${path}` };
  }, "dashboardOutput");

  wireForm("serviceCountForm", () => ({
    method: "GET",
    path: "Service/Count",
    successMessage: "Fetched service count"
  }), "dashboardOutput");

  wireForm("storeCountForm", () => ({
    method: "GET",
    path: "Store/Count",
    successMessage: "Fetched store count"
  }), "dashboardOutput");

  // User forms
  wireForm("getAllUsersForm", () => ({
    method: "GET",
    path: "Auth/GetAll",
    successMessage: "Fetched all users"
  }), "usersOutput");

  wireForm("getUsersByRoleForm", (formData) => {
    const role = formData.get("roleName");
    return {
      method: "GET",
      path: `Auth/GetAllUsersByRoleNameAsync/${encodeURIComponent(role)}`,
      successMessage: `Fetched users with role ${role}`
    };
  }, "usersOutput");

  wireForm("getUserByEmailForm", (formData) => {
    const email = formData.get("userEmail");
    return {
      method: "GET",
      path: `Auth/GetByEmail/${encodeURIComponent(email)}`,
      successMessage: `Fetched user ${email}`
    };
  }, "usersOutput");

  wireForm("signUpForm", (formData) => {
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      roleName: formData.get("roleName"),
      isActive: formData.get("isActive") === "on"
    };
    return {
      method: "POST",
      path: "Auth/SignUp",
      body: payload,
      successMessage: "User created"
    };
  }, "usersOutput");

  wireForm("updateUserForm", (formData) => {
    const targetEmail = formData.get("targetEmail");
    const payload = {
      currentEmail: formData.get("currentEmail"),
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address")
    };
    return {
      method: "PUT",
      path: `Auth/Edit/${encodeURIComponent(targetEmail)}`,
      body: payload,
      successMessage: `Updated ${targetEmail}`
    };
  }, "usersOutput");

  wireForm("deleteUserForm", (formData) => {
    const email = formData.get("email");
    return {
      method: "DELETE",
      path: `Auth/Delete/${encodeURIComponent(email)}`,
      successMessage: `Deleted ${email}`
    };
  }, "usersOutput");

  // Role forms
  wireForm("getAllRolesForm", () => ({
    method: "GET",
    path: "Role/GetAll",
    successMessage: "Fetched roles"
  }), "rolesOutput");

  wireForm("createRoleForm", (formData) => ({
    method: "POST",
    path: "Role/Add",
    body: { roleName: formData.get("roleName") },
    successMessage: "Role created"
  }), "rolesOutput");

  wireForm("updateRoleForm", (formData) => ({
    method: "PUT",
    path: `Role/Edit/${encodeURIComponent(formData.get("currentName"))}`,
    body: { name: formData.get("newName") },
    successMessage: "Role renamed"
  }), "rolesOutput");

  wireForm("deleteRoleForm", (formData) => ({
    method: "DELETE",
    path: `Role/Delete/${encodeURIComponent(formData.get("roleName"))}`,
    successMessage: "Role deleted"
  }), "rolesOutput");

  // Category forms
  wireForm("getAllCategoriesForm", () => ({
    method: "GET",
    path: "Category/GetAll",
    successMessage: "Fetched categories"
  }), "categoriesOutput");

  wireForm("getCategoryByNameForm", (formData) => ({
    method: "GET",
    path: `Category/GetByName/${encodeURIComponent(formData.get("name"))}`,
    successMessage: "Fetched category"
  }), "categoriesOutput");

  wireForm("addCategoryForm", (formData) => ({
    method: "POST",
    path: "Category/Add",
    body: { name: formData.get("name") },
    successMessage: "Category added"
  }), "categoriesOutput");

  wireForm("updateCategoryForm", (formData) => ({
    method: "PUT",
    path: `Category/Edit/${encodeURIComponent(formData.get("oldName"))}`,
    body: { name: formData.get("newName") },
    successMessage: "Category updated"
  }), "categoriesOutput");

  wireForm("deleteCategoryForm", (formData) => ({
    method: "DELETE",
    path: `Category/Delete/${encodeURIComponent(formData.get("name"))}`,
    successMessage: "Category deleted"
  }), "categoriesOutput");

  // Service forms
  wireForm("getAllServicesForm", () => ({
    method: "GET",
    path: "Service/GetAll",
    successMessage: "Fetched services"
  }), "servicesOutput");

  wireForm("getServicesByCategoryForm", (formData) => ({
    method: "GET",
    path: `Service/category/${encodeURIComponent(formData.get("categoryName"))}`,
    successMessage: "Fetched services by category"
  }), "servicesOutput");

  wireForm("filterServicesForm", (formData) => {
    const query = cleanQuery({
      price: formData.get("price"),
      duration: formData.get("duration"),
      categoryName: formData.get("categoryName")
    });
    return {
      method: "GET",
      path: "Service/Filter",
      query,
      successMessage: "Applied filter"
    };
  }, "servicesOutput");

  wireForm("addServiceForm", (formData) => ({
    method: "POST",
    path: "Service/Add",
    body: {
      description: formData.get("description"),
      basePrice: Number(formData.get("basePrice")),
      duration: Number(formData.get("duration")),
      categoryName: formData.get("categoryName")
    },
    successMessage: "Service added"
  }), "servicesOutput");

  wireForm("updateServiceForm", (formData) => ({
    method: "PUT",
    path: `Service/Update/${encodeURIComponent(formData.get("serviceId"))}`,
    body: {
      description: formData.get("description"),
      basePrice: Number(formData.get("basePrice")),
      duration: Number(formData.get("duration")),
      categoryName: formData.get("categoryName")
    },
    successMessage: "Service updated"
  }), "servicesOutput");

  wireForm("deleteServiceForm", (formData) => ({
    method: "DELETE",
    path: `Service/Delete/${encodeURIComponent(formData.get("serviceId"))}`,
    successMessage: "Service deleted"
  }), "servicesOutput");

  // Store forms
  wireForm("getAllStoresForm", () => ({
    method: "GET",
    path: "Store/GetAll",
    successMessage: "Fetched stores"
  }), "storesOutput");

  wireForm("getStoreByIdForm", (formData) => ({
    method: "GET",
    path: `Store/GetById/${encodeURIComponent(formData.get("storeId"))}`,
    successMessage: "Fetched store"
  }), "storesOutput");

  wireForm("addStoreForm", (formData) => ({
    method: "POST",
    path: "Store/Add",
    body: extractStorePayload(formData),
    successMessage: "Store added"
  }), "storesOutput");

  wireForm("updateStoreForm", (formData) => ({
    method: "PUT",
    path: `Store/Edit/${encodeURIComponent(formData.get("storeId"))}`,
    body: extractStorePayload(formData),
    successMessage: "Store updated"
  }), "storesOutput");

  wireForm("deleteStoreForm", (formData) => ({
    method: "DELETE",
    path: `Store/Delete/${encodeURIComponent(formData.get("storeId"))}`,
    successMessage: "Store deleted"
  }), "storesOutput");

  wireForm("filterStoresForm", (formData) => {
    const query = cleanQuery({
      country: formData.get("country"),
      city: formData.get("city"),
      region: formData.get("region"),
      postalCode: formData.get("postalCode"),
      merchantEmail: formData.get("merchantEmail")
    });
    return {
      method: "POST",
      path: "Store/Filter",
      query,
      successMessage: "Filter sent"
    };
  }, "storesOutput");
}

function extractStorePayload(formData) {
  return {
    name: formData.get("name"),
    country: formData.get("country"),
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode"),
    merchantEmail: formData.get("merchantEmail")
  };
}

function cleanQuery(query) {
  const cleaned = {};
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      cleaned[key] = value;
    }
  });
  return cleaned;
}

function wireForm(formId, buildRequest, outputId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const request = buildRequest(formData) || {};
      if (!request.path) {
        throw new Error("Missing API path.");
      }
      const payload = await apiRequest(request);
      const title = request.successMessage || `${request.method || "GET"} ${request.path}`;
      renderResult(outputId, payload, { title });
    } catch (error) {
      renderError(outputId, error);
    }
  });
}

async function apiRequest({ method = "GET", path, body, query }) {
  if (!path) throw new Error("No API path provided.");

  const normalizedBase = (apiBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(`${normalizedBase}/api/${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  const options = { method, headers: {} };
  if (body !== undefined && body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  setStatus(`Calling ${options.method} ${url.pathname}`, "pending");

  const response = await fetch(url.toString(), options);
  const text = await response.text();
  const payload = text ? safeJsonParse(text) ?? text : null;

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    setStatus(`Error ${response.status}`, "error");
    throw error;
  }

  setStatus(`Success ${response.status}`, "success");
  return payload;
}

function renderResult(targetId, data, meta = {}) {
  const container = document.getElementById(targetId);
  if (!container) return;
  const pretty = typeof data === "string" ? data : JSON.stringify(data, null, 2) || "No content";
  container.innerHTML = `
    <div class="result success">
      <div class="result-header">${escapeHtml(meta.title || "Request successful")}</div>
      <pre>${escapeHtml(pretty)}</pre>
    </div>
  `;
}

function renderError(targetId, error) {
  const container = document.getElementById(targetId);
  if (!container) return;

  const message = error?.payload
    ? JSON.stringify(error.payload, null, 2)
    : error?.message || "Unknown error";

  container.innerHTML = `
    <div class="result error">
      <div class="result-header">Request failed${error?.status ? ` (${error.status})` : ""}</div>
      <pre>${escapeHtml(message)}</pre>
    </div>
  `;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
