;(function(exports) {
  exports.StateMachine = function(transitions) {
    this.state = "";
    this.transitions = transitions;
  };

  exports.StateMachine.prototype = {
    transition: function(newState) {
      if (this.transitions[this.state] !== undefined &&
          utils.contains(newState, this.transitions[this.state])) {
        this.state = newState;
      } else {
        throw "Tried to transition to " + newState + " from " + this.state;
      }
    }
  };
})(this);
