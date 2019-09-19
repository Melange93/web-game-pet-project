import {deal} from "./dealLogic.js";

export let init = {
    init: function () {
        let startButton = document.querySelector('#start-btn');
        startButton.addEventListener('click', function () {
            let deckStyle = document.querySelector('input[name="deck"]:checked').value;

            if (deckStyle === 'art') {
                localStorage.setItem("dictionary", 'art');
                localStorage.setItem("extension", 'jpg');
            } else if (deckStyle === 'gladiator') {
                localStorage.setItem("dictionary", 'gladiator');
                localStorage.setItem("extension", 'jpg');
            } else {
                localStorage.setItem("dictionary", 'classic');
                localStorage.setItem("extension", 'png');
            }

            init.initGameField();
            init.initGame();
        });
    },

    initGameField: function () {
        let body = document.querySelector('body');
        body.innerHTML = '';

        let dealButton = document.createElement('button');
        dealButton.textContent = 'Deal';
        dealButton.classList.add('deal-btn');
        body.appendChild(dealButton);

        let container = document.createElement('div');
        container.classList.add('container');
        body.appendChild(container);

        let hitButton = document.createElement('button');
        hitButton.classList.add('hit-btn');
        hitButton.textContent = 'Hit';
        container.appendChild(hitButton);

        let standButton = document.createElement('button');
        standButton.classList.add('stand-btn');
        standButton.textContent = 'Stand';
        container.appendChild(standButton);

        let dealerCards = document.createElement('div');
        dealerCards.classList.add('dealer-cards');
        container.appendChild(dealerCards);

        let cards = document.createElement('div');
        cards.classList.add('cards');
        container.appendChild(cards);

        init.betFieldCreator(100)
    },

    initGame: function () {
        const fullDeck = deal.createDeck(2);
        let newDeck = [];
        const hands = {dealer: [], player: []};
        let payOut = 0;

        let cards = document.querySelector('.cards');
        let dealerCards = document.querySelector('.dealer-cards');

        const btnDeal = document.querySelector('.deal-btn');
        const btnStand = document.querySelector('.stand-btn');
        const btnHit = document.querySelector('.hit-btn');
        const buttons = [btnStand, btnHit];

        btnDeal.addEventListener('click', function () {
            newDeck = [];
            init.nextRound(cards, dealerCards, buttons);
            init.startRound(newDeck, fullDeck, hands, buttons, payOut);

            if (init.checkForBlackjack()) {
                init.toggleButtons(buttons, 'hide');
                init.flipDealerCards(hands, dealerCards);
                payOut = init.checkScore();
            init.moneyHandler(payOut);
            }
        });

        btnStand.addEventListener('click', function () {
            init.flipDealerCards(hands, dealerCards);
            while (init.cardCounter('dealer') < 17 && (init.cardCounter('dealer') <= init.cardCounter('player'))) {
                init.dealerHit(newDeck, fullDeck, hands, dealerCards);
            }
            if (init.checkForBust('dealer')) {
                payOut = 2;
            } else {
                payOut = init.checkScore();
            }
            init.moneyHandler(payOut);
        });

        btnHit.addEventListener('click', function () {
            let hit = (deal.dealCards(1, newDeck, fullDeck)[0]);
            hands.player.push(hit[0]);
            init.addCard(hit, cards, 'player');
            init.showCardSum(init.cardCounter('player'));
            if (init.checkForBust('player')) {
                init.toggleButtons(buttons, 'hide');
                payOut = 0;
            }
            init.moneyHandler(payOut);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                console.log(payOut);
                console.log(newDeck);
            }
        });
    },

    addCard: function (card, cardContainer, playerClass) {
        let newCard = document.createElement('img');
        newCard.classList.add(`${playerClass}-card`);
        if (cardContainer.childElementCount + 1 > 1) {
            newCard.style.position = "relative";
            let leftPosition = 40 * cardContainer.childElementCount;
            newCard.style.left = `${leftPosition}px`
        }

        if (localStorage.getItem("dictionary") !== 'classic') {
            newCard.classList.add("radius-deck");
        }

        newCard.setAttribute('src', `../static/images/${localStorage.getItem("dictionary")}/${card.slice(0, 2)}.${localStorage.getItem("extension")}`);
        newCard.dataset.value = `${card.slice(0, 1)}`;
        cardContainer.appendChild(newCard);
    },

    addCardFaceDown: function (card, cardContainer) {

        let newCard = document.createElement('img');
        newCard.classList.add("dealer-card");
        if (cardContainer.childElementCount + 1 > 1) {
            newCard.style.position = "relative";
            let leftPosition = 40 * cardContainer.childElementCount;
            newCard.style.left = `${leftPosition}px`;
        }

        if (localStorage.getItem("dictionary") !== 'classic') {
            newCard.classList.add("radius-deck")
        }

        if (cardContainer.childElementCount + 1 <= 1) {
            newCard.setAttribute('src', `../static/images/${localStorage.getItem("dictionary")}/${card.slice(0, 2)}.${localStorage.getItem("extension")}`)
        } else {
            let randomBackCard = Math.random();
            if (randomBackCard > 0.5 && localStorage.getItem("dictionary") === 'classic') {
                newCard.setAttribute('src', `../static/images/${localStorage.getItem("dictionary")}/redback.${localStorage.getItem("extension")}`);
            } else {
                newCard.setAttribute('src', `../static/images/${localStorage.getItem("dictionary")}/back.${localStorage.getItem("extension")}`);
            }
        }

        newCard.dataset.value = `${card.slice(0, 1)}`;
        cardContainer.appendChild(newCard);
    },

    initCards: function (newDeck, fullDeck, hands) {
        let cardContainer = document.querySelector('.cards');
        hands.player = deal.dealCards(2, newDeck, fullDeck);
        for (let card of hands.player) {
            init.addCard(`${card}`, cardContainer, 'player');
        }

        let dealerCardContainer = document.querySelector('.dealer-cards');
        hands.dealer = deal.dealCards(2, newDeck, fullDeck);
        init.addCard(`${hands.dealer[0]}`, dealerCardContainer, 'dealer');
        init.addCardFaceDown(`${hands.dealer[1]}`, dealerCardContainer);
    },

    cardCounter: function (handToCheck) {
        // handToCheck will be 'player' or 'dealer'
        let cardSum = 0;
        let asCounter = 0;
        let cards = document.querySelectorAll(`.${handToCheck}-card`);
        for (let card of cards) {
            let value = card.dataset.value;
            if (value === "0") {
                value = 10;
            } else if (value === "K") {
                value = 10;
            } else if (value === "Q") {
                value = 10;
            } else if (value === "J") {
                value = 10;
            } else if (value === "A") {
                asCounter++;
                value = 0;
            }
            cardSum = cardSum + parseInt(value)
        }

        for (let card of cards) {
            let value = card.dataset.value;
            if (value === "A" && cardSum < 11) {
                if (asCounter > 1 && cardSum === 10) {
                    value = 1;
                } else {
                    value = 11;
                }
                cardSum = value + cardSum;
            } else if (value === "A" && cardSum > 10) {
                value = 1;
                cardSum = value + cardSum;
            }
        }
        return cardSum
    },

    showCardSum: function (value) {
        try {
            let counterDiv = document.querySelector('#cardCount');
            counterDiv.innerText = value;
        } catch (e) {
            let container = document.querySelector(".container");
            let counterDiv = document.createElement("div");
            counterDiv.setAttribute("id", "cardCount");
            counterDiv.innerText = value;
            container.appendChild(counterDiv);
        }
    },

    checkForBlackjack: function () {
        return (
            (init.cardCounter('player') === 21 || init.cardCounter('dealer') === 21) &&
            document.querySelectorAll('.player-card').length === 2);
    },

    checkForBust: function (handToCheck) {
        return (init.cardCounter(handToCheck) > 21);
    },

    checkScore: function () {
        if (init.cardCounter('player') > init.cardCounter('dealer')) {
            if (init.checkForBlackjack()) {
                return 2.5;
            }
            return 2;
        } else if (init.cardCounter('player') < init.cardCounter('dealer')) {
            return 0;
        } else {
            return 1;
        }
    },

    flipDealerCards: function (hands, dealerCards) {
        dealerCards.innerHTML = '';
        for (let card in hands.dealer) {
            init.addCard(`${hands.dealer[card]}`, dealerCards, 'dealer');
        }
    },

    dealerHit: function (newDeck, fullDeck, hands, cardContainer) {
        let hit = deal.dealCards(1, newDeck, fullDeck)[0];
        hands.dealer.push(hit);
        init.addCard(`${hit.slice(0, 2)}`, cardContainer, 'dealer');
    },

    toggleButtons: function (buttons, action) {
        action = action === 'hide' ? 'None' : 'Block';
        for (let button of buttons) {
            button.style.display = action;
        }
    },

    nextRound: function (cards, dealerCards, buttons) {
        cards.innerHTML = '';
        dealerCards.innerHTML = '';
        init.toggleButtons(buttons, 'show');
    },

    startRound: function (newDeck, fullDeck, hands) {
        init.initCards(newDeck, fullDeck, hands);
        init.showCardSum(init.cardCounter('player'));
    },


    betFieldCreator: function (money) {
        let container = document.querySelector(".container");
        let pocket = document.createElement("div");
        pocket.setAttribute("id","pocket");
        pocket.dataset.money = money;
        pocket.innerText="your money: " +money;
        container.appendChild(pocket);

        let betField = document.createElement("div");
        betField.setAttribute("id","betField")
        betField.dataset.betValue = "0";
        betField.innerText= "Your bet: 0";
        container.appendChild(betField);

        let coinContainer = document.createElement("div")
        coinContainer.classList.add("coincontainer");
        let coins = [5,10,50]
        for (let coinValue of coins){
            let coin = document.createElement("div");
            coin.classList.add("coin");
            coin.innerText=coinValue;
            coin.dataset.quantity=coinValue;
            coin.addEventListener("click",function () {
                let bet = coin.dataset.quantity
                let yourPocket = pocket.dataset.money

                if (yourPocket<=0 || parseInt(yourPocket)-parseInt(bet)<0){
                    ;
                } else {
                    pocket.dataset.money = parseInt(yourPocket)-parseInt(bet);
                pocket.innerText = "Your Pocket: "+(parseInt(yourPocket)-parseInt(bet));
                let yourBet= betField.dataset.betValue
                betField.dataset.betValue = parseInt(yourBet)+parseInt(bet)
                betField.innerText= "Your Bet: "+(parseInt(yourBet)+parseInt(bet))
                console.log(bet)
                }

            })
            coinContainer.appendChild(coin);
        }
        container.appendChild(coinContainer);
    },

    moneyHandler: function (payOut) {
        let betField = document.querySelector("#betField");
        let yourBet = parseInt(betField.dataset.betValue);
        let pocket = document.querySelector("#pocket");
        let reward = yourBet*payOut;
        let moneyInPocket = parseInt(pocket.dataset.money)+reward;

        pocket.dataset.money = moneyInPocket;
        pocket.innerText = "Your Money: "+moneyInPocket;

        betField.textContent = "Your Bet: 0";
        betField.dataset.betValue = "0";
    }
};
