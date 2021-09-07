import React from 'react'
import { BrowserRouter as Router, Switch, Route, } from "react-router-dom";
import Streamer from './components/stream/Streamer'
import Viewer from './components/stream/Viewer'
import Home from './components/Home'
import Header from './components/controls/Header'
import ResetPassword from './components/controls/ResetPassword'
import Footer from './components/controls/Footer'
import Page404 from './components/controls/Page404'
import StripeContainer from './components/payment/StripeContainer'
import PurchaseOptions from './components/payment/PurchaseOptions'
import VideoStorage from './components/videostorage/VideoStorage'
import Video from './components/videostorage/Video'
import ListUsers from './components/listusers/ListUsers'
import Profile from './components/profile/Profile'
import Analyze from './components/analysis/analyze'
import Donation from './components/donation/Donation'
import Toast from './components/controls/Toast'
import Loading from './components/controls/Loading'
import Sound from './components/controls/Sound'
import Particles from './components/controls/Particles'
import './App.css'
import './styling/list_video.css'
import 'react-toastify/dist/ReactToastify.css';
import "react-responsive-modal/styles.css";
import 'react-tabs/style/react-tabs.css';
import 'video.js/dist/video-js.css';

function App() {
  return (
    <Router>
      <Route path="/purchase_options" component={PurchaseOptions} />
      <Route path="/buy_tokens" component={StripeContainer} />
      <div style={{ display: 'flex', flexWrap: 'nowrap', width: '100%', height: '100%' }}>
        <Toast />
        <Loading />
        <Sound />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', }}>
          <Particles />
          <Header />
          <div style={{ zIndex: 1000, pointerEvents: 'none', }}>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/donation" component={Donation} />
              <Route path="/videos" component={VideoStorage} />
              <Route path="/members" component={ListUsers} />
              <Route path="/reset_password" component={ResetPassword} />
              <Route path="/streamer" component={Streamer} />
              <Route path="/profile/:nickname" component={Profile} />
              <Route path="/analysis/:nickname" component={Analyze} />
              <Route path="/video/*" component={Video} />
              <Route path="/user/*" component={Viewer} />
              <Route path="*" component={() => <Page404 text="Page Not Found" />} />
            </Switch>
          </div>
          <Footer />
        </div>
      </div>
    </Router>
  );
}
export default App;