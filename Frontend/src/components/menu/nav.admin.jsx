import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./nav.scss";

const NavAdmin = ({ currentUser, handeleLogout }) => {
  return (
    <ul className="nav-items" id="nav-bar">
      {currentUser ? (
        <Fragment>
          <li className="nav-item">
            <Link to={`/user/list`}>Users</Link>
          </li>
          <li className="nav-item">
            <Link to={`/user/pass`}>Change Password</Link>
          </li>
          <li className="nav-item">
            <Link to="/login" onClick={handeleLogout}>
              Logout
            </Link>
          </li>
        </Fragment>
      ) : (
        <li className="nav-item">
          <Link to="/login">Login</Link>
        </li>
      )}
    </ul>
  );
};

NavAdmin.propTypes = {
  currentUser: PropTypes.object,
  handeleLogout: PropTypes.func,
};

export default NavAdmin;
