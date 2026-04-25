import React from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  return (
    <div className="contact-page">
      <main className="container">
        <section className="contact-hero">
          <h1>Contact</h1>
          <p>Nous contacter pour toute question</p>
        </section>
        <div className="contact-grid">
          <div className="contact-card">
            <span className="material-symbols-outlined">mail</span>
            <h3>Email</h3>
            <p>contact@ekklesia-award.com</p>
          </div>
          <div className="contact-card">
            <span className="material-symbols-outlined">phone</span>
            <h3>WhatsApp</h3>
            <p>+237 6XX XX XX XX</p>
          </div>
          <div className="contact-card">
            <span className="material-symbols-outlined">location_on</span>
            <h3>Adresse</h3>
            <p>Yaoundé, Cameroun</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contact;

