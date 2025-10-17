import React from "react";
import "./Login.css";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Section */}
        <div className="login-left">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">
            Welcome! Please log in to your account.
          </p>

          <form className="login-form">
            <label>Email</label>
            <input type="email" placeholder="example@email.com" />

            <label>Password</label>
            <input type="password" placeholder="Please enter your password" />

            <button type="submit" className="login-btn">LOGIN</button>

            <div className="login-links">
              <a href="#">Forgot Password?</a>
              <a href="#">Create an account</a>
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="login-right">
          <img
            src="https://img.freepik.com/free-vector/data-analysis-concept-illustration_114360-8042.jpg"
            alt="Login Illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
