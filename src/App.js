import { useEffect, useState, useCallback } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Alert from "./components/Alert";

function App() {
  const [jwtToken, setJwtToken] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertClassName, setAlertClassName] = useState("d-none");

  const [tickInterval, setTickInterval] = useState();

  const navigate = useNavigate();

  const toggleRefresh = useCallback((status) => {
    console.log("clicked");
    if(status) {
      console.log("ticking on")
      let i = setInterval(() => {
        const requestOptions = {
          method: "GET",
          credentials: "include",
        }
        fetch(`/refresh`, requestOptions)
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            setJwtToken(data.access_token)
        
          }
        })
        .catch(err => {
          console.log("user is not logged in")
        })
      }, 600000)
      setTickInterval(i)
      console.log("setting tick interval to ", i)
    } else {
      console.log("turning off ticking")
      setTickInterval(null)
      clearInterval(tickInterval)
    }
  }, [tickInterval])


  const logout = () => {
    const reqOpts = {
      method: "GET",
      credentials: "include"
    }
    fetch(`/logout`, reqOpts)
    .catch(err => {
      console.log("error logging out ", err)
    })
    .finally(() => {
      setJwtToken("");
      toggleRefresh(false)
    })
    
    navigate("/login");
  }

  useEffect(() => {
    if(jwtToken === "") {
      const requestOptions = {
        method: "GET",
        credentials: "include",
      }
      fetch(`/refresh`, requestOptions)
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            setJwtToken(data.access_token)
            toggleRefresh(true)
          }
        })
        .catch(err => {
          console.log("user is not logged in", err)
        })
    }
  }, [jwtToken, toggleRefresh])

  
  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1 className="mt-3">Go Watch a Movie!</h1>
        </div>
        <div className="col text-end">
          {jwtToken === ""
           ? <Link to="/login"><span className="badge bg-success">Login</span></Link>
           : <a href="#!" onClick={logout}><span className="badge bg-danger">Logout</span></a>
          }
        </div>
        <hr className="mb-3"></hr>
      </div>
      
      <div className="row">
        <div className="col-md-2">
          <nav>
            <div className="list-group">
              <Link to="/" className="list-group-item list-group-item-action">Home</Link>
              <Link to="/movies" className="list-group-item list-group-item-action">Movies</Link>
              <Link to="/genres" className="list-group-item list-group-item-action">Genres</Link>
              {jwtToken!=="" &&
                <>
                  <Link to="/admin/movie/0" className="list-group-item list-group-item-action">Add Movie</Link>
                  <Link to="/manage-catalogue" className="list-group-item list-group-item-action">Manage Catalog</Link>
                  <Link to="/graphql" className="list-group-item list-group-item-action">GraphQL</Link>
                </>
              }
            </div>
          </nav>
        </div>
        <div className="col-md-10">
          <Alert
            message={alertMessage}
            className={alertClassName}
          />
          <Outlet context={{
            jwtToken, setJwtToken, setAlertClassName, setAlertMessage, toggleRefresh
          }} />
        </div>
      </div>
    </div>
  );
}

export default App;
