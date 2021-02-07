import React from 'react';

import logoSrc from './../assets/img/logo.svg';

class SplashScreen extends React.Component {
  constructor(props) {
    super(props);

    const sentences = [
      'Checking configuration file...',
      'Instanciating processes...',
      'Launching app...'
    ];

    this.state = {
      current_step: 0,
      total_steps: sentences.length,
      sentences: sentences
    };
  }

  componentDidMount() {
    this.intervalId = setInterval(
      () => this.setState({ current_step: this.state.current_step + 1 }),
      1500
    );
  }

  render() {
    let is_finished = this.state.total_steps == this.state.current_step;

    if (is_finished) {
      clearInterval(this.intervalId);
    }

    let classes = is_finished ? 'splash-screen--invisible' : 'splash-screen';

    return (
      <div id="splashscreen" className={classes}>
        <div>
          <img className="splash-screen__logo" src={logoSrc} />
          <p>{this.state.sentences[this.state.current_step]}</p>
          <span>1.0.0-alpha</span>
        </div>
      </div>
    );
  }
}

export default SplashScreen;
