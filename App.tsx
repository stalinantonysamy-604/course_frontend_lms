import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Components/Login/Login'
import LoginForm from './Components/Login/Pages/LoginForm';
import ForgotPassword from './Components/Login/Pages/ForgotPassword';
import CheckYourEmail from './Components/Login/Pages/CheckYourEmail';
import CreateNewPassword from './Components/Login/Pages/CreateNewPassword';
import ProjectCreation from './Components/Project-Creation/ProjectCreation';
import CreateProject from './Components/Project-Creation/Pages/CreateProject';
import ProjectCardView from './Components/Project-Creation/Pages/ProjectCardView';
import CourseCreation from './Components/Course-Creation/CourseCreation';
import CourseCardView from './Components/Course-Creation/CourseCardView';
import CourseSelection from './Components/Course-Creation/CourseSelection';
import { Step1 as UMGCStep1 } from './Components/Course-Creation/UMGC/Step_1';
import { Step2 as UMGCStep2 } from './Components/Course-Creation/UMGC/Step_2';
import { Step3 as UMGCStep3 } from './Components/Course-Creation/UMGC/Step_3';
import { Step1 as AssemblyStep1 } from './Components/Course-Creation/Assembly/Step_1';
import { Step2 as AssemblyStep2 } from './Components/Course-Creation/Assembly/Step_2';
import { Step5 as AssemblyStep5 } from './Components/Course-Creation/Assembly/Step_5';
import Editor from './Components/Course-Creation/Editor';
import './App.scss'
import RolesAndPermissions from './Components/Project-Creation/Pages/RolesAndPermissions';
import TeamAndRoles from './Components/Project-Creation/Pages/TeamAndRoles';
import Team from './Components/Project-Creation/Pages/Team';
import AllTeamMembersPage from './Components/Project-Creation/Pages/AllTeamMembersPage';
import Invite from './Components/Project-Creation/Pages/Invite';
import WorkFlow from './Components/Project-Creation/Pages/WorkFlow';
// import AddTeamMembers from './Components/Project-Creation/Pages/AddTeamMembers';
import CourseTeamMembers from './Components/Course-Creation/CourseTeamMembers';
import OfflinePage from './Components/Error-Pages/OfflinePage';
import AccessDenied from './Components/Error-Pages/Access-Denied';
import PageNotFound from './Components/Error-Pages/Page-Not-Found';
import BadGateWay from './Components/Error-Pages/Bad-Gateway';
import ServiceUnavailable from './Components/Error-Pages/Service-Unavailable';
import PmDashboard from './Components/Dashboard/PmDashboard';
import AuthorDashboard from './Components/Dashboard/AuthorDashboard';
// import ReviewerEmptyDashboard from './Components/Dashboard/ReviewerEmptyDashboard';
import ReviewerDashboard from './Components/Dashboard/ReviewerDashboard';
import SelectRole from './Components/Project-Creation/SelectRole';
import UserProfile from './Components/Project-Creation/UserProfile';
import AddTeamMembers from './Components/Project-Creation/Pages/AddTeamMembers';
import ProjectSetting from './Components/Project-Creation/Pages/ProjectSettings/ProjectSettings';
import CourseSettings from './Components/Course-Creation/CourseSettings';
import WorkFlowList from './Components/Project-Creation/Pages/WorkFlowList';
import CourseContentProgress from './Components/Course-Creation/CourseContentProgress';
import UserDetails from './Components/Project-Creation/Pages/UserDetails';
import EditUserDetails from './Components/Project-Creation/Pages/EditUserDetails';
function App() {

  const RedirectToLogin = () => {
    const location = useLocation();
    return <Navigate to={`/login${location.search}`} replace />;
  };

  return (
    <Router>
      <Routes>
        <Route index element={<RedirectToLogin />} />
        {/* <Route index element={<Navigate to="/login" />} /> */}
        <Route path="/login" element={<Login />} >
          <Route element={<Navigate to="LoginForm" />} />
          <Route path="LoginForm" element={<LoginForm />} />
          <Route path="ForgotPassword" element={<ForgotPassword />} />
          <Route path="CheckYourEmail" element={<CheckYourEmail />} />
          <Route path="CreateNewPassword" element={<CreateNewPassword />} />
        </Route>
        <Route path="/SelectRole" element={<SelectRole />} />
        <Route path="/project-creation" element={<ProjectCreation />}>
          <Route index element={<Navigate to="ProjectCards" />} />
          <Route path="ProjectCards" element={<ProjectCardView />} />
          <Route path="CreateProject" element={<CreateProject />} />
          <Route path="user-profile" element={<UserProfile />} />
          //#region stailn
          <Route path="AddTeamMembers" element={<AddTeamMembers />} />
          <Route path="RolesAndPermissions" element={<RolesAndPermissions />} />
          <Route path="TeamAndRoles" element={<TeamAndRoles />} />
          <Route path="Team" element={<Team />} />
          <Route path="AllTeamMembers" element={<AllTeamMembersPage />} />
          <Route path="Invite" element={<Invite />} />
          <Route path="Workflow" element={<WorkFlow />} />
          <Route path="WorkflowList" element={<WorkFlowList />} />
          <Route path="UserDetails/:userInviteId" element={<UserDetails />} />
          <Route path="EditUserDetails" element={<EditUserDetails />} />
          <Route path="ReviewerDashboard" element={<ReviewerDashboard />} />
          <Route path="PmDashboard" element={<PmDashboard />} />
          <Route path="AuthorDashboard" element={<AuthorDashboard />} />
          //#endregion
          <Route path="ProjectSettings" element={<ProjectSetting />} />
        </Route>

        <Route path="/course-creation" element={<CourseCreation />} >
          <Route path="CourseCards" element={<CourseCardView />} />
          <Route path="CourseSettings" element={<CourseSettings />} />
          <Route path="CourseSelection" element={<CourseSelection />} />
          <Route path="CourseTeamMembers" element={<CourseTeamMembers />} />
          <Route path="CourseContentProgress" element={<CourseContentProgress />}/>
          <Route path="UMGC/Step-1" element={<UMGCStep1 />} />
          <Route path="UMGC/Step-2" element={<UMGCStep2 />} />
          <Route path="UMGC/Step-3" element={<UMGCStep3 />} />
          <Route path="Assembly/Step-1" element={<AssemblyStep1 />} />
          <Route path="Assembly/Step-2" element={<AssemblyStep2 />} />
          <Route path="Assembly/Step-5" element={<AssemblyStep5 />} />
          <Route path="Editor" element={<Editor />} />
        </Route>

        <Route path="/error-pages/offlinepage" element={<OfflinePage />} />
        <Route path="/error-pages/accessdenied" element={<AccessDenied />} />
        <Route path="/error-pages/pagenotfound" element={<PageNotFound />} />
        <Route path="/error-pages/badgateway" element={<BadGateWay />} />
        <Route path="/error-pages/serviceunavailable" element={<ServiceUnavailable />} />
      </Routes>
    </Router>
  )
}

export default App
