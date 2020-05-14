const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Profile extends React.Component {
  render() {

    return (
      <div className="mainContainer">
        <Container padding={['bottom', 'top']}>
          <form id="signupForm" action="/updatePass" method="post">
            <div>
              <label>Email</label><br/>
              <input type="text" name="email" value="<%= user.email %>" disabled="" /><br/>
            </div>  
            <div>
              <label for="password">Change Password</label><br/>
              <input type="password" id="password" name="password" min="6" required />
            </div>
            <div>
              <label for="confirmPassword">Confirm Password</label><br/>
              <input type="password" id="confirmPassword" name="confirm_password" min="6" required />
            </div>
            <div>
              <input type="submit" value="Submit"/>
            </div>
          </form>
          <div>
            <a href="/logout">Log out</a>
          </div>
        </Container>
        <script type="text/javascript" src="/scripts/signup.js"></script>
      </div>
    );
  }
}

module.exports = Profile;
