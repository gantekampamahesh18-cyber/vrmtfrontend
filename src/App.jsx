import { useRef, useState } from "react";
import "./App.css";

const API_URL =
  "https://visitormanagement-1-m46e.onrender.com/api/visitors";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  idProof: "",
  idProofNumber: "",
  photo: "",
};

function App() {
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [page, setPage] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formReturnPage, setFormReturnPage] = useState("dashboard");
  const [errorMessage, setErrorMessage] = useState("");

  // Prevent duplicate requests and submissions
  const visitorRequest = useRef(null);
  const submitLock = useRef(false);

  // Load visitors and avoid overlapping GET requests
  const loadVisitors = async (navigate = true) => {
    if (navigate) {
      setPage("visitors");
      setErrorMessage("");
    }

    if (visitorRequest.current) {
      return visitorRequest.current;
    }

    setLoading(true);
    setErrorMessage("");

    const request = (async () => {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Unable to load visitors (${response.status})`);
      }

      return response.json();
    })();

    visitorRequest.current = request;

    try {
      const data = await request;
      setVisitors(data);
      return data;
    } catch (error) {
      console.error("Load visitors error:", error);
      setErrorMessage(
        "Could not load visitors. Please check the backend connection and try again."
      );
      return null;
    } finally {
      if (visitorRequest.current === request) {
        visitorRequest.current = null;
        setLoading(false);
      }
    }
  };

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Open Add Visitor
  const openAddVisitor = () => {
    if (submitting) return;

    setFormReturnPage(
      page === "visitors" ? "visitors" : "dashboard"
    );
    setFormData({ ...emptyForm });
    setEditingId(null);
    setErrorMessage("");
    setPage("add");
  };

  // Open Edit Visitor
  const openEditVisitor = (visitor) => {
    if (submitting) return;

    setFormData({
      name: visitor.name || "",
      phone: visitor.phone || "",
      email: visitor.email || "",
      address: visitor.address || "",
      idProof: visitor.idProof || "",
      idProofNumber: visitor.idProofNumber || "",
      photo: visitor.photo || "",
    });

    setEditingId(visitor.id);
    setErrorMessage("");
    setPage("edit");
  };

  // Return from the form without making another network request
  const goBackFromForm = () => {
    if (submitLock.current) return;

    setPage(
      editingId !== null ? "visitors" : formReturnPage
    );
    setFormData({ ...emptyForm });
    setEditingId(null);
    setErrorMessage("");
  };

  // Submit Add or Edit form
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitLock.current) return;

    submitLock.current = true;
    setSubmitting(true);
    setErrorMessage("");

    const isEdit = editingId !== null;

    try {
      const response = await fetch(
        isEdit ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Request failed (${response.status})`
        );
      }

      setFormData({ ...emptyForm });
      setEditingId(null);
      setPage("visitors");

      window.alert(
        isEdit
          ? "Visitor updated successfully!"
          : "Visitor added successfully!"
      );

      await loadVisitors(false);
    } catch (error) {
      console.error("Save visitor error:", error);
      setErrorMessage(
        error.message || "Could not save visitor. Please try again."
      );
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  // Delete Visitor
  const deleteVisitor = async (id) => {
    if (submitLock.current) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this visitor?"
    );

    if (!confirmed) return;

    submitLock.current = true;
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      setVisitors((previous) =>
        previous.filter((visitor) => visitor.id !== id)
      );

      window.alert("Visitor deleted successfully!");

      // Refresh data after deletion
      await loadVisitors(false);
    } catch (error) {
      console.error("Delete visitor error:", error);
      setErrorMessage(
        error.message || "Could not delete visitor. Please try again."
      );
    } finally {
      submitLock.current = false;
    }
  };

  // Dashboard navigation
  const showDashboard = () => {
    if (submitting) return;

    setPage("dashboard");
    setFormData({ ...emptyForm });
    setEditingId(null);
    setErrorMessage("");
  };

  // Add/Edit form
  const renderVisitorForm = () => {
    const isEdit = editingId !== null;

    return (
      <div className="form-section">
        <div className="section-header">
          <h2>{isEdit ? "Edit Visitor" : "Add New Visitor"}</h2>

          <button
            type="button"
            className="back-button"
            onClick={goBackFromForm}
            disabled={submitting}
          >
            Back
          </button>
        </div>

        {errorMessage && (
          <p className="message" role="alert">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="visitor-name">Name *</label>
            <input
              id="visitor-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter visitor name"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visitor-phone">Phone *</label>
            <input
              id="visitor-phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visitor-email">Email</label>
            <input
              id="visitor-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visitor-address">Address</label>
            <input
              id="visitor-address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visitor-id-proof">ID Proof</label>
            <select
              id="visitor-id-proof"
              name="idProof"
              value={formData.idProof}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">Select ID Proof</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">
                Driving License
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="visitor-id-number">
              ID Proof Number
            </label>
            <input
              id="visitor-id-number"
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleChange}
              placeholder="Enter ID proof number"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visitor-photo">Photo</label>
            <input
              id="visitor-photo"
              type="text"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="Example: visitor.jpg"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={submitting}
          >
            {submitting
              ? "Please wait..."
              : isEdit
              ? "Update Visitor"
              : "Save Visitor"}
          </button>
        </form>
      </div>
    );
  };

  // Visitor list
  const renderVisitors = () => (
    <div className="visitor-section">
      <div className="section-header">
        <h2>Visitors</h2>

        <div className="header-buttons">
          <button
            type="button"
            className="add-button"
            onClick={openAddVisitor}
          >
            + Add Visitor
          </button>

          <button
            type="button"
            className="back-button"
            onClick={showDashboard}
          >
            Dashboard
          </button>
        </div>
      </div>

      {errorMessage && (
        <div>
          <p className="message" role="alert">
            {errorMessage}
          </p>
          <button
            type="button"
            className="back-button"
            onClick={() => loadVisitors(false)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Try Again"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="message">Loading visitors...</p>
      ) : !errorMessage && visitors.length === 0 ? (
        <p className="message">No visitors found.</p>
      ) : (
        !errorMessage && (
          <div className="visitor-list">
            {visitors.map((visitor) => (
              <div className="visitor-card" key={visitor.id}>
                <div className="visitor-card-header">
                  <h3>{visitor.name}</h3>
                  <span className="visitor-id">
                    ID: {visitor.id}
                  </span>
                </div>

                <div className="visitor-details">
                  <p>
                    <strong>Phone:</strong> {visitor.phone || "-"}
                  </p>
                  <p>
                    <strong>Email:</strong> {visitor.email || "-"}
                  </p>
                  <p>
                    <strong>Address:</strong> {visitor.address || "-"}
                  </p>
                  <p>
                    <strong>ID Proof:</strong> {visitor.idProof || "-"}
                  </p>
                  <p>
                    <strong>ID Number:</strong>{" "}
                    {visitor.idProofNumber || "-"}
                  </p>
                  <p>
                    <strong>Photo:</strong> {visitor.photo || "-"}
                  </p>
                </div>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => openEditVisitor(visitor)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteVisitor(visitor.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <h1>Digital Visitor Management System</h1>
        <p>Manage visitors digitally and efficiently</p>
      </header>

      <nav className="navbar">
        <button type="button" onClick={showDashboard}>
          Dashboard
        </button>
        <button type="button" onClick={() => loadVisitors(true)}>
          Visitors
        </button>
        <button type="button" onClick={() => {}}>
          Employees
        </button>
      </nav>

      <main className="content">
        {page === "dashboard" && (
          <>
            <h2>Visitor Management</h2>

            <div className="cards">
              <div className="card">
                <h3>Visitors</h3>
                <p>Manage visitor information</p>
                <button
                  type="button"
                  onClick={() => loadVisitors(true)}
                >
                  View Visitors
                </button>
              </div>

              <div className="card">
                <h3>Add Visitor</h3>
                <p>Register a new visitor</p>
                <button
                  type="button"
                  onClick={openAddVisitor}
                >
                  Add Visitor
                </button>
              </div>
            </div>
          </>
        )}

        {page === "add" && renderVisitorForm()}
        {page === "edit" && renderVisitorForm()}
        {page === "visitors" && renderVisitors()}
      </main>
    </div>
  );
}

export default App;