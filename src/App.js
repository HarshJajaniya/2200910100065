import "./App.css";
import React, { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const BEARER_TOKEN =
  process.env.REACT_APP_ACCESS_TOKEN || "YOUR_BEARER_TOKEN_HERE";

function App() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLinks, setFetchingLinks] = useState(false);

  const fetchLinks = async () => {
    setFetchingLinks(true);
    try {
      const res = await fetch(`${API_BASE}/api/links`, {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to fetch links");
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch links");
    } finally {
      setFetchingLinks(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);
    if (!url.trim()) {
      setError("Please add a URL");
      setLoading(false);
      return;
    }

    try {
      const body = { url: url.trim() };
      if (customCode.trim()) body.customCode = customCode.trim();

      const res = await fetch(`${API_BASE}/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data);
        setUrl("");
        setCustomCode("");
        fetchLinks();
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>HTTP Link Shortener</h1>

      <form onSubmit={handleShorten}>
        <div>
          <label>Enter your URL</label>
          <input
            type="url"
            placeholder="Enter your URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Custom Shortcode (optional)</label>
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="e.g. abcd1 (alphanumeric, - or _, 3-32 chars)"
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success">
            Shortened URL:{" "}
            <a
              href={success.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {success.shortUrl}
            </a>
            <CopyToClipboard text={success.shortUrl}>
              <button>Copy</button>
            </CopyToClipboard>
          </div>
        )}
      </form>

      <h2>All Shortened Links</h2>
      <div className="links">
        {fetchingLinks ? (
          <div>Loading links...</div>
        ) : links.length === 0 ? (
          <div>No links yet.</div>
        ) : (
          links.map((link) => (
            <div className="link-card" key={link.id}>
              <div>
                <strong>Short:</strong>{" "}
                <a href={link.shortUrl} target="_blank" rel="noreferrer">
                  {link.shortUrl}
                </a>
              </div>
              <div>
                <strong>Original:</strong>{" "}
                <a href={link.originalUrl} target="_blank" rel="noreferrer">
                  {link.originalUrl}
                </a>
              </div>
              <div>
                <small>
                  Created: {new Date(link.createdAt).toLocaleString()}
                </small>
              </div>
              <CopyToClipboard text={link.shortUrl}>
                <button>Copy</button>
              </CopyToClipboard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
