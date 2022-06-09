import { TradingMethod } from 'src/constants/dashboard';
import { getSOR, SORResult } from 'src/features/SOR/helpers/sor';
import { OrderSide } from 'src/features/User/Account/interfaces';

function validateResult(actual: SORResult, expected: SORResult): void {
  const actualOrders = actual.orders;
  const expectedOrders = expected.orders;
  if (actualOrders.length !== expectedOrders.length) {
    throw new Error(`Number of orders does not match`);
  }

  for (let i = 0; i < actualOrders.length; i++) {
    if (actualOrders[i].source !== expectedOrders[i].source) {
      throw new Error(`Expected: ${expectedOrders[i].source}, actual ${actualOrders[i].source}`);
    }
    if (actualOrders[i].takerAmount !== expectedOrders[i].takerAmount) {
      throw new Error(`Expected: ${expectedOrders[i].takerAmount}, actual ${actualOrders[i].takerAmount}`);
    }
  }
}

const emptyOrderbook = {
  bids: [],
  asks: [],
};

function getResult(stellarAmount: string, bscAmount: string): SORResult {
  return {
    orders: [
      { source: 'XLM', takerAmount: stellarAmount },
      { source: 'FCX', takerAmount: bscAmount },
    ],
    price: '0',
    sources: [
      { name: 'XLM', proportion: '0' },
      { name: 'FCX', proportion: '0' },
    ],
  };
}

function testSOR1() {
  const data = [
    { name: 'XLM', orderbook: emptyOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: emptyOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '9', '1', '0.00001');
  validateResult(result, getResult('0.5', '0.5'));
}

function testSOR2() {
  const bscOrderbook = {
    bids: [{ price: '8.00000000', amount: '1', method: TradingMethod.BSCOrderbook }],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: emptyOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '9', '2', '0.00001');
  validateResult(result, getResult('1', '1'));
}

function testSOR3() {
  const bscOrderbook = {
    bids: [{ price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook }],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: emptyOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '9', '2', '0.00001');
  validateResult(result, getResult('0.5', '1.5'));
}

function testSOR4() {
  const bscOrderbook = {
    bids: [
      { price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
      { price: '9.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
    ],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: emptyOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '9', '2', '0.00001');
  validateResult(result, getResult('0', '2'));
}

function testSOR5() {
  const stellarOrderbook = {
    bids: [{ price: '10.00000000', amount: '1', method: TradingMethod.StellarOrderbook }],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: emptyOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '9', '2', '0.00001');
  validateResult(result, getResult('1.5', '0.5'));
}

function testSOR6() {
  const stellarOrderbook = {
    bids: [
      { price: '10.00000000', amount: '1', method: TradingMethod.StellarOrderbook },
      { price: '9.00000000', amount: '1', method: TradingMethod.StellarOrderbook },
    ],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: emptyOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '9', '2', '0.00001');
  validateResult(result, getResult('2', '0'));
}

function testSOR10() {
  const bscOrderbook = {
    bids: [],
    asks: [{ price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook }],
  };
  const data = [
    { name: 'XLM', orderbook: emptyOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Buy, '9', '2', '0.00001');
  validateResult(result, getResult('1', '1'));
}

function testSOR11() {
  const bscOrderbook = {
    bids: [],
    asks: [{ price: '8.00000000', amount: '1', method: TradingMethod.BSCOrderbook }],
  };
  const data = [
    { name: 'XLM', orderbook: emptyOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Buy, '9', '2', '0.00001');
  validateResult(result, getResult('0.5', '1.5'));
}

function testSOR12() {
  const bscOrderbook = {
    bids: [],
    asks: [
      { price: '9.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
      { price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
    ],
  };
  const data = [
    { name: 'XLM', orderbook: emptyOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Buy, '11', '2', '0.00001');
  validateResult(result, getResult('0', '2'));
}

function testSOR13() {
  const stellarOrderbook = {
    bids: [],
    asks: [{ price: '8.00000000', amount: '1', method: TradingMethod.StellarOrderbook }],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: emptyOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Buy, '9', '2', '0.00001');
  validateResult(result, getResult('1.5', '0.5'));
}

function testSOR14() {
  const stellarOrderbook = {
    bids: [],
    asks: [
      { price: '9.00000000', amount: '1', method: TradingMethod.StellarOrderbook },
      { price: '10.00000000', amount: '1', method: TradingMethod.StellarOrderbook },
    ],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: emptyOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Buy, '11', '2', '0.00001');
  validateResult(result, getResult('2', '0'));
}

function testSOR20() {
  const stellarOrderbook = {
    bids: [
      { price: '9.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '7.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '5.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
    ],
    asks: [],
  };
  const bscOrderbook = {
    bids: [
      { price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
      { price: '8.00000000', amount: '2', method: TradingMethod.BSCOrderbook },
      { price: '6.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
    ],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '100000' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '5', '10', '0.00001');
  validateResult(result, getResult('6', '4'));
}

function testSOR21() {
  const stellarOrderbook = {
    bids: [
      { price: '9.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '7.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '5.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
    ],
    asks: [],
  };
  const bscOrderbook = {
    bids: [
      { price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
      { price: '8.00000000', amount: '2', method: TradingMethod.BSCOrderbook },
      { price: '6.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
    ],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '4' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Sell, '5', '10', '0.00001');
  validateResult(result, getResult('4', '6'));
}

function testSOR22() {
  const stellarOrderbook = {
    bids: [
      { price: '9.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '7.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '5.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
    ],
    asks: [],
  };
  const bscOrderbook = {
    bids: [
      { price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
      { price: '8.00000000', amount: '2', method: TradingMethod.BSCOrderbook },
      { price: '6.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
    ],
    asks: [],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '100' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '1.5' },
  ];
  const result = getSOR(data, OrderSide.Sell, '5', '10', '0.00001');
  validateResult(result, getResult('8.5', '1.5'));
}

function testSOR23() {
  const stellarOrderbook = {
    bids: [],
    asks: [
      { price: '5.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
      { price: '7.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '9.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
    ],
  };
  const bscOrderbook = {
    bids: [],
    asks: [
      { price: '6.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '8.00000000', amount: '2', method: TradingMethod.BSCOrderbook },
      { price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
    ],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '12' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '100000' },
  ];
  const result = getSOR(data, OrderSide.Buy, '12', '10', '0.00001');
  validateResult(result, getResult('2', '8'));
}

function testSOR24() {
  const stellarOrderbook = {
    bids: [],
    asks: [
      { price: '5.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
      { price: '7.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '9.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
    ],
  };
  const bscOrderbook = {
    bids: [],
    asks: [
      { price: '6.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '8.00000000', amount: '2', method: TradingMethod.BSCOrderbook },
      { price: '10.00000000', amount: '1', method: TradingMethod.BSCOrderbook },
    ],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '1200' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '12' },
  ];
  const result = getSOR(data, OrderSide.Buy, '12', '10', '0.00001');
  validateResult(result, getResult('8', '2'));
}

function testSOR25() {
  const stellarOrderbook = {
    bids: [],
    asks: [{ price: '5.00000000', amount: '1', method: TradingMethod.BSCOrderbook }],
  };
  const bscOrderbook = {
    bids: [],
    asks: [
      { price: '6.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '8.00000000', amount: '2', method: TradingMethod.BSCOrderbook },
    ],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '1200' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '12' },
  ];
  const result = getSOR(data, OrderSide.Buy, '12', '10', '0.00001');
  validateResult(result, getResult('8', '2'));
}

function testSOR26() {
  const stellarOrderbook = {
    bids: [],
    asks: [{ price: '5.00000000', amount: '1', method: TradingMethod.BSCOrderbook }],
  };
  const bscOrderbook = {
    bids: [],
    asks: [
      { price: '6.00000000', amount: '3', method: TradingMethod.BSCOrderbook },
      { price: '8.00000000', amount: '2', method: TradingMethod.BSCOrderbook },
    ],
  };
  const data = [
    { name: 'XLM', orderbook: stellarOrderbook, balance: '20' },
    { name: 'FCX', orderbook: bscOrderbook, balance: '1200' },
  ];
  const result = getSOR(data, OrderSide.Buy, '10', '10', '0.00001');
  validateResult(result, getResult('2.5', '7.5'));
}
export function testSOR(): void {
  testSOR1();
  testSOR2();
  testSOR3();
  testSOR4();
  testSOR5();
  testSOR6();
  testSOR10();
  testSOR11();
  testSOR12();
  testSOR13();
  testSOR14();
  testSOR20();
  testSOR21();
  testSOR22();
  testSOR23();
  testSOR24();
  testSOR25();
  testSOR26();
}
