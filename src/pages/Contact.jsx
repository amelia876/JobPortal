import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-page">
      {/* Header Section */}
      <section className="contact-header">
        <h1>Contact Us</h1>
        <p>
          At JobLytics, we value every connection and are committed to helping you find the career 
          opportunities that matter most. Whether you have questions about your account, need 
          assistance navigating job listings, or want to provide feedback, our dedicated support
          team is here to assist you promptly. Your success is our priority, and we strive to 
          ensure every interaction is smooth, informative, and helpful
        </p>
      </section>

      {/* Contact Info */}
      <section className="contact-info">
        <div className="info-card">
          <i className="fas fa-envelope"></i>
          <h3>Email Address</h3>
          <p>joblytics@gmail.com</p>
          <p>joblytics.admin@gmail.com</p>
        </div>

        <div className="info-card">
          <i className="fas fa-phone"></i>
          <h3>Phone Number</h3>
          <p>(300) 1234 9341</p>
          <p>(300) 4578 9341</p>
        </div>

        <div className="info-card">
          <i className="fas fa-map-marker-alt"></i>
          <h3>Office Location</h3>
          <p>Victoria Street, London, UK</p>
          <p>River Street, London, UK</p>
        </div>

        <div className="info-card">
          <i className="fas fa-clock"></i>
          <h3>Work Day</h3>
          <p>Sun – Fri: 09:00 – 17:00</p>
          <p>Sat – Mon: 09:00 – 15:00</p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-form-section">
        <div className="form-left">
          <h4>CONTACT</h4>
          <h2>Get In Touch With Us</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
            tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          </p>

          <form className="contact-form">
            <div className="form-row">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Phone Number" />
              <input type="text" placeholder="Subject" />
            </div>
            <textarea placeholder="Message"></textarea>
            <button type="submit">SEND MESSAGE</button>
          </form>
        </div>

        <div className="form-right">
          <img
            src="https://img.freepik.com/free-photo/medical-team-discussing-patient-scan_1098-22014.jpg"
            alt="Doctors"
          />
        </div>
      </section>

      {/* Call To Action */}
      <section className="contact-cta">
        <h2>Get Your Free Medical Checkup. Let's Connect With Us!</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
          tellus, luctus nec ullamcorper mattis.
        </p>
        <button>CONTACT US</button>
      </section>

      {/* Footer */}
      <footer className="contact-footer">
        <div className="footer-left">
          <h3>GOMEDIC</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
            tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          </p>
        </div>

        <div className="footer-info">
          <h4>Information</h4>
          <ul>
            <li>About Us</li>
            <li>Services</li>
            <li>Careers</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div className="footer-info">
          <h4>Information</h4>
          <p>Gomedic Building, Sesame Street, London, UK</p>
          <p>hello@gomedic.com</p>
          <p>(001) 2341 2342</p>
        </div>
      </footer>

      <p className="footer-note">© All Rights Reserved</p>
    </div>
  );
};

export default Contact;
