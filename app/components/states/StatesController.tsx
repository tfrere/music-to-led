import React, { Component } from 'react';

import State from './State';
import Button from '../generic/Button';

import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from 'react-sortable-hoc';

const swapElementsInList = (input, index_A, index_B) => {
  let temp = input[index_A];

  input[index_A] = input[index_B];
  input[index_B] = temp;
};

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const META_TEXT = 0xff;

const DragHandle = sortableHandle(() => (
  <span className="drag-handle">
    <span className="drag-handle__bars"></span>
  </span>
));

const SortableItem = sortableElement(({ value }) => {
  const classNames =
    value.props.active_state.name == value.props.state.name
      ? 'drag-handle-element--active'
      : '';
  return (
    <li
      className={'drag-handle-element state-controller__states ' + classNames}
    >
      <DragHandle />
      {value}
    </li>
  );
});

const SortableList = sortableContainer(({ items }) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem
          key={`item-${value}-${index}`}
          index={index}
          value={value}
        />
      ))}
    </ul>
  );
});

class SortableComponent extends Component {
  render() {
    return (
      <SortableList
        items={this.props.items}
        onSortEnd={this.props.onSortEnd}
        useDragHandle
      />
    );
  }
}

class StatesController extends React.Component {
  constructor(props) {
    super(props);
    let that = this;

    this.state = {
      hasToRenderNewStateInput: false,
      newStateName: '',
      isSwapLoading: false
    };
    this.newStateInputRef = React.createRef();
  }

  focusNewStateInputRef = () => {
    this.newStateInputRef.current.focus();
  };

  createStatesElems = () => {
    return this.props.strip.states.map((state, index) => {
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
          isAlreadyTakenStateName={this.isAlreadyTakenStateName}
        />
      );
    });
  };

  isAlreadyTakenStateName(name) {
    let response = false;
    this.props.strip.states.map(elem => {
      if (name == elem.name) {
        response = true;
      }
    });
    return response;
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    console.log(oldIndex, newIndex);
    if (oldIndex === newIndex) {
      return;
    }
    let that = this;
    this.setState(
      {
        isSwapLoading: true
      },
      () => {
        setTimeout(() => {
          that.setState({
            isSwapLoading: false
          });
        }, 250);
        that.props.sendText('swapstate : ' + oldIndex + ', ' + newIndex);
      }
    );
  };

  render() {
    const isSwapLoadingClasses = this.state.isSwapLoading
      ? 'state-controller__states--loading'
      : '';
    return (
      <div className="state-controller">
        <label className="label">Presets</label>
        <div className={'state-controller__states ' + isSwapLoadingClasses}>
          {this.state.isSwapLoading ? (
            <div className="state-controller__states__loader loading"></div>
          ) : null}
          <SortableComponent
            key={this.props.active_state}
            items={this.createStatesElems()}
            onSortEnd={this.onSortEnd}
          />
          <div className="button-group">
            {!this.state.hasToRenderNewStateInput ? (
              <Button
                className="button--square button--dashed"
                onClick={() => {
                  this.setState(
                    {
                      hasToRenderNewStateInput: !this.state
                        .hasToRenderNewStateInput,
                      newStateName: ''
                    },
                    () => {
                      if (this.state.hasToRenderNewStateInput) {
                        this.focusNewStateInputRef();
                      }
                    }
                  );
                }}
              >
                <i className="la la-plus la-2x" />
              </Button>
            ) : (
              ''
            )}
            {this.state.hasToRenderNewStateInput ? (
              <>
                <input
                  name="new-state"
                  value={this.state.newStateName}
                  placeholder={'Preset name ...'}
                  onChange={e => {
                    this.setState({
                      newStateName: e.target.value
                    });
                  }}
                  type="text"
                  ref={this.newStateInputRef}
                  className={
                    this.isAlreadyTakenStateName(this.state.newStateName)
                      ? 'input--error'
                      : ''
                  }
                  onBlur={() => {
                    let that = this;
                    window.setTimeout(() => {
                      that.setState({
                        hasToRenderNewStateInput: false
                      });
                    }, 250);
                  }}
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
                    console.log('adding ->' + this.state.newStateName);
                    this.props.sendText(
                      'newstate : ' + this.state.newStateName
                    );
                    this.setState({
                      newStateName: '',
                      hasToRenderNewStateInput: false
                    });
                  }}
                >
                  ADD
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default StatesController;
