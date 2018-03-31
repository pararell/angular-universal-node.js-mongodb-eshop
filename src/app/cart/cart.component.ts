import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import * as actions from './../store/actions'
import * as fromRoot from '../store/reducers';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent  {
  cart$: Observable<any>;
  order$: Observable<any>;

  constructor(private _route: ActivatedRoute,  private store: Store<fromRoot.State>, private location: Location) {
    this.cart$ = this.store.select(fromRoot.getCart);
    this.order$ = this.store.select(fromRoot.getOrder)
      .filter(Boolean)
      .map(order => order.outcome);
  }

  goBack() {
    this.location.back();
  }

  removeFromCart(id) {
    this.store.dispatch(new actions.RemoveFromCart(id));
  }

  onToggleForm() {

  }

}
