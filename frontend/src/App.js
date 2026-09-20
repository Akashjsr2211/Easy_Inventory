import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import TaglineSection from "./TaglineSection";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Unable to load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/products/${editId}`, {
          ...form,
          id: Number(form.id),
          price: Number(form.price),
          quantity: Number(form.quantity),
        });

        setMessage("Product updated successfully");
      } else {
        await api.post("/products", {
          ...form,
          id: Number(form.id),
          price: Number(form.price),
          quantity: Number(form.quantity),
        });

        setMessage("Product created successfully");
      }

      setForm({
        id: "",
        name: "",
        description: "",
        price: "",
        quantity: "",
      });

      setEditId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });

    setEditId(product.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage("Unable to delete product.");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const text = `${product.name} ${product.description} ${product.id}`.toLowerCase();

      return text.includes(search.toLowerCase());
    });

    if (!sortConfig.key) {
      return result;
    }

    return [...result].sort((a, b) => {
      const first = a[sortConfig.key];
      const second = b[sortConfig.key];

      if (first < second) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (first > second) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [products, search, sortConfig]);

  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const totalValue = products.reduce(
    (total, product) =>
      total +
      Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="app-shell">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="topbar">
        <div className="brand-area">
          <div className="brand-icon">EI</div>

          <div>
            <h1>Easy Inventory</h1>
            <p>Simple inventory management</p>
          </div>
        </div>

        <div className="topbar-status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      <main className="dashboard">
        <section className="hero-section">
          <div>
            <span className="eyebrow">INVENTORY DASHBOARD</span>

            <h2>
              Manage your products
              <span> with ease.</span>
            </h2>

            <p>
              Add, update, search and manage your inventory from one simple
              dashboard.
            </p>
          </div>

          <div className="hero-decoration">
            <div className="hero-circle">
              <span>📦</span>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">▦</div>

            <div>
              <p>Total Products</p>
              <h3>{totalProducts}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">◈</div>

            <div>
              <p>Total Quantity</p>
              <h3>{totalQuantity}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">₹</div>

            <div>
              <p>Inventory Value</p>
              <h3>₹{totalValue.toLocaleString()}</h3>
            </div>
          </div>
        </section>

        {message && (
          <div className="message-banner">
            <span>✓</span>
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <section className="workspace-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">
                  {editId ? "EDIT PRODUCT" : "NEW PRODUCT"}
                </span>

                <h3>{editId ? "Update product" : "Add a product"}</h3>
              </div>

              <div className="heading-icon">
                {editId ? "✎" : "+"}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Product ID</label>

                <input
                  type="number"
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="Enter product ID"
                  required
                />
              </div>

              <div className="input-group">
                <label>Product Name</label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. iPhone 17"
                  required
                />
              </div>

              <div className="input-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Price</label>

                  <div className="input-with-symbol">
                    <span>₹</span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-button">
                  <span>{editId ? "✓" : "+"}</span>
                  {editId ? "Update Product" : "Add Product"}
                </button>

                {editId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setEditId(null);
                      setForm({
                        id: "",
                        name: "",
                        description: "",
                        price: "",
                        quantity: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="panel products-panel">
            <div className="products-header">
              <div>
                <span className="panel-label">PRODUCT CATALOG</span>
                <h3>Your inventory</h3>
              </div>

              <div className="product-count">
                {filteredProducts.length} items
              </div>
            </div>

            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")}>×</button>
              )}
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort("id")}>
                      ID <span>{getSortIcon("id")}</span>
                    </th>

                    <th onClick={() => handleSort("name")}>
                      PRODUCT <span>{getSortIcon("name")}</span>
                    </th>

                    <th>DESCRIPTION</th>

                    <th onClick={() => handleSort("price")}>
                      PRICE <span>{getSortIcon("price")}</span>
                    </th>

                    <th onClick={() => handleSort("quantity")}>
                      STOCK <span>{getSortIcon("quantity")}</span>
                    </th>

                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <span className="id-badge">#{product.id}</span>
                        </td>

                        <td>
                          <div className="product-name-cell">
                            <div className="product-avatar">
                              {product.name?.charAt(0).toUpperCase()}
                            </div>

                            <strong>{product.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="description-cell">
                            {product.description}
                          </span>
                        </td>

                        <td>
                          <strong>₹{Number(product.price).toLocaleString()}</strong>
                        </td>

                        <td>
                          <span
                            className={`stock-badge ${
                              Number(product.quantity) <= 5
                                ? "low-stock"
                                : "good-stock"
                            }`}
                          >
                            <span></span>
                            {product.quantity} units
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEdit(product)}
                              title="Edit"
                            >
                              ✎
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => handleDelete(product.id)}
                              title="Delete"
                            >
                              ♲
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <div>📦</div>
                          <h4>No products found</h4>
                          <p>
                            Add a product or change your search to see results.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <TaglineSection />
      </main>

      <footer>
        <span>Easy Inventory</span>
        <span>•</span>
        <span>Inventory made simple</span>
      </footer>
    </div>
  );
}

export default App;