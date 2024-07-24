import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import './NavigationBar.css';

function NavigationBar() {
  return (
    <Navbar className="custom-navbar">
      <Navbar.Brand href="/">
        C-SPAN Article Generation Tool
      </Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto nav-links">
          <Nav.Link href="/" className="nav-box">
            Page View
          </Nav.Link>
          <Nav.Link href="/LegislationList" className="nav-box">
            Legislation Summaries
          </Nav.Link>
          <Nav.Link href="/subtitleview" className="nav-box">
            Subtitle Summaries
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;