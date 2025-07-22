import { Route,Routes } from 'react-router-dom'

import './App.css'
import banner from './components/Banner'
import Home from './components/Home'
import SignIn from './components/SignIn'
import Signup from './components/Signup'
import Dashboard from './components/TripsDashborad'
import CreateTrip from './components/CreateTrip'


function App() {
  

  return (
    <>
    {/* <Head /> */}
     <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/signin" element={<SignIn />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/create-trip" element={<CreateTrip />}></Route>
      </Routes>
    </>
  )
}

export default App
