import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthForm from "./pages/AuthForm";
import RoleSelection from "./pages/Role";
import OrganizationRegistration from "./pages/OrganizationRegistration";

// Social Impact Dashboards
import AdminDashboard from "./pages/admin/SocialImpactAdminDashboard";
import ManageImpactStories from "./pages/admin/ManageImpactStories";
import HelperDashboard from "./pages/helper/HelperDashboard";
import DonorDashboard from "./pages/donor/DonorDashboard";
import ReceiverDashboard from "./pages/receiver/ReceiverDashboard";
import OrganizationDashboard from "./pages/organization/SocialImpactOrgDashboard";

// Public Pages (No Auth Required)
import Transparency from "./pages/public/Transparency";
import ImpactPage from "./pages/public/ImpactPage";
import AnonymousDonation from "./pages/public/AnonymousDonation";
import ImpactStories from "./pages/public/ImpactStories";
import Chatbot from './components/Chatbot';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  return (
    <Router>
      <Chatbot />
      <VoiceAssistant />
      <Routes>
        {/* ========== PUBLIC ROUTES (No Login Required) ========== */}
        <Route path="/" element={<Landing />} />
        <Route path="/transparency" element={<Transparency />} />
  <Route path="/impact-stories" element={<ImpactStories />} />
        <Route path="/impact/:qrCode" element={<ImpactPage />} />
        <Route path="/donate-anonymous" element={<AnonymousDonation />} />

        {/* ========== AUTHENTICATION ========== */}
        <Route path="/Role" element={<RoleSelection />} />
        <Route path="/AuthForm" element={<AuthForm />} />
        <Route path="/admin-login" element={<AuthForm />} />
        <Route path="/organization-login" element={<AuthForm />} />
        <Route path="/student-login" element={<AuthForm />} />
        <Route path="/organization-register" element={<OrganizationRegistration />} />

        {/* ========== PROTECTED DASHBOARDS (Auth Required) ========== */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/Admin_Dashboard" element={<AdminDashboard />} />
  <Route path="/admin/impact-stories" element={<ManageImpactStories />} />
        
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/Donor_Dashboard" element={<DonorDashboard />} />
        
        <Route path="/helper" element={<HelperDashboard />} />
        
        <Route path="/receiver" element={<ReceiverDashboard />} />
        
        <Route path="/organization" element={<OrganizationDashboard />} />
        <Route path="/Organization_Dashboard" element={<OrganizationDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Landing from "./pages/Landing";
// import AuthForm from "./pages/AuthForm";
// import RoleSelection from "./pages/Role"; // Import the new RoleSelection page

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Landing page as default */}
//         <Route path="/" element={<Landing />} />

//         {/* Role selection page */}
//         <Route path="/role" element={<RoleSelection />} />

//         {/* Auth page for login/register */}
//         <Route path="/AuthForm" element={<AuthForm />} />

//         <Route path="/Student_Dashboard" element={<AuthForm />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

// // App.jsx
// // App.jsx
// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import RoleSelection from "./pages/Role";
// import AuthForm from "./pages/AuthForm";
// import Landing from "./pages/Landing";

// function App() {
//   const [selectedRole, setSelectedRole] = useState(null);

//   const handleRoleSelect = (role) => {
//     setSelectedRole(role);
//     console.log("Selected role:", role);
//   };

//   const handleBackToHome = () => {
//     setSelectedRole(null);
//   };

//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           {/* Landing page as default */}
//           <Route path="/" element={<Landing />} />
          
//           {/* Role selection page */}
//           <Route 
//             path="/Role" 
//             element={
//               <RoleSelection 
//                 onRoleSelect={handleRoleSelect} 
//                 onBack={handleBackToHome} 
//               />
//             } 
//           />
          
//           {/* Auth page - redirect to role selection if no role is selected */}
//           <Route 
//             path="/AuthForm" 
//             element={
//               selectedRole ? (
//                 <AuthForm selectedRole={selectedRole} />
//               ) : (
//                 <Navigate to="/Role" replace />
//               )
//             } 
//           />
          
//           {/* Redirect any unknown routes to landing page */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AuthForm from "./pages/AuthForm";
// import Student_Dashboard from "./pages/Student_Dashboard";
// // import FacultyDashboard from "./pages/FacultyDashboard";
// // import AdminDashboard from "./pages/AdminDashboard";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Auth Page */}
//         <Route path="/" element={<AuthForm />} />

//         {/* Dashboards */}
//         <Route path="/Student_Dashboard" element={<Student_Dashboard />} />
//         <Route path="/faculty" element={<FacultyDashboard />} />
//         <Route path="/admin" element={<AdminDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

//Testing Student_Dashboard
// import React from "react";

// export default function StudentDashboard() {
//   return <h1>✅ Student Dashboard is Working</h1>;
// }


