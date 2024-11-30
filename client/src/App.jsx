

import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'

function App() {
 

  return (
    <>
    <Routes>
    <Route path='/login' element={<LoginPage/>}/>
    <Route path='/signup' element={<SignupPage/>}/>
    </Routes>
    </>
  )
}

export default App
