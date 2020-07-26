import React from 'react';

class Button extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rippleElements: [],
      isLoading: false,
      hasToRipple: false
    };
  }

  clicked = e => {
    if (this.state.hasToRipple) {
      const X = e.pageX - e.target.getBoundingClientRect().left;
      const Y = e.pageY - e.target.getBoundingClientRect().top;
      const ripplee = [<div style={{ top: Y, left: X }} className="ripple" />];
      this.setState(prevState => ({
        rippleElements: prevState.rippleElements.concat([ripplee])
      }));
    }
  };

  handleClick = e => {
    if (!this.props.disabled) {
      this.props.onClick(e);
      this.clicked(e);
    }
  };

  render(props) {
    let buttonClassName = 'button ' + this.props.className + ' ';
    buttonClassName += this.props.disabled ? 'button--disabled' : '';
    return (
      <button
        {...this.props}
        title={this.props.alt || ''}
        className={buttonClassName}
        disabled={this.props.disabled}
        type={this.props.type}
        onClick={e => {
          this.handleClick(e);
        }}
      >
        <span className="button__content">
          {this.props.children}
          {this.state.rippleElements}
        </span>
        <span className="button__loading"></span>
      </button>
    );
  }
}

export default Button;
