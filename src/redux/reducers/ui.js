const uiDefaultState = {
  view: 'Ship'
}

export default (state = uiDefaultState, action) => {
  switch (action.type) {
    case 'REPLACE_UI':
      return { ...action.payload.ui }
    case 'SET_VIEW':
      return { ...state, view: action.payload.view }
    default:
      return state
  }
}
