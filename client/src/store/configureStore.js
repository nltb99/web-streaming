import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import * as RoomController from './RoomController'
import * as CredentialController from './CredentialController'

export default function configureStore(history, initialState) {
    const reducers = {
        roomTags: RoomController.reducer,
        credentials: CredentialController.reducer,
    };
    const middleware = [
        thunk,
        routerMiddleware(history)
    ];
    const enhancers = [];
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && typeof window !== 'undefined' && window.devToolsExtension) {
        enhancers.push(window.devToolsExtension());
    }
    const rootReducer = combineReducers({
        ...reducers,
        routing: routerReducer
    });
    return createStore(
        rootReducer,
        initialState,
        compose(applyMiddleware(...middleware), ...enhancers)
    );
}
