import React from 'react';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const META_TEXT = 0xff;

import Button from '../generic/Button';

class State extends React.Component {
  state = {
    isStatePristine: this.props.isStatePristine,
    isUpdateInputDisplayed: false,
    hasToRenderNewStateInput: false,
    updateStateName: this.props.strip.states[this.props.index].name
  };

  componentDidUpdate = oldProps => {
    if (oldProps.isStatePristine != this.props.isStatePristine) {
      this.setState({
        isStatePristine: this.props.isStatePristine,
        hasToRenderNewStateInput: false
      });
    }

    if (oldProps.active_state.name != this.props.active_state.name) {
      this.setState({
        isUpdateInputDisplayed: false,
        hasToRenderNewStateInput: false
      });
    }
  };

  render() {
    const isActiveState = this.props.active_state.name == this.props.state.name;
    const isReverseButtonGroupClass = isActiveState
      ? 'button-group--reverse'
      : '';

    return (
      <div className={'button-group ' + isReverseButtonGroupClass}>
        {this.state.isUpdateInputDisplayed === this.props.index ? (
          <input
            name="modify-state"
            // style={{ width: this.state.updateStateName.length + 'ch' }}
            value={this.state.updateStateName}
            placeholder={'modify state name'}
            onChange={e => {
              this.setState({
                isStatePristine: false,
                updateStateName: e.target.value
              });
            }}
            type="text"
          ></input>
        ) : (
          <Button
            className={'button--large button--has-type'}
            onClick={() => {
              this.props.sendNote(26, this.props.index);
            }}
          >
            <>
              <span className="button__type">
                {'D0 - ' + (this.props.index + 1)}
              </span>
              {this.props.state.name}
            </>
          </Button>
        )}
        {isActiveState ? (
          <>
            <Button
              className="button--square"
              onClick={e => {
                console.log('updating ->' + this.props.state.name);
                this.setState({
                  isUpdateInputDisplayed:
                    this.state.isUpdateInputDisplayed !== this.props.index
                      ? this.props.index
                      : -1
                });
              }}
            >
              <i className="la la-2x la-pencil" />
            </Button>
            <Button
              className="button--square"
              disabled={this.state.isStatePristine ? true : false}
              onClick={() => {
                console.log('updating ->' + this.state.updateStateName);
                this.setState({
                  isStatePristine: true,
                  isUpdateInputDisplayed: false
                });
                this.props.sendText(
                  'updatestate : ' + this.state.updateStateName
                );
              }}
            >
              <i className="la la-2x la-save" />
            </Button>
            <Button
              className="button--square"
              disabled={this.props.strip.states.length > 1 ? false : true}
              onClick={() => {
                console.log('deleting -> ' + this.props.state.name);

                this.props.sendText('deletestate : ' + this.props.state.name);
              }}
            >
              <i className="la la-2x la-trash" />
            </Button>
          </>
        ) : null}
      </div>
    );
  }
}

class StateController extends React.Component {
  constructor(props) {
    super(props);
    let that = this;

    this.state = {
      hasToRenderNewStateInput: false,
      newStateName: ''
    };
  }

  // componentWillUpdate(oldProps) {
  //   if (oldProps.isPristine != this.props.isPristine) {
  //     this.setState({
  //       isUpdateInputDisplayed: -1
  //     });
  //   }
  // }

  isAlreadyTakenStateName(name) {
    let response = false;
    this.props.strip.states.map(elem => {
      if (name == elem.name) {
        response = true;
      }
    });
    return response;
  }

  render() {
    return (
      <div className="state-controller">
        <label className="state-controller__title">States</label>
        <div className="state-controller__states">
          {this.props.strip.states.map((state, index) => {
            return (
              <State
                key={state + index}
                sendText={this.props.sendText}
                sendNote={this.props.sendNote}
                state={state}
                index={index}
                strip={this.props.strip}
                active_state={this.props.active_state}
                isStatePristine={this.props.isStatePristine}
              />
            );
          })}
          <div className="button-group">
            <Button
              className="button--square"
              onClick={() => {
                this.setState({
                  hasToRenderNewStateInput: !this.state
                    .hasToRenderNewStateInput,
                  newStateName: ''
                });
              }}
            >
              {this.state.hasToRenderNewStateInput ? (
                <i className="la la-minus la-2x" />
              ) : (
                <i className="la la-plus la-2x" />
              )}
            </Button>
            {this.state.hasToRenderNewStateInput ? (
              <>
                <input
                  name="new-state"
                  value={this.state.newStateName}
                  placeholder={'new state name'}
                  onChange={e => {
                    this.setState({
                      newStateName: e.target.value
                    });
                  }}
                  type="text"
                ></input>
                <Button
                  className="button--square"
                  disabled={
                    this.state.newStateName.length < 3 ||
                    this.isAlreadyTakenStateName(this.state.newStateName)
                      ? true
                      : false
                  }
                  onClick={() => {
                    console.log('adding ->' + this.props.name);
                    this.props.sendText(
                      'newstate : ' + this.state.newStateName
                    );
                    this.setState({
                      newStateName: '',
                      hasToRenderNewStateInput: false
                    });
                  }}
                >
                  Add
                </Button>
              </>
            ) : null}
          </div>
          {this.isAlreadyTakenStateName(this.state.newStateName)
            ? 'Already taken name'
            : null}
        </div>
      </div>
    );
  }
}

export default StateController;
