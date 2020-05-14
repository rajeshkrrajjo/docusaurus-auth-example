const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Login extends React.Component {
  render() {

    return (
      <div className="mainContainer">
        <Container padding={['bottom', 'top']}>
          <form action="/login" method="post">
            <div>
              <label>Email</label><br/>
              <input type="text" name="username"/><br/>
            </div>
            <div>
              <label>Password</label><br/>
              <input type="password" name="password"/><br/>
            </div>
            <div>
              <input type="submit" value="Submit"/>
            </div>
          </form>
        </Container>
      </div>
    );
  }
}

module.exports = Login;
