import { useState, useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Popup,
  useMapEvents,
} from "react-leaflet";
import bigFootMarker from "../img/big_foot_marker.png";
import ufoMarker from "../img/ufo_marker.png";
import ghostMarker from "../img/ghost_marker.png";
import questionMarker from "../img/question-marker.png";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

export default function Main({ initialMarkers = [] }) {
  const [selectedCreature, setSelectedCreature] = useState("");
  const [customCreature, setCustomCreature] = useState("");
  const [locationMark, setLocationMark] = useState("");
  const [markers, setMarkers] = useState(initialMarkers);
  const [tempMarker, setTempMarker] = useState(null);
  const [markerPhoto, setMarkerPhoto] = useState(null);
  const navigate = useNavigate();

  const icons = {
    bigfoot: new Icon({ iconUrl: bigFootMarker, iconSize: [38, 38] }),
    ufo: new Icon({ iconUrl: ufoMarker, iconSize: [38, 38] }),
    ghosts: new Icon({ iconUrl: ghostMarker, iconSize: [38, 38] }),
    default: new Icon({ iconUrl: questionMarker, iconSize: [38, 38] }),
  };

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const accessToken = loggedUser?.access;
  const userRole = loggedUser?.user?.role;

  const isSimpleUser = userRole === "simple";

  const blockMayday = userRole !== "simple" && userRole !== "silver";

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const creatureTypes = ["bigfoot", "ufo", "ghosts", "others"];
    const fetchPromises = creatureTypes.map((type) =>
      fetch(`${API_BASE_URL}/api/posts/${type}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem("user");
            navigate("/login");
            throw new Error("401 Unauthorized");
          }
          if (res.status === 404) {
            console.warn(`404 Not posts found`);
            return [];
          }
          if (res.ok) {
            return res.json();
          }
        })
        .then((data) =>
          data.map((marker) => ({
            id: marker.id,
            lat: marker.lat,
            lng: marker.lng,
            location: marker.location,
            image_url: marker.image,
            type: type === "others" ? "default" : type,
            popUp: marker.location,
          })),
        ),
    );

    Promise.all(fetchPromises).then((results) => {
      const allMarkers = results.flat();
      setMarkers(allMarkers);
      console.log(`Successfully loaded ${allMarkers.length} existing markers.`);
    });
  }, [accessToken, navigate]);

  const handleDeleteMarker = (markerId) => {
    const fullMarker = markers.find((marker) => marker.id === markerId);
    if (!fullMarker || !fullMarker.id) {
      alert("Something went wrong");
      return;
    }

    const backendId = fullMarker.id;
    const creatureType =
      fullMarker.type === "default" ? "others" : fullMarker.type;
    if (
      !window.confirm(
        `Are you sure you want to delete this sighting for ${creatureType} at ${fullMarker.location}?`,
      )
    ) {
      return;
    }

    if (!accessToken) {
      alert("Authorization failed. Please log in.");
      navigate("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/posts/${creatureType}/${backendId}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("401 Unauthorized");
        }
        if (res.status === 404) {
          console.warn(`404 Not posts found`);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setMarkers((prev) => prev.filter((marker) => marker.id !== markerId));
          alert("Marker deleted successfully!");
        } else {
          alert(`Deletion failed: ${data.error}`);
        }
      });
  };
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        if (isSimpleUser) {
          alert("Simple users cannot submit new markers.");
          return;
        }
        if (!selectedCreature) {
          alert("Please select a creature first!");
          return;
        }

        const popUpText = locationMark;

        setTempMarker({
          id: "temp",
          position: e.latlng,
          popUp: popUpText,
          location: locationMark,
        });
      },
    });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const creatureTypeRoute =
      selectedCreature === "other" ? "others" : selectedCreature;
    const popUpText = locationMark;

    const formData = new FormData();
    formData.append("location", locationMark);
    formData.append("lat", tempMarker.position.lat);
    formData.append("lng", tempMarker.position.lng);
    formData.append("image", markerPhoto, markerPhoto.name);
    if (selectedCreature === "other") {
      formData.append("creature_name", customCreature);
    }

    fetch(`${API_BASE_URL}/api/posts/${creatureTypeRoute}/create/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("401 Unauthorized");
        }
        if (res.status === 404) {
          console.warn(`404 Not posts found`);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        const imageUrlFromBackend = data.image;
        const newMarkerId = data.id;
        const finalMarker = {
          id: newMarkerId,
          key: newMarkerId,
          lat: tempMarker.position.lat,
          lng: tempMarker.position.lng,
          popUp: popUpText,
          type: creatureTypeRoute === "others" ? "default" : creatureTypeRoute,
          location: locationMark,
          image_url: imageUrlFromBackend,
        };
        setMarkers((prev) => [...prev, finalMarker]);

        setTempMarker(null);
        setLocationMark("");
        setMarkerPhoto(null);
        alert("Submitted creature");
      });
  };

  const handleMayday = (e) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const accessToken = storedUser?.access;

    if (!accessToken) {
      alert("Authorization failed. Please log in.");
      return;
    }

    if (window.confirm("Are you sure about it ?")) {
      fetch(`${API_BASE_URL}/api/moderation/delete-all/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          console.log(JSON.stringify({ we_are_compromised: true }));
          if (data.success) {
            window.alert(`All password have been deleted successfully`);
            setMarkers([]);
          }
        });
    }
  };

  const handleLogout = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.refresh) {
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: user.refresh }),
    }).then((data) => {
      console.log("Logout response:", data);
      localStorage.removeItem("user");
      navigate("/login");
    });
  };

  function DeleteButton({ marker, handleDelete, isSimpleUser }) {
    const onDelete = () => {
      handleDelete(marker.id);
    };

    return marker.id ? (
      <button
        onClick={onDelete}
        className={`btn btn-sm mt-2 ${isSimpleUser ? "btn-secondary" : "btn-danger"}`}
        style={{ display: "block", width: "100%" }}
        disabled={isSimpleUser}
      >
                        {isSimpleUser ? "Deleting Denied" : "Delete"}         
         {" "}
      </button>
    ) : null;
  }
  const handlePromotion = () => {
    navigate("/promotion");
  };
  const handleOngoingVotes = () => {
    navigate("/ongoing-votes");
  };

  return (
    <>
                 {" "}
      <nav className="navbar fixed-top glass-nav" data-bs-theme="dark">
                       {" "}
        <div className="container-fluid">
                             {" "}
          <a className="navbar-brand logo-text" href="/">
            Code Illuminators
          </a>
                             {" "}
          <div className="d-flex justify-content-center flex-grow-1 gap-2">
                                   {" "}
            <button
              className="btn btn-outline-light vote-btn-width"
              onClick={handlePromotion}
            >
              Promotion                        {" "}
            </button>
                                   {" "}
            <button
              className="btn btn-outline-light vote-btn-width"
              onClick={handleOngoingVotes}
            >
              Ongoing Votes                        {" "}
            </button>
                               {" "}
          </div>
                             {" "}
          <div className="d-flex align-items-center">
                                   {" "}
            <button
              className="btn btn-outline-light"
              onClick={() => navigate("/change-password")}
            >
                                          Change Password                      
               {" "}
            </button>
                                   {" "}
            <button className="btn btn-danger ms-2" onClick={handleLogout}>
                                          Logout                        {" "}
            </button>
                                   {" "}
            <button
              className="navbar-toggler ms-2"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
                                         {" "}
              <span className="navbar-toggler-icon"></span>                     
               {" "}
            </button>
                               {" "}
          </div>
                             {" "}
          <div
            className="offcanvas offcanvas-end offcanvas-glass"
            id="offcanvasNavbar"
            tabIndex="-1"
            aria-labelledby="offcanvasNavbarLabel"
            style={{ "--bs-offcanvas-width": "340px" }}
          >
                                   {" "}
            <div className="offcanvas-header">
                                         {" "}
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                Code Illuminators
              </h5>
                                         {" "}
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
                                     {" "}
            </div>
                                   {" "}
            <div className="offcanvas-body p-3">
                                         {" "}
              <ul className="nav flex-column gap-1 w-100 offcanvas-menu">
                                               {" "}
                <li className="nav-item">
                                                     {" "}
                  <button
                    className={`nav-link d-block ${selectedCreature === "bigfoot" ? "active" : ""}`}
                    onClick={() =>
                      !isSimpleUser && setSelectedCreature("bigfoot")
                    }
                    disabled={isSimpleUser}
                  >
                    Big Foot
                  </button>
                                                 {" "}
                </li>
                                               {" "}
                <li className="nav-item">
                                                     {" "}
                  <button
                    className={`nav-link d-block ${selectedCreature === "ufo" ? "active" : ""}`}
                    onClick={() => !isSimpleUser && setSelectedCreature("ufo")}
                    disabled={isSimpleUser}
                  >
                    UFO
                  </button>
                                                 {" "}
                </li>
                                               {" "}
                <li className="nav-item">
                                                     {" "}
                  <button
                    className={`nav-link d-block ${selectedCreature === "ghosts" ? "active" : ""}`}
                    onClick={() =>
                      !isSimpleUser && setSelectedCreature("ghosts")
                    }
                    disabled={isSimpleUser}
                  >
                    Ghost
                  </button>
                                                 {" "}
                </li>
                                               {" "}
                <li className="nav-item">
                                                     {" "}
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Other..."
                    value={customCreature}
                    onChange={(e) => {
                      if (!isSimpleUser) {
                        setSelectedCreature("other");
                        setCustomCreature(e.target.value);
                      }
                    }}
                    disabled={isSimpleUser}
                  />
                                                 {" "}
                </li>
                                               {" "}
                <li className="nav-item mt-2">
                                                     {" "}
                  <label htmlFor="locationMark" className="form-label">
                    Location
                  </label>
                                                     {" "}
                  <input
                    type="text"
                    id="locationMark"
                    className="form-control"
                    placeholder="Add a location..."
                    value={locationMark}
                    onChange={(e) => setLocationMark(e.target.value)}
                    disabled={isSimpleUser}
                  />
                                                 {" "}
                </li>
                                               {" "}
                <li className="nav-item mt-2">
                                                     {" "}
                  <label htmlFor="markerPhoto" className="form-label">
                    Photo (required)
                  </label>
                                                     {" "}
                  <input
                    type="file"
                    id="markerPhoto"
                    className="form-control"
                    onChange={(e) => setMarkerPhoto(e.target.files[0])}
                    disabled={isSimpleUser}
                  />
                                                 {" "}
                </li>
                                           {" "}
              </ul>
                                         {" "}
              <button
                className={`btn w-100 mt-3 ${isSimpleUser ? "btn-secondary" : "btn-primary"}`}
                onClick={handleSubmit}
                disabled={isSimpleUser}
              >
                                               {" "}
                {isSimpleUser ? "Unable to submit" : "Submit"}                 
                         {" "}
              </button>
                                         {" "}
              {blockMayday && (
                <button className="compromised-btn" onClick={handleMayday}>
                  WE ARE COMPROMISED
                </button>
              )}
                                     {" "}
            </div>
                               {" "}
          </div>
                         {" "}
        </div>
                   {" "}
      </nav>
                 {" "}
      <MapContainer center={[49.842957, 24.031111]} zoom={13}>
                       {" "}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
                        <MapClickHandler />                               {" "}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={[marker.lat, marker.lng]}
            icon={icons[marker.type] || icons.default}
          >
                                   {" "}
            <Popup>
                                         {" "}
              <div style={{ minWidth: "150px" }}>
                                               {" "}
                <strong>{marker.popUp || marker.location}</strong>             
                                 {" "}
                {marker.image_url && (
                  <img
                    src={`${API_BASE_URL}${marker.image_url}`}
                    alt="Creature sighting"
                    style={{
                      maxWidth: "100px",
                      display: "block",
                      margin: "5px 0",
                    }}
                  />
                )}
                                               {" "}
                <DeleteButton
                  marker={marker}
                  handleDelete={handleDeleteMarker}
                  isSimpleUser={isSimpleUser}
                />
                                           {" "}
              </div>
                                     {" "}
            </Popup>
                               {" "}
          </Marker>
        ))}
                                       {" "}
        {tempMarker && (
          <Marker
            position={tempMarker.position}
            icon={
              icons[
                selectedCreature === "other" ? "default" : selectedCreature
              ] || icons.default
            }
          >
                                    <Popup>{tempMarker.popUp}</Popup>           
                   {" "}
          </Marker>
        )}
                   {" "}
      </MapContainer>
             {" "}
    </>
  );
}
