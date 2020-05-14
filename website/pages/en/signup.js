const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Signup extends React.Component {
  render() {

    return (
      <div className="mainContainer">
        <Container padding={['bottom', 'top']}>
          <form id="signupForm" action="/signup" method="post">
            <div>
              <label>Invite Code</label><br/>
              <input type="text" name="invite" required /><br/>
            </div>
            <div>
              <label>Email</label><br/>
              <input type="email" name="email" required /><br/>
            </div>
            <div>
              <label for="password">Password</label><br/>
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
        </Container>
        <script type="text/javascript" src="/scripts/signup.js"></script>
      </div>
    );
  }
}

module.exports = Signup;
