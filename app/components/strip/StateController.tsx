import React from 'react';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const META_TEXT = 0xff;

import Button from '../generic/Button';

class StateController extends React.Component {
  constructor(props) {
    super(props);
    let that = this;

    this.state = {
      hasToRenderNewStateInput: false,
      newStateName: ''
    };
  }

  isAlreadyTakenStateName(name) {
    let response = false;
    this.props.config.states.map(elem => {
      if (name == elem.name) {
        response = true;
      }
    });
    return response;
  }

  render() {
    return (
      <div className="state-controller">
        {/* <Select
              options={this.props.config.states.map((state, index) => {
                return {
                  name: state.name,
                  prefix: 'D#0 - ' + index + ' - '
                };
              })}
              className={'big'}
              defaultValue={this.props.active_state.name}
              setValue={value => {
                let stateIndex = -1;
                this.props.config.states.map((elem, index) => {
                  if (elem.name === value) {
                    stateIndex = index;
                  }
                });

                this.sendNote(26, stateIndex);
              }}
            /> */}
        <label className="state-controller__title">
          States
          {this.isAlreadyTakenStateName(this.state.newStateName)
            ? 'Already taken name'
            : null}
        </label>
        <div className="state-controller__states">
          {this.props.config.states.map((state, index) => {
            const isActiveState = this.props.active_state.name == state.name;
            const isReverseButtonGroupClass = isActiveState
              ? 'button-group--reverse'
              : '';
            return (
              <div className={'button-group ' + isReverseButtonGroupClass}>
                <Button
                  className={'button--large button--has-type'}
                  onClick={() => {
                    this.props.sendNote(26, index);
                  }}
                >
                  <>
                    <span className="button__type">{'D#0 - ' + index}</span>
                    {state.name}
                  </>
                </Button>
                {isActiveState ? (
                  <>
                    <Button
                      disabled={this.props.isStatePristine ? true : false}
                      onClick={() => {
                        console.log('updating ->' + state.name);
                        this.props.sendText('updatestate : ' + state.name);
                      }}
                    >
                      <i className="la la-2x la-save" />
                    </Button>
                    <Button
                      disabled={
                        this.props.config.states.length > 1 ? false : true
                      }
                      onClick={() => {
                        console.log('deleting -> ' + state.name);

                        this.props.sendText('deletestate : ' + state.name);
                      }}
                    >
                      <i className="la la-2x la-trash" />
                    </Button>
                  </>
                ) : null}
              </div>
            );
          })}
          <div className="button-group">
            <Button
              onClick={() => {
                this.setState({
                  hasToRenderNewStateInput: !this.state.hasToRenderNewStateInput
                });
              }}
            >
              {this.state.hasToRenderNewStateInput ? (
                <i className="la la-minus" />
              ) : (
                <i className="la la-plus" />
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
        </div>
      </div>
    );
  }
}

export default StateController;
