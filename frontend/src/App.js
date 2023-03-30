import * as React from 'react';
import { useEffect, useState } from "react";
import {render} from 'react-dom';
import Map, {Marker, Popup} from 'react-map-gl';
import axios from 'axios'
import {Room, Star} from '@material-ui/icons';
import {format} from 'timeago.js'
import 'mapbox-gl/dist/mapbox-gl.css';
import './app.css'
import Register from './components/Register';
import Login from './components/Login'


const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFrczM1NDkiLCJhIjoiY2xmc3U2bXU4MDl2ejNqb2JzeTFpazV5aiJ9.hK8UcLIKZyNtJlpBj_V06g'; // Set your mapbox token here



function App() {
  const myStorage = window.localStorage

  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"))
  const [pins, setPins] = useState([]);
  const [currentPlaceId,setCurrentPlaceId] = useState(null)
  const [newPlace,setNewPlace] = useState(null)

  const [title,setTitle] = useState(null)
  const [desc,setDesc] = useState(null)
  const [rating,setRating] = useState(0)

  const [showRegister,setShowRegister] = useState(false)
  const [showLogin,setShowLogin] = useState(false)

  
  const [viewport, setViewport] = useState({
    latitude: 47.040182,
    longitude: 17.071727,
    zoom: 4,
  });

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("http://localhost:8800/api/pins")
        
        setPins(res.data)
        
      }catch (err) {
        console.log(err)
      }
    };
    getPins();
  }, [])

  const handleMarkerClick = (id,lat,long) => {
    setCurrentPlaceId(id)
    setViewport({...viewport, latitude:lat, longitude:long})
  }

  const handleAddClick = (e) => {
    const [lng, lat] = e.lngLat.toArray()
    setNewPlace ({
      lat:lat,
      lng:lng,
    })
  }

  const handleSubmit = async (e) =>{
    e.preventDefault()
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat:newPlace.lat,
      long:newPlace.lng
    }

    try{
      const res = await axios.post("http://localhost:8800/api/pins", newPin)
      setPins([...pins, res.data])
      setNewPlace(null)
    }
    catch(err){
      console.log(err)
    }
  }

  const handleLogout = () => {
    myStorage.removeItem("user")
    setCurrentUser(null)
  }

  const [showPopup, setShowPopup] = React.useState(true);
  return (
    <div className='App'>
      <Map
        initialViewState={{...viewport}}
        style={{width: "100vw", height: "100vh"}}
        mapStyle="mapbox://styles/safak/cknndpyfq268f17p53nmpwira"
        mapboxAccessToken={MAPBOX_TOKEN}
        onViewportChange={(viewport) => setViewport(viewport)}
        onDblClick = {handleAddClick}
        transitionDuration = "200"
      >

        {pins.map(p => (
  <>
        
        <Marker
            latitude={p.lat}
            longitude={p.long}
            
            offsetLeft={-viewport.zoom * 5}
            offsetTop={-viewport.zoom * 10}
            anchor="bottom"
            >
        <Room style={{fontSize: (10 * viewport.zoom), color: p.username === currentUser ? "tomato" : "slateblue", cursor: "pointer"}}
        onClick = {() => handleMarkerClick(p._id, p.lat, p.long)}
        />
        </Marker>

        {p._id === currentPlaceId &&

          <Popup
                  latitude={p.lat}
                  longitude={p.long}
                  closeButton={true}
                  closeOnClick={false}
                  onClose={() => setCurrentPlaceId(null)}
                  anchor="left"
          >
                    <div className='card'>
                      <label>Place</label>
                      <h4 className='place'>{p.title}</h4>
                      <label>Review</label>
                      <p className='desc'>{p.desc}</p>
                      <label>Rating</label>
                      <div className='stars'>
                        {Array(p.rating).fill(<Star className='star'></Star>)}
                      </div>
                      
                      <label>Information</label>
                      <span className='username'>Created by <b>{p.username}</b> </span>
                      <span className='date'>{format(p.createdAt)}</span>
                    </div>
          </Popup>
        }
        
        </>
        ))}
        {newPlace && (
        <Popup
                  latitude={newPlace.lat}
                  longitude={newPlace.lng}
                  closeButton={true}
                  closeOnClick={false}
                  onClose={() => setNewPlace(null)}
                  anchor="left"
          >
            <div>
              <form onSubmit ={handleSubmit}>
                <label>Title</label>
                <input placeholder='Enter a title' onChange={(e) => setTitle(e.target.value)}/>
                <label>Review</label>
                <textarea placeholder='Share your opinion about this place' onChange={(e) => setDesc(e.target.value)}/>
                <label>Rating</label>
                <select onChange={(e) => setRating(e.target.value)}>
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                  <option value='5'>5</option>
                </select>
                <button className='submitButton' type='submit'>Add Pin</button>
              </form>
            </div>
        </Popup>
        )}
        {currentUser ? (
        <button className='button logout' onClick={handleLogout}>LogOut</button>
        ) : (
          <div className='buttons'>
            <button className='button login' onClick={() => setShowLogin(true)}>LogIn</button>
            <button className='button register' onClick={() => setShowRegister(true)}>Register</button>
          </div>
        )}

        {showRegister && <Register setShowRegister = {setShowRegister}/>}
        {showLogin && <Login setShowLogin = {setShowLogin} myStorage = {myStorage} setCurrentUser = {setCurrentUser}/>}
      </Map>
    </div>
    );
  
}
export default App