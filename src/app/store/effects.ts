import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';

import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

import { ApiService } from './../services/api.service';

import {Store, combineReducers, Action} from '@ngrx/store';
import * as actions from './actions';
import { State } from './reducers/index';


@Injectable()
export class AppEffects {

  @Effect() fetchUser$: Observable<Action> = this._actions
    .ofType(actions.LOAD_USER_ACTION)
    .switchMap((action: actions.LoadUserAction) => this.apiService.getUser())
    .map(res => new actions.StoreUserAction(res));

  @Effect() loadPayment$: Observable<Action> = this._actions
    .ofType(actions.LOAD_PAYMENT)
    .switchMap((action: actions.LoadPayment) => this.apiService.handleToken(action.payload))
    .map(res => new actions.LoadPaymentSuccess(res));

  @Effect() loadProduct$: Observable<Action> = this._actions
    .ofType(actions.LOAD_PRODUCT)
    .switchMap((action: actions.LoadProduct) => this.apiService.loadProduct(action.payload))
    .map(res => new actions.LoadProductSuccess(res));

  @Effect() loadProductLoader$: Observable<Action> = this._actions
    .ofType(actions.GET_PRODUCT)
    .map(res => new actions.LoadingProduct());

  @Effect() loadProducts$: Observable<Action> = this._actions
    .ofType(actions.LOAD_PRODUCTS)
    .switchMap((action: actions.LoadProducts) => this.apiService.loadProducts())
    .map(res => new actions.LoadProductsSuccess(res));

  @Effect() addProduct$: Observable<Action> = this._actions
    .ofType(actions.ADD_PRODUCT)
    .switchMap((action: actions.AddProduct) => this.apiService.addProduct(action.payload))
    .map(res => new actions.LoadProductsSuccess(res));

  @Effect() editProduct$: Observable<Action> = this._actions
    .ofType(actions.EDIT_PRODUCT)
    .switchMap((action: actions.EditProduct) => this.apiService.editProduct(action.payload))
    .map(res => new actions.LoadProductsSuccess(res));

  @Effect() removeProduct$: Observable<Action> = this._actions
    .ofType(actions.REMOVE_PRODUCT)
    .switchMap((action: actions.RemoveProduct) => this.apiService.removeProduct(action.payload))
    .map(res => new actions.LoadProductsSuccess(res));

  @Effect() getProduct$: Observable<Action> = this._actions
    .ofType(actions.GET_PRODUCT)
    .switchMap((action: actions.GetProduct) => this.apiService.getProduct(action.payload))
    .map(res => new actions.GetProductSuccess(res));

  @Effect() getCart$: Observable<Action> = this._actions
    .ofType(actions.GET_CART)
    .switchMap((action: actions.GetCart) => this.apiService.getCart())
    .map(res => new actions.GetCartSuccess(res));

  @Effect() addToCart$: Observable<Action> = this._actions
    .ofType(actions.ADD_TO_CART)
    .switchMap((action: actions.AddToCart) => this.apiService.addToCart(action.payload))
    .map(res => new actions.AddToCartSuccess(res));

  @Effect() removeFromCart$: Observable<Action> = this._actions
    .ofType(actions.REMOVE_FROM_CART)
    .switchMap((action: actions.RemoveFromCart) => this.apiService.removeFromCart(action.payload))
    .map(res => new actions.GetCartSuccess(res));

  @Effect() removeImage$: Observable<Action> = this._actions
  .ofType(actions.REMOVE_PRODUCT_IMAGE)
  .switchMap((action: actions.RemoveProductImage) => this.apiService.removeImage(action.payload))
  .map(res => new actions.StoreUserAction(res));

  constructor(private _actions: Actions, private store: Store<State>, private apiService: ApiService) { }

}
