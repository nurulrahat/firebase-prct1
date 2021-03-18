import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);

function App() {
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    password: '',
    error: '',
    success: false
  });
  const [newUser, setNewUser] = useState(false);

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        const { displayName, email, photoURL } = result.user
        console.log(displayName, email, photoURL);
        const userInfo = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(userInfo);
      })
      .catch(err => {
        console.log(err)
        console.log(err.message)
      })
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signOutInfo = {
          name: '',
          email: '',
          displayName: '',
          photo: '',
        }
        setUser(signOutInfo)
      })
      .catch(err => {
        console.log(err)
        console.log(err.message)
      })
  }
  //handle fb sign in
  const handleSignInFb = () => {
    firebase.auth().signInWithPopup(fbProvider).then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;
        console.log('here is the user info',result);
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }
  //validation section
  const handleOnchange = (event) => {
    console.log(event.target.name, event.target.value)
    let isFormValid = true;
    if (event.target.name === 'email') {
      isFormValid = /\S+@\S+\.\S+/.test(event.target.value)
      console.log(isFormValid)
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const isPasswordNumber = /\d{1}/.test(event.target.value)
      isFormValid = isPasswordValid && isPasswordNumber
    }
    if (isFormValid) {
      const newUserInfo = { ...user }
      newUserInfo[event.target.name] = event.target.value; //why here[ ] the bracket used
      setUser(newUserInfo);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(user.email, user.password)
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(userCredential => {
          // console.log(userCredential)
          // Signed in 
          //var user = userCredential.user;
          const newUserInfo = { ...user }
          newUserInfo.success = true;
          newUserInfo.error = '';
          setUser(newUserInfo);
          addUserName(user.name)
        })

        .catch((error) => {
          var errorMessage = error.message;
          console.log(errorMessage)
          const newUserInfo = { ...user };
          newUserInfo.error = errorMessage;
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    if (!newUser && user.email && user.password) {

      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.success = true;
          newUserInfo.error = '';
          setUser(newUserInfo);
          console.log('sign in user info', res.user)
        })
        .catch((error) => {
          var errorMessage = error.message;
          // console.log(errorMessage)
          const newUserInfo = { ...user };
          newUserInfo.error = errorMessage;
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }

  }
  const addUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
      // photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function () {
      console.log("user name added who is: ")
      // Update successful.
    }).catch(function (error) {
      // An error happened.
      console.log(error);
    });
  }
  
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign in</button>

      }
      <br />
      <button onClick={handleSignInFb}>SignIn with FB</button>
      {
        user.isSignedIn && <div>
          <p>Welcome!  {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }
      <h1>This is Authentication</h1>
      {/* <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p> */}
      <form action="" onSubmit={handleSubmit}>
        <input type="checkbox" name="newUser" onChange={() => setNewUser(!newUser)} id="" />
        <label htmlFor="newUser">Create New User Account
      </label><br />
        {
          newUser && <input type="text" name="name" id="" onBlur={handleOnchange} placeholder="Type Name" />
        }
        <br />
        <input type="text" name="email" id="" required onBlur={handleOnchange} placeholder="Type Email" />
        <br />
        <input type="password" name="password" id="" required onBlur={handleOnchange} placeholder="Type Password" />
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
      </form>
      {
        user.success ? <p style={{ color: "green" }}>Your have been {newUser ? 'Created your account' : 'signed in'} successfully </p> : <p style={{ color: "red" }}>{user.error}</p>
      }

    </div>
  );
}

export default App;
