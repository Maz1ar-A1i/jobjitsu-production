import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/slice/authSlice";
import NavAdmin from "./nav.admin";
import NavPublic from "./nav.public";
import LogoImage from "../../assets/images/tkxel_logo.png";
import PropTypes from "prop-types";

import "./nav.scss";
import { Link, useNavigate } from "react-router-dom";
import { Image as Img } from 'simple-react-image';


const Navbar = ({ currentUser, loggingStatus }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState("user");

  const handeleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    (async () => {
      if (currentUser) {
        setRole(currentUser.role);
      }
    })();
  }, []);
  return (
    <div className="header bg-primary text-white">
      <div className="container">
        <div className="header-content-wrapper">
          <div className="brand-logo">
            <Link to={`/`}>
              <Img className='header-logo' src={LogoImage} alt="" />
            </Link>
          </div>
          {currentUser?.role === "admin" ? (
            <NavAdmin currentUser={currentUser} handeleLogout={handeleLogout} />
          ) : (
            <NavPublic
              currentUser={currentUser}
              loggingStatus={loggingStatus}
              handeleLogout={handeleLogout}
            />
          )}

          {/* {loggingStatus === true && <button className='btn btn-success' onClick={handeleLogout}>
            logout
          </button>} */}
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  currentUser: PropTypes.object,
  loggingStatus: PropTypes.bool,
};
export default Navbar;
