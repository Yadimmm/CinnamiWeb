import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import logoCinnami from "../../assets/logos/CINNAMILOGO.png";
import globalstyles from "../../styles/globalStyles.module.css";
import { useLoader } from "../../context/LoaderContext"; // <<--- LOADER GLOBAL
// Pantalla de recuperación de contraseña
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const { showLoader, hideLoader } = useLoader(); // <<--- LOADER GLOBAL
// Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    showLoader("Enviando correo..."); 
    try {
      const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("¡Te enviamos un correo con instrucciones para restablecer tu contraseña!");
      } else {
        setErrorMsg(data.message || "No pudimos enviar el correo. Verifica tu email.");
      }
    } catch (err) {
      setErrorMsg("Hubo un error de conexión.");
    } finally {
      hideLoader(); 
    }
  };

  return (
    <div className={globalstyles.containerPrincipal}>
      <main className={globalstyles.contenedorDashboard}>
        <div
          style={{
            maxWidth: 420,
            margin: "80px auto 0 auto",
            background: "#fff",
            padding: 38,
            borderRadius: 18,
            boxShadow: "0 6px 32px #ecd8ba38",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative"
          }}
        >
          {/* Botón regreso */}
          <button
            onClick={() => navigate("/")}
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#c1a26c",
              fontSize: 19,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              transition: "color 0.18s"
            }}
            type="button"
            tabIndex={-1}
            title="Volver al login"
            onMouseOver={e => (e.currentTarget.style.color = "#a18246")}
            onMouseOut={e => (e.currentTarget.style.color = "#c1a26c")}
          >
            <FiArrowLeft size={23} style={{ marginRight: 6 }} />
            Login
          </button>

          <img src={logoCinnami} alt="Cinnami Logo" style={{ width: 65, margin: "0 auto 8px auto" }} />
          <div style={{
            textAlign: "center",
            color: "#c1a26c",
            fontWeight: 700,
            letterSpacing: 0.6,
            fontSize: 22,
            marginBottom: 1
          }}>CINNAMI</div>
          <div style={{
            textAlign: "center",
            fontSize: 15,
            color: "#b7a177",
            marginBottom: 16,
            fontWeight: 500
          }}>Smart solutions for a connected world</div>
          <div style={{
            width: 60, height: 3, background: "#e7dab7", margin: "0 auto 15px auto", borderRadius: 5
          }} />

          <h1
            style={{
              textAlign: "center",
              marginBottom: 25,
              color: "#b7954a",
              fontWeight: 800,
              fontSize: 23,
              letterSpacing: "0.1px"
            }}
          >
            ¿Olvidaste tu contraseña?
          </h1>
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <label style={{ color: "#a18246", fontWeight: 600, marginBottom: 9, display: "block" }}>
              Ingresa tu correo electrónico
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 11px",
                fontSize: 15.5,
                borderRadius: 9,
                border: "1.5px solid #e3d3b2",
                marginBottom: 21,
                background: "#fff",
                color: "#6c5423",
                fontWeight: 500,
                letterSpacing: ".04px",
                outline: "none"
              }}
              placeholder="ejemplo@cinnami.com"
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(90deg, #c1a26c 60%, #e7d2ac 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 15,
                boxShadow: "0 4px 14px #c7aa8632",
                cursor: "pointer",
                transition: ".18s"
              }}
            >
              Enviar correo
            </button>
            {successMsg && (
              <div
                style={{
                  background: "#e9e7d4",
                  color: "#5d5808",
                  borderRadius: 10,
                  padding: "12px 17px",
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "1rem",
                  border: "1.5px solid #E0A92F",
                  marginBottom: 8,
                  marginTop: 3,
                  boxShadow: "0 1px 7px #e0a92f18",
                  animation: "fadeIn 0.4s"
                }}
              >
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div
                style={{
                  background: "#fff2f0",
                  color: "#9c310c",
                  borderRadius: 10,
                  padding: "12px 17px",
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "1rem",
                  border: "1.5px solid #e2b1a0",
                  marginBottom: 8,
                  marginTop: 3,
                  boxShadow: "0 1px 7px #eaa39e18",
                  animation: "fadeIn 0.4s"
                }}
              >
                {errorMsg}
              </div>
            )}
          </form>
          <div style={{
            marginTop: 19,
            fontSize: 13,
            color: "#b7a177",
            letterSpacing: 0.3,
            textAlign: "center"
          }}>
            © 2025 CINNAMI — <span style={{ fontWeight: 700 }}>Confidencial</span>
          </div>
        </div>
      </main>
    </div>
  );
}
