import { useNavigate, Link } from "react-router-dom";

const Homepage = () => {
    const navigate = useNavigate();

    return ( 
        <>
        <div className="home">
<div className="header-wrapper">
           <div className="logo-section">
            <h1>Mkononi</h1>
            <p>Loan In Your Hands</p>
           </div>
           <nav >
            <ul>
                <li><a href="/">About Us</a></li>
                <li><a href="/page">How It Works</a></li>
                <li><a href="/faqs">FAQs</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><Link to="/login" style={{ border: '2px solid #0CECCD', padding: '5px', borderRadius: '5px' }}>Login</Link></li>
                <li><Link to="/create-account" style={{backgroundColor:' #0CECCD', borderRadius:'5px', padding:'7px'}}>Create Account</Link></li>
            </ul>
           </nav>
</div>
          <div className="content-wrapper">
            <div className="content">
            <h1>Welcome to Mkononi</h1>
            <h2 className="larger">Quick Loans, right in your hands.</h2>
            <p style={{ color: 'white' }}>Get access to simple, fast and transparent loans whenever you need them.</p>
            <button type="button" className="tap" onClick={() => navigate("/create-account")}>Get Started</button>                <button type="button" className="tap">Learn More</button>
            </div>
            <div className="side-pic">
                <img src="/side-pic.png" alt="phone-mimic" />
            </div>
            </div>
            <div className="reason">
                <div className="quick">
                    <h3>Quick Approval</h3>
                    <p>Get your loan processed within minutes.</p>
                </div>
                <div className="secure">
                    <h3>Secure and Safe</h3>
                    <p>Your Information is protected with top security.</p>
                </div>
                <div className="flex">
                    <h3>Flexible Repayment</h3>
                    <p>Repay based on your comfortable schedule.</p>
                </div>
            </div>
            <div className="how-it-works-section">
  <h2 className="section-heading">How Mkononi Works</h2>
  <div className="steps-container">
    <div className="step">
      <h3>1. Create Account</h3>
      <p>Sign up in minutes and verify your details.</p>
    </div>
    <div className="step">
      <h3>2. Apply For a Loan</h3>
      <p>Choose the amount and duration that suits you.</p>
    </div>
    <div className="step">
      <h3>3. Get Approved</h3>
      <p>We review and approve your loan quickly.</p>
    </div>
    <div className="step">
      <h3>4. Receive Your Money</h3>
      <p>Money is sent to your wallet or bank instantly.</p>
    </div>
  </div>
</div>
        </div>
        </>
     );
}
 
export default Homepage;
