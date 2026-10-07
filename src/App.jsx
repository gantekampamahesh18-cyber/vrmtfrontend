import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/visitors";

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
  const [formData, setFormData] = useState(emptyForm);
  const [page, setPage] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load visitors
  const loadVisitors = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load visitors");
      }

      const data = await response.json();

      setVisitors(data);
      setPage("visitors");
    } catch (error) {
      console.error(error);

      alert(
        "Could not connect to backend.\n\nMake sure Spring Boot is running on port 8080."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open Add Visitor
  const openAddVisitor = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setPage("add");
  };

  // Open Edit Visitor
  const openEditVisitor = (visitor) => {
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
    setPage("edit");
  };

  // Add Visitor
  const addVisitor = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add visitor");
      }

      alert("Visitor added successfully!");

      setFormData(emptyForm);

      await loadVisitors();
    } catch (error) {
      console.error(error);
      alert("Could not add visitor.");
    }
  };

  // Update Visitor
  const updateVisitor = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update visitor");
      }

      alert("Visitor updated successfully!");

      setFormData(emptyForm);
      setEditingId(null);

      await loadVisitors();
    } catch (error) {
      console.error(error);
      alert("Could not update visitor.");
    }
  };

  // Delete Visitor
  const deleteVisitor = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this visitor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete visitor");
      }

      alert("Visitor deleted successfully!");

      await loadVisitors();
    } catch (error) {
      console.error(error);
      alert("Could not delete visitor.");
    }
  };

  // Go to Dashboard
  const showDashboard = () => {
    setPage("dashboard");
    setFormData(emptyForm);
    setEditingId(null);
  };

  // Visitor Form
  const renderVisitorForm = () => {
    const isEdit = editingId !== null;

    return (
      <div className="form-section">
        <div className="section-header">
          <h2>{isEdit ? "Edit Visitor" : "Add New Visitor"}</h2>

          <button className="back-button" onClick={loadVisitors}>
            Back
          </button>
        </div>

        <form onSubmit={isEdit ? updateVisitor : addVisitor}>
          <div className="form-group">
            <label>Name *</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter visitor name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>Address</label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </div>

          <div className="form-group">
            <label>ID Proof</label>

            <select
              name="idProof"
              value={formData.idProof}
              onChange={handleChange}
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
            <label>ID Proof Number</label>

            <input
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleChange}
              placeholder="Enter ID proof number"
            />
          </div>

          <div className="form-group">
            <label>Photo</label>

            <input
              type="text"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="Example: visitor.jpg"
            />
          </div>

          <button type="submit" className="submit-button">
            {isEdit ? "Update Visitor" : "Save Visitor"}
          </button>
        </form>
      </div>
    );
  };

  // Visitor List
  const renderVisitors = () => {
    return (
      <div className="visitor-section">
        <div className="section-header">
          <h2>Visitors</h2>

          <div className="header-buttons">
            <button className="add-button" onClick={openAddVisitor}>
              + Add Visitor
            </button>

            <button className="back-button" onClick={showDashboard}>
              Dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <p className="message">Loading visitors...</p>
        ) : visitors.length === 0 ? (
          <p className="message">No visitors found.</p>
        ) : (
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
                    <strong>Phone:</strong>{" "}
                    {visitor.phone || "-"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {visitor.email || "-"}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {visitor.address || "-"}
                  </p>

                  <p>
                    <strong>ID Proof:</strong>{" "}
                    {visitor.idProof || "-"}
                  </p>

                  <p>
                    <strong>ID Number:</strong>{" "}
                    {visitor.idProofNumber || "-"}
                  </p>

                  <p>
                    <strong>Photo:</strong>{" "}
                    {visitor.photo || "-"}
                  </p>
                </div>

                <div className="action-buttons">
                  <button
                    className="edit-button"
                    onClick={() => openEditVisitor(visitor)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteVisitor(visitor.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>Digital Visitor Management System</h1>

        <p>
          Manage visitors digitally and efficiently
        </p>
      </header>

      {/* NAVIGATION */}
      <nav className="navbar">
        <button onClick={showDashboard}>
          Dashboard
        </button>

        <button onClick={loadVisitors}>
          Visitors
        </button>

        <button>
          Employees
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="content">

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <>
            <h2>Visitor Management</h2>

            <div className="cards">

              <div className="card">
                <h3>Visitors</h3>

                <p>
                  Manage visitor information
                </p>

                <button onClick={loadVisitors}>
                  View Visitors
                </button>
              </div>

              <div className="card">
                <h3>Add Visitor</h3>

                <p>
                  Register a new visitor
                </p>

                <button onClick={openAddVisitor}>
                  Add Visitor
                </button>
              </div>

            </div>
          </>
        )}

        {/* ADD VISITOR */}
        {page === "add" && renderVisitorForm()}

        {/* EDIT VISITOR */}
        {page === "edit" && renderVisitorForm()}

        {/* VIEW VISITORS */}
        {page === "visitors" && renderVisitors()}

      </main>
    </div>
  );
}

export default App;