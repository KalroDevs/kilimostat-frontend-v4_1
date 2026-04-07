import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #0f6e2b, #0c5a22)",
        padding: "60px 0 30px",
        marginTop: "60px",
        color: "#e8f5e9",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "50px",
          }}
        >
          {/* About */}
          <div style={{ maxWidth: "300px" }}>
           
            <p style={{ marginTop: "16px", lineHeight: "1.6", color: "white", }}>
              KilimoSTAT is Kenya’s official agricultural open data platform by the Ministry
              of Agriculture & Livestock Development, offering trusted data for policy,
              research, innovation, and digital agriculture services.
            </p>
          </div>

          {/* FAIR */}
          <div>
            <h4 style={{ color: "#c8e6c9", marginBottom: "12px" }}>FAIR Principles</h4>
            {["Findable", "Accessible", "Interoperable", "Reusable"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#e8f5e9",
                  textDecoration: "none",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => (e.target.style.color = "#a5d6a7")}
                onMouseOut={(e) => (e.target.style.color = "#e8f5e9")}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ color: "#c8e6c9", marginBottom: "12px" }}>Resources</h4>

            <a
              href="https://statistics.kilimo.go.ke/api/redoc/"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#e8f5e9",
                textDecoration: "none",
              }}
            >
              📘 API Documentation
            </a>

            <a
              href="https://statistics.kilimo.go.ke/api/swagger/"
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#e8f5e9",
                textDecoration: "none",
              }}
            >
              ⚙️ API Console
            </a>

            <a href="#" style={{ display: "block", color: "#e8f5e9" }}>
              ❓ FAQ
            </a>
          </div>

          {/* Connect */}
          <div>
            <h4 style={{ color: "#c8e6c9", marginBottom: "12px" }}>Connect</h4>

            <a
              href="https://x.com/kilimoKE"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                color: "#e8f5e9",
                textDecoration: "none",
              }}
            >
              <i className="fab fa-twitter" style={{ marginRight: "8px" }}></i>
              Twitter
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=100064454481570&sk=about"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                color: "#e8f5e9",
                textDecoration: "none",
              }}
            >
              <i className="fab fa-facebook" style={{ marginRight: "8px" }}></i>
              Facebook
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            textAlign: "center",
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            fontSize: "0.8rem",
            color: "#c8e6c9",
          }}
        >
          CC BY 4.0 | © 2026{" "}
          <a
            href="https://kilimo.go.ke/"
            style={{ color: "#a5d6a7", textDecoration: "none" }}
          >
            Ministry of Agriculture & Livestock Development
          </a>{" "}
           | All Rights Reserved
          | Maintained by{" "}
          <a
            href="https://kilimo.go.ke/"
            style={{ color: "#a5d6a7", textDecoration: "none" }}
          >
            KALRO
          </a>
          {" | "}System update version 4.3 | 
        </div>
      </div>
    </footer>
  );
};

export default Footer;