import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logoCinnami from "../../assets/logos/CINNAMILOGO.png";
import globalstyles from "../../styles/globalStyles.module.css";
import { useLoader } from "../../context/LoaderContext"; 
// Pantalla de restablecimiento de contraseña
export default function ResetPasswordScreen() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const { showLoader, hideLoader } = useLoader(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!password || password.length < 6) {
      setErr("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    showLoader("Restableciendo contraseña..."); 
    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("¡Contraseña restablecida exitosamente! Redirigiendo al inicio...");
        setTimeout(() => {
          hideLoader();
          navigate("/"); 
        }, 2000);
      } else {
        setErr(data.message || "El enlace ha expirado o es inválido.");
        hideLoader();
      }
    } catch {
      setErr("Hubo un error de conexión.");
      hideLoader();
    }
  };


  // iconos de ojo
  const iconStyle = {
    position: "absolute",
    right: 11,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#c1a26c",
    fontSize: 21,
    userSelect: "none",
    transition: "color 0.18s"
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
            alignItems: "center"
          }}
        >
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
            Restablece tu contraseña
          </h1>
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <label style={{ color: "#a18246", fontWeight: 600, marginBottom: 9, display: "block" }}>
              Nueva contraseña
            </label>
            <div style={{ position: "relative", marginBottom: 17 }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                style={{
                  width: "100%",
                  padding: "13px 36px 13px 11px",
                  fontSize: 15.5,
                  borderRadius: 9,
                  border: "1.5px solid #e3d3b2",
                  background: "#fff",
                  color: "#6c5423",
                  fontWeight: 500,
                  letterSpacing: ".04px",
                  outline: "none"
                }}
                placeholder="Nueva contraseña"
                required
              />
              <span
                style={iconStyle}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((v) => !v)}
                onMouseOver={e => (e.currentTarget.style.color = "#a18246")}
                onMouseOut={e => (e.currentTarget.style.color = "#c1a26c")}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            <div style={{ position: "relative", marginBottom: 22 }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                style={{
                  width: "100%",
                  padding: "13px 36px 13px 11px",
                  fontSize: 15.5,
                  borderRadius: 9,
                  border: "1.5px solid #e3d3b2",
                  background: "#fff",
                  color: "#6c5423",
                  fontWeight: 500,
                  letterSpacing: ".04px",
                  outline: "none"
                }}
                placeholder="Confirmar contraseña"
                required
              />
              <span
                style={iconStyle}
                title={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowConfirm((v) => !v)}
                onMouseOver={e => (e.currentTarget.style.color = "#a18246")}
                onMouseOut={e => (e.currentTarget.style.color = "#c1a26c")}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
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
              Restablecer contraseña
            </button>
            {msg && (
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
                {msg}
              </div>
            )}
            {err && (
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
                {err}
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
