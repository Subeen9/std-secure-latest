import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CreatePost from "./pages/CreateEditPost";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import Landing from "./pages/Landing";
import Posts from "./pages/Posts";
import ViewPost from "./pages/ViewPost";
import ViewLogs from "./pages/ViewLogs";
import "./auth/create-admin";
import "react-toastify/dist/ReactToastify.css";
import { collection, getDocs, updateDoc,doc} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import Admin from "./pages/AdminDashboard";
import SignUp from "./pages/SignUp";
import Team from "./pages/Team";
import DescriptionState from "./components/DescriptionState";
import PdfList from "./pages/PdfList";
import Logger from './pages/Logger';


function App() {
  const postId = sessionStorage.getItem("postId") ;
  // const aceessTimer = 1000*5; // 20 sec
  const navigate = useNavigate();
  const AUTO_LOGOUT_TIME = 60 * 30 * 1000; // 30 min
  const [isAuth, setIsAuth] = useState(() => {
    const storedAuth = localStorage.getItem("isAuth");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });
  const [isAdmin, setisAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const uid = localStorage.getItem("uid") || "";
  const [loading, setLoading] = useState(true); // Add loading state
  const [isCollapsed, setIsCollapsed] = useState(true);
  // const[active, setActive] = useState(false);
  // const postCollectionRef = collection(db, process.env.REACT_APP_ADMIN_DATABSE);
  // const postRef = doc(postCollectionRef, postId);

  
  // const updateIsActive =async ()=>{
    
  //   setActive(false);
  //   await updateDoc(postRef, {
      
  //     isActive: false
     
  //   });
  //   console.log("SUBIN ROCKSSSS")
  // }
  

  const Unauthorized = () => {
    toast.error("Unauthorized!!!", {
      position: toast.POSITION.TOP_CENTER,
    });
  };
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const Unverified = () => {
    setIsAuth(false);
    localStorage.clear();

    toast.error(
      "USER NOT APPROVED!!! Please contact with the admin to get the approval !!!",
      {
        position: toast.POSITION.TOP_CENTER,
        autoClose: false,
        theme: "colored",
      }
    );
  };

  const signUserOut = async () => {
    try {
      await Logger({ eventType: 'logout' }); //asyc because this call need to wait until the log is tracked
  
       signOut(auth);
  
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const userDocRef = collection(db, process.env.REACT_APP_ADMIN_USERS);
    const checkAdmin = async () => {
      const getUser = await getDocs(userDocRef);

      getUser.forEach((currentUser) => {
        if (currentUser.data().id === uid) {
          if (currentUser.data().isAdmin === true) {
            setisAdmin(true);
          }
        }
      });
    };

    const checkApproved = async () => {
      const getUser = await getDocs(userDocRef);
      getUser.forEach((currentUser) => {
        if (currentUser.data().id === uid) {
          if (currentUser.data().isApproved === true) {
            setIsApproved(true);
          } else {
            setIsApproved(false);
          }
        }
      });
    };

    const checkLoading = async () => {
      await Promise.all([checkAdmin(), checkApproved()]);
      setLoading(false);
    };
    checkLoading();
  }, [uid]);

  // useEffect(() => {
  //   let timer;
  //   const userSession = () => {
  //     timer = setTimeout(() => updateIsActive(), aceessTimer);
  //   };
  //   userSession(); 
  //   return () => {
  //     clearTimeout(timer); 
  //   };
  // }, [aceessTimer, updateIsActive]);
  
  // useEffect(() => {
  //   const worker = new Worker(URL.createObjectURL(new Blob([`
  //     self.onmessage = function(e) {
  //       setTimeout(function() {
  //         self.postMessage('Time is up!');
  //       }, e.data);
  //     }
  //   `], { type: 'text/javascript' })));

  //   worker.onmessage = function(e) {
  //     console.log(e.data); // 'Time is up!'
  //     updateIsActive(); // Call your function when the timer is up
  //   };

  //   worker.postMessage(aceessTimer); // Start the timer

  //   return () => {
  //     worker.terminate(); // Terminate the worker when the component unmounts
  //   };
  // }, [aceessTimer, updateIsActive]);

  useEffect(() => {
    let timer;
    const handleUserActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => signUserOut(), AUTO_LOGOUT_TIME);
    };
    document.addEventListener("mousemove", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);

    return () => {
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
    };
  }, [AUTO_LOGOUT_TIME]);

  if (loading) {
    return <div></div>; // Render loading state while checking admin status
  }

  {return (
    <>
   
      <nav className="navbar navbar-expand-md navbar-dark bg-dark">
        <div className="container-fluid">
          <div className="logo" style={{ position: "absolute", top: "1px" }}>
            <img
              src="/secure.png"
              alt="Secure Logo"
              height="50px"
              width="50px"
            />
          </div>
          <Link
            className="navbar-brand"
            to="/"
            style={{ marginLeft: "55px", color: "orange" }}
          >
            SECURE
          </Link>

          <button
            className="navbar-toggler"
            style={{ paddingBottom: "20px" }}
            type="button"
            onClick={handleToggle}
            aria-expanded={!isCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className={`bg-dark collapse navbar-collapse${
              isCollapsed ? "" : " show"
            }`}
            id="navbarNavAltMarkup"
          >
            <div onClick={handleToggle} className="bg-dark navbar-nav ms-auto">
              <Link to="/" className="nav-link" aria-current="page">
                Home
              </Link>
              <Link to='/team' className="nav-link" >
               Team
              </Link>
              <Link to='/pdfList' className="nav-link" >
               PdfList
              </Link>

              {isAuth ? (
                <>
                  {isApproved && (
                    <>
                      <Link to="/posts" className="nav-link">
                        Articles
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to="/createpost" className="nav-link">
                            Create Post
                          </Link>
                          <Link to="/admindashboard" className="nav-link">
                            Admin
                          </Link>
                        </>
                      )}
                    </>
                  )}
                  <Link
                    className="nav-link"
                    onClick={signUserOut}
                    style={{ cursor: "pointer" }}
                  >
                    Log Out
                  </Link>
                </>
              ) : (
                <Link to="/login" className="nav-link ">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="colored"
        hideProgressBar={true}
        closeOnClick={true}
      />
      {isAuth ? (
        <>
          {isApproved ? (
            <Routes>
              <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
              <Route path="/signup" element={<SignUp />} />

              <Route path="/" element={<Landing isAuth={isAuth} />} />
              <Route path="/team" element={<Team isAuth={isAuth}/>}/>
              <Route path = '/pdfList' element={<PdfList isAuth={isAuth}/>}/>
              <Route
                path="/posts"
                element={<Posts isAuth={isAuth} isAdmin={isAdmin} />}
              />
              <Route path="/view" element={<ViewPost />} />
              <Route path="/viewLogs" element={<ViewLogs />} />
              {isAdmin ? (
                <>
                  <Route
                    path="/createpost"
                    element={<CreatePost isAuth={isAuth} />}
                  />
                  <Route
                    path="/admindashboard"
                    element={<Admin isAuth={isAuth} />}
                  />
                </>
              ) : (
                <Route path="/createpost" element={<Unauthorized />} />
              )}
            </Routes>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Landing isAuth={isAuth} />
                    <Unverified />
                  </>
                }
              />
               <Route
                path="/team"
                element={
                  <>
                    <Team isAuth={isAuth} />
                    <Unverified />
                  </>
                }
              />
               <Route path = '/pdfList' element={<><PdfList isAuth={isAuth}/> <Unverified/> </>}/>
              <Route
                path="/posts"
                element={
                  <>
                    <Navigate to="/login" /> <Unverified />
                  </>
                }
              />
              <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
            </Routes>
          )}
        </>
      ) : (
        <Routes>
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={<Landing isAuth={isAuth} />} />
          <Route path="/team" element={<Team isAuth={isAuth} />} />
          <Route path='/pdfList' element={<PdfList isAuth={isAuth}/>}/>
          <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
        </Routes>
      )}
      <footer style={{textAlign:"center", backgroundColor:"black"}}>
  <p>Copyright © Std Secure 2023</p>
</footer>

    </>
  )
     };
}


export default App;
