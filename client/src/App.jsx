

import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import Home from './components/Home'
import Layout from './components/Layout'
import About from './components/About'
import UserProfile from './components/UserProfile'
import LostAndFound from './components/LostAndFound'
import Chat from './components/Chat'
import FindFriends from './components/FindFriends'
import Chatroom from './components/page'
import NotFound from './components/NotFound'

function App() {
 
  return (
    <>
    <Routes>
    <Route index element={<LoginPage/>}/>
    <Route path='/signup' element={<SignupPage/>}/>
    
        <Route path='/home' element={<Layout/>}>
          <Route index element={<Home />} />
          <Route path="userprofile" element={<UserProfile />} />
          <Route path="lostandfound" element={<LostAndFound />} />
          <Route path="chat" element={<Chat />} />
          <Route path="findfriends" element={<FindFriends />} />
          <Route path="chatrooms" element={<Chatroom />} />
        </Route>

    <Route path="*" element={<NotFound />} />
    </Routes>
    </> 
  )
}

export default App
