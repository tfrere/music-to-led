import React, { Component } from 'react';
import Button from '../generic/Button';
import guessNoteFromNumber from '../../utils/guessNoteFromNumber.js';

class State extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStatePristine: this.props.isStatePristine,
      isUpdateInputDisplayed: false,
      hasToRenderNewStateInput: false,
      updateStateName: this.props.strip.states[this.props.index].name,
      originalStateName: this.props.strip.states[this.props.index].name
    };
    this.newNameInputRef = React.createRef();
  }

  focusNewNameInputRef = () => {
    this.newNameInputRef.current.focus();
  };

  componentDidUpdate = oldProps => {
    if (
      oldProps.strip.states[this.props.index].name !=
      this.props.strip.states[this.props.index].name
    ) {
      this.setState({
        updateStateName: this.props.strip.states[this.props.index].name,
        originalStateName: this.props.strip.states[this.props.index].name
      });
    }
    if (this.props.strip.states[this.props.index].name)
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

  isAlreadyTakenStateName(name) {
    let response = false;
    this.props.strip.states.map((elem, index) => {
      if (name == elem.name) {
        if(this.props.index != index)
        response = true;
      }
    });
    return response;
  }

  render() {
    const isActiveState = this.props.active_state.name == this.props.state.name;
    const isReverseButtonGroupClass = isActiveState
      ? ' button-group--reverse '
      : ' ';

    const isUpdateInputDisplayed =
      this.state.isUpdateInputDisplayed === this.props.index;
    const isNameAlreadyTaken = this.isAlreadyTakenStateName(
      this.state.updateStateName
    );

    // const canUpdateStateName =
    //   !this.state.isStatePristine ||
    //   (isUpdateInputDisplayed && !isNameAlreadyTaken);
    const canUpdateStateName = this.state.isStatePristine;

    return (
      <div className={'button-group ' + isReverseButtonGroupClass}>
        {isUpdateInputDisplayed ? (
          <>
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
              className={
                isNameAlreadyTaken
                  ? 'input--error'
                  : ''
              }
              onBlur={() => {
                this.setState({
                  isUpdateInputDisplayed: -1,
                });
                if (!isNameAlreadyTaken) {
                  this.props.sendText(
                    'updatestate : ' + this.state.updateStateName
                  );
                }
                else {
                  this.setState({
                    updateStateName: this.state.originalStateName
                  });
                }
              }}
              type="text"
              ref={this.newNameInputRef}
            ></input>
            {/* <Button
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
            </Button> */}
          </>
        ) : (
          <Button
            alt={guessNoteFromNumber(27)}
            className={'button--large button--has-type'}
            onDoubleClick={() => {
              this.setState(
                {
                  isUpdateInputDisplayed:
                    this.state.isUpdateInputDisplayed !== this.props.index
                      ? this.props.index
                      : -1
                },
                () => {
                  if (this.state.isUpdateInputDisplayed) {
                    this.focusNewNameInputRef();
                  }
                }
              );
            }}  
            onClick={() => {
              this.props.sendNote(27, this.props.index + 1);
            }}
          >
            <>
              {this.props.index + 1 + '. '} {this.props.state.name}
            </>
          </Button>
        )}
        {isActiveState ? (
          <>
            <Button
              className="button--square"
              disabled={canUpdateStateName || isNameAlreadyTaken}
              onClick={() => {
                console.log('updating state -> ' + this.state.updateStateName);
                console.log("with index -> ", this.props.index);
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

export default State;
