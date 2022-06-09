// @ts-ignore
import io from 'socket.io-client';
import { initFetchListNotiPopup } from 'src/components/Navigation/TopNav2';
import eventBus from 'src/event/event-bus';
import { addNewTrades } from 'src/features/MarketTrade/redux/MarketTrade.slice';
import { onReceiveBscUpdates } from 'src/features/Orderbook/helpers/orderbookHelper';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { setPairInfos } from 'src/features/Pairs/redux/pair';
import { addPoolTransactions } from 'src/features/Trasactions/redux/transactions.slice';
import { ReadStatus } from 'src/features/User/Account/Management/Notiication/const';
import { getListNotificationsSystem } from 'src/features/User/Account/Management/Notiication/redux/apis';
import { getCookieStorage } from 'src/helpers/storage';
import { SocketEvent } from 'src/socket/SocketEvent';
import store from 'src/store/store';
export class BaseSocket {
  private static instance: BaseSocket;
  // @ts-ignore
  private socket;
  private currentPair?: Pair;

  public static getInstance(): BaseSocket {
    if (!BaseSocket.instance) {
      BaseSocket.instance = new BaseSocket();
    }

    return BaseSocket.instance;
  }

  public connect(): void {
    const accessToken = getCookieStorage('access_token');
    this.socket = io(process.env.REACT_APP_BASE_SOCKET, {
      transports: ['websocket'],
      query: {
        authorization: accessToken,
      },
    });
    this.listen24TickerEvent();
    this.listenOrderEvent();
    this.listenTradeEvent();
    this.listenSettingTradingFee();
  }

  public reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connect();
    if (this.currentPair) {
      this.listenPairEvents(this.currentPair);
    }
  }

  listenPairEvents(pair?: Pair): void {
    if (this.currentPair) {
      this.socket.off(`trades_${this.currentPair.pairs_id}`);
      this.socket.off(`orderbook_${this.currentPair.pairs_id}`);
      this.socket.off(`stellar_orderbook_${this.currentPair.pairs_id}`);
      this.socket.off(`swaps_${this.currentPair.pairs_id}`);
    }
    this.currentPair = pair;
    if (!this.currentPair) {
      return;
    }

    this.socket.on(`trades_${this.currentPair.pairs_id}`, (data: any) => {
      eventBus.dispatch(SocketEvent.OrderbookTradeCreated, data);
      eventBus.dispatch(SocketEvent.PoolTradeCreated, data);
      eventBus.dispatch(SocketEvent.SwapCreated, data);
      store.dispatch(addNewTrades(data.reverse()));
    });

    this.socket.on(`orderbook_${this.currentPair.pairs_id}`, (data: any) => {
      onReceiveBscUpdates(store, data);
    });

    this.socket.on(`stellar_orderbook_${this.currentPair.pairs_id}`, (data: any) => {
      eventBus.dispatch(SocketEvent.StellarOrderbookUpdated, data);
    });

    this.socket.on(`swaps_${this.currentPair.pairs_id}`, (data: any) => {
      store.dispatch(addPoolTransactions(data.reverse()));
    });
  }

  listen24TickerEvent(): void {
    this.socket.on('24hTicker', (data: any) => {
      store.dispatch(setPairInfos(data));
    });
  }

  listenOrderEvent(): void {
    this.socket.on('orders', (data: any) => {
      eventBus.dispatch(SocketEvent.OrdersUpdated, data);
    });
  }

  listenTradeEvent(): void {
    this.socket.on('trades_updated', (data: any) => {
      eventBus.dispatch(SocketEvent.TradesUpdated, data);
    });
  }

  disconnectSocket(): void {
    this.socket.disconnect();
  }

  listenSettingTradingFee(): void {
    this.socket.on('trading_fee', () => {
      eventBus.dispatch(SocketEvent.TradingFeeUpdated, {});
      initFetchListNotiPopup();
      store.dispatch(getListNotificationsSystem({ page: 1, size: 20, is_read: ReadStatus.Unread }));
    });
  }
}
