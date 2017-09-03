import { ERROR_MISSING_ACTION_IN_STATE, ERROR_UNCOVERED_STATE } from './constants';
import validateState from './helpers/validateState';

function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) return false;
  }
  return true;
}

function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  const iterate = function (result) {
    if (!result.done) {

      // yield call
      if (typeof result.value === 'object' && result.value.__type === 'call') {
        const funcResult = result.value.func(...result.value.args);
        
        // promise
        if (typeof funcResult.then !== 'undefined') {
          funcResult.then(
            r => iterate(generator.next(r)),
            error => iterate(generator.throw(new Error(error)))
          );
        // generator
        } else if (typeof funcResult.next === 'function') {
          handleGenerator(machine, funcResult, generatorResult => {
            iterate(generator.next(generatorResult));
          });
        } else {
          iterate(generator.next(funcResult));
        }
  
      // the return statement of the normal function
      } else {
        updateState(machine, result.value);
        iterate(generator.next());
      }
    
    // the end of the generator (return statement)
    } else {
      done(result.value);
    }
  };

  iterate(generator.next(resultOfPreviousOperation));
}

function updateState(machine, response) {  
  var newState;
  
  if (typeof response === 'undefined') return;
  if (typeof response === 'string' || typeof response === 'number') {
    newState = { name: response.toString() };
  } else {
    newState = validateState(response);
  }

  if (
    typeof machine.transitions[newState.name] === 'undefined' ||
    isEmptyObject(machine.transitions[newState.name])
  ) {
    throw new Error(ERROR_UNCOVERED_STATE(newState.name));
  }

  machine.state = newState;
}

export default function handleAction(machine, action, payload) {
  const { state, transitions } = machine;

  if (!transitions[state.name]) {
    return false;
  }

  const handler = transitions[state.name][action];

  if (typeof transitions[state.name][action] === 'undefined') {
    throw new Error(ERROR_MISSING_ACTION_IN_STATE(action, state.name));
  }

  // string as a handler
  if (typeof handler === 'string') {
    updateState(machine, { ...state, name: transitions[state.name][action] });
    
  // object as a handler
  } else if (typeof handler === 'object') {
    updateState(machine, validateState(handler));

  // function as a handler
  } else if (typeof handler === 'function') {
    var response = transitions[state.name][action].apply(machine, [ machine.state, payload ]);

    if (response && typeof response.next === 'function') {
      handleGenerator(machine, response, response => {
        updateState(machine, response);
      });
    } else {
      updateState(machine, response);
    }
  }

  return true;
};