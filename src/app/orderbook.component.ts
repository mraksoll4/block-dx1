import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import 'rxjs/add/operator/map';

import { naturalSort } from './util';
import { Order } from './order';
import { OrderbookService } from './orderbook.service';
import { TableComponent } from './table/table.component';
import { AppService } from './app.service';
import {TradehistoryService} from './tradehistory.service';
import { Trade } from './trade';

@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./order-book.component.scss'],
  providers: [TradehistoryService]
})
export class OrderbookComponent implements OnInit {
  @ViewChild('orderbookTable') public orderbookTable: TableComponent;

  public sections: any[] = [];
  public symbols:string[] = [];
  public lastTradePrice:string;

  constructor(
    private appService: AppService,
    private orderbookService: OrderbookService,
    private decimalPipe:DecimalPipe,
    private tradehistoryService:TradehistoryService
  ) { }

  ngOnInit(): void {
    this.appService.marketPairChanges.subscribe((symbols) => {
      this.symbols = symbols;
      if (symbols) {
        this.orderbookService.getOrderbook()
          .subscribe(orderbook => {
            const asks = orderbook.asks.sort((a,b) => {
              if (a[0] < b[0]) return 1;
              if (a[0] > b[0]) return -1;
              return 0;
            });
            const bids = orderbook.bids.sort((a,b) => {
              if (a[0] < b[0]) return -1;
              if (a[0] > b[0]) return 1;
              return 0;
            });

            this.sections = [
              {rows: asks},
              {rows: bids}
            ];

            this.orderbookTable.scrollToMiddle();
          });
      }
    });
    this.tradehistoryService.getTradehistory()
      .subscribe(tradehistory => {
        const trades = [...tradehistory]
          .sort((a, b) => a.time.localeCompare(b.time));
        const lastTrade = trades[trades.length - 1];
        // console.log('lastTrade', lastTrade);
      });
  }

  onRowSelect(row) {
    if (row) {
      this.orderbookService.requestOrder(row);
    }
  }
}
