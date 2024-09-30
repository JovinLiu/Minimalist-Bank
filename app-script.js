"use strict";
// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [
    [200, "2019-11-18T21:31:17.178Z"],
    [450, "2019-12-23T07:42:02.383Z"],
    [-400, "2020-01-28T09:15:04.904Z"],
    [3000, "2020-04-01T10:17:24.185Z"],
    [-650, "2020-05-08T14:11:59.604Z"],
    [-130, "2020-05-27T17:01:17.194Z"],
    [70, "2023-12-04T23:36:17.929Z"],
    [1300, "2023-12-08T10:51:36.790Z"]
  ],
  interestRate: 1.2, // %
  pin: 1111,
  currency: "EUR",
  locale: "pt-PT" // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [
    [5000, "2019-11-01T13:15:33.035Z"],
    [3400, "2019-11-30T09:48:16.867Z"],
    [-150, "2019-12-25T06:04:23.907Z"],
    [-790, "2020-01-25T14:18:46.235Z"],
    [-3210, "2020-02-05T16:33:06.386Z"],
    [-1000, "2023-12-08T14:43:26.374Z"],
    [8500, "2023-12-09T18:49:59.371Z"],
    [-30, "2023-12-10T12:01:20.894Z"]
  ],
  interestRate: 1.5,
  pin: 2222,
  currency: "USD",
  locale: "en-US"
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444
};

const account5 = {
  owner: "Jovin Liu",
  movements: [
    [1, "2023-12-04T09:48:16.867Z"],
    [11, "2023-12-05T12:01:20.894Z"],
    [111, "2023-12-06T14:11:59.604Z"],
    [-1111, "2023-12-07T07:42:02.383Z"],
    [11111, "2023-12-08T14:11:59.604Z"],
    [111111, "2023-12-09T21:31:17.178Z"]
  ],
  interestRate: 2,
  pin: 5555,
  currency: "CNY",
  locale: "zh-CN"
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".loginDate");
const labelMovementDate = document.querySelector(".movements__date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
//NOTE:--------------------------------------------------------------------------------------------
//NOTE:设置倒计时
function setTimer() {
  let time = 300;
  let min, sec;
  const tick = function () {
    min = String(Math.trunc(time / 60)).padStart(2, 0);
    sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  };
  tick(); //NOTE:这样做的目的是每次logout再登录进去，时间显示的是上次退出的时间，或者是00:00.那么就把计算时间的函数tick每次单独拿出来，在计时器前先调用函数显示05:00，然后开始倒计时
  timer = setInterval(tick, 1000); //NOTE:时间间隔函数，每间隔多少秒就执行一下括号里的函数。
  return timer; //NOTE:将timer返回到global中，global的timer就不是undefined，那么切换用户的时候不是undefined就可以终止前一个时钟，开始新的倒计时。
}

//NOTE:格式化所有金额表达方法
function formattedMovementAmount(amount, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency
  }).format(amount);
}
//NOTE:显示交易日期
function formattedMovementDate(date1, date2) {
  let formattedMovDate;
  date1 = new Date(date1);
  date2 = new Date(date2);
  const daysPassed = Math.abs((new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())) / (1000 * 60 * 60 * 24));
  if (daysPassed < 1) {
    formattedMovDate = "Today";
  } else if (daysPassed >= 1 && daysPassed < 2) {
    formattedMovDate = "Yesterday";
  } else if (daysPassed <= 7) {
    formattedMovDate = `${daysPassed} DAYS AGO`;
  } else {
    formattedMovDate = new Intl.DateTimeFormat(currentAccount.locale).format(new Date(date2));
  }
  return formattedMovDate;
}
//NOTE:显示所有交易记录和金额
function displayAllRecords(account) {
  containerMovements.innerHTML = "";
  let movements;
  const date = Date.now();
  const dateDisplayOptions = {
    minute: "numeric",
    hour: "numeric",
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric"
  };
  labelDate.textContent = new Intl.DateTimeFormat(account.locale, dateDisplayOptions).format(date);
  sorted ? (movements = account.movements.slice().sort((a, b) => a[0] - b[0])) : (movements = account.movements);
  movements.forEach((movement, i) => {
    const type = movement[0] > 0 ? "deposit" : "withdrawal";
    const movementDate = formattedMovementDate(date, movement[1]);
    const HTML = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${movementDate}</div>
    <div class="movements__value">${formattedMovementAmount(movement[0], account.locale, account.currency)}</div>
    </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", HTML);
  });
  let inNout = {inSum: [], outSum: []};
  account.movements.forEach((movement) => {
    inNout[movement[0] > 0 ? "inSum" : "outSum"].push(movement[0]);
    return inNout;
  });
  //NOTE:计算
  account.deposit = inNout.inSum.reduce((sum, mov) => (sum += mov), 0);
  account.withdrawal = inNout.outSum.reduce((sum, mov) => (sum += mov), 0);
  account.balance = account.deposit + account.withdrawal;
  account.interests = inNout.inSum.filter((mov) => mov > 1).reduce((sumInterest, mov) => (sumInterest += (mov * currentAccount.interestRate) / 100), 0);
  //NOTE:显示
  labelSumIn.textContent = `${formattedMovementAmount(account.deposit, account.locale, account.currency)}`;
  labelSumOut.textContent = `${formattedMovementAmount(Math.abs(account.withdrawal), account.locale, account.currency)}`;
  labelSumInterest.textContent = `${formattedMovementAmount(account.interests, account.locale, account.currency)}`;
  labelBalance.textContent = `${formattedMovementAmount(account.balance, account.locale, account.currency)}`;
}

let currentAccount, sorted, timer;

//NOTE:创建名字缩写。作为用户名，提示：使用forEach Loop
accounts.forEach(
  (account) =>
    (account.username = account.owner
      .split(" ")
      .reduce((username, word) => (username = username + word[0]), "")
      .toLowerCase())
);
//NOTE:实现Login功能。提示阻止表单自动提交，find检索method，optional chain
btnLogin.addEventListener("click", function (e) {
  sorted = false;
  e.preventDefault();
  currentAccount = accounts.find((account) => account.username === inputLoginUsername.value);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Hello ${currentAccount.owner}`;
    displayAllRecords(currentAccount);
    if (timer) {
      clearInterval(timer);
    }
    timer = setTimer();
  } else {
    alert("Wrong Username or Password");
  }
  inputLoginUsername.value = inputLoginPin.value = "";
  inputLoginUsername.blur();
  inputLoginPin.blur();
});

//NOTE:排序按钮
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  sorted = !sorted;
  displayAllRecords(currentAccount);
  if (timer) {
    clearInterval(timer);
  }
  timer = setTimer();
});
//NOTE:转账按钮
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amountTransfered = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find((account) => account.username === inputTransferTo.value);
  if (receiverAcc && amountTransfered > 0 && amountTransfered <= currentAccount.balance && receiverAcc !== currentAccount) {
    const trasactionTime = new Date().toISOString();
    currentAccount.movements.push([-amountTransfered, trasactionTime]);
    receiverAcc.movements.push([amountTransfered, trasactionTime]);
    displayAllRecords(currentAccount);
    console.log(accounts);
  } else {
    alert("Invalid Username or Amount");
  }
  if (timer) {
    clearInterval(timer);
  }
  timer = setTimer();
  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur;
  inputTransferTo.blur;
});
//NOTE:贷款按钮，贷款的条件是记录中至少有一笔存款，至少占所申请贷款金额的10%
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  if (loanAmount > 0 && currentAccount.movements.some((mov) => mov[0] >= loanAmount * 0.1)) {
    const trasactionTime = new Date().toISOString();
    currentAccount.movements.push([loanAmount, trasactionTime]);
    displayAllRecords(currentAccount);
    console.log(accounts);
  } else {
    alert("Invalid Amount");
  }
  if (timer) {
    clearInterval(timer);
  }
  timer = setTimer();
  inputLoanAmount.value = "";
  inputLoanAmount.blur();
});
//NOTE:关闭帐户按钮。提示：findIndex
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (currentAccount.username === inputCloseUsername.value && currentAccount.pin === Number(inputClosePin.value)) {
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
    accounts.splice(accounts.indexOf(currentAccount), 1);
  } else {
    alert("Wrong Username or Password");
  }
  inputCloseUsername.value = inputClosePin.value = "";
  inputClosePin.blur;
  inputCloseUsername.blur;
  if (timer) {
    clearInterval(timer);
  }
});
