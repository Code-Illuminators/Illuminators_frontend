export default function Main() {
  return (
    <>
      <nav className="navbar fixed-top glass-nav" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand logo-text" href="#">
            Code Illuminators
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="offcanvas offcanvas-end offcanvas-glass"
            id="offcanvasNavbar"
            tabIndex="-1"
            aria-labelledby="offcanvasNavbarLabel"
            style={{ "--bs-offcanvas-width": "340px" }}
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                Code Illuminators
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            <div className="offcanvas-body p-3">
              <ul className="nav flex-column gap-1 w-100 offcanvas-menu">
                <li className="nav-item">
                  <a className="nav-link active d-block" href="#">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-block" href="#">
                    Big Foot
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-block" href="#">
                    UFO
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-block" href="#">
                    Ghost
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-block" href="#">
                    Others
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}