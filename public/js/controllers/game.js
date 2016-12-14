'use strict';

angular.module('mean.system')
  .controller('GameController', ['$scope', 'game',
    '$timeout', 'searchService', 'sendEmail', '$location',
    '$modal', 'MakeAWishFactsService',
    ($scope, game, $timeout, searchService, sendEmail, $location,
      $modal, MakeAWishFactsService) => {
      $scope.hasPickedCards = false;
      $scope.winningCardPicked = false;
      $scope.showTable = false;
      $scope.modalShown = false;
      $scope.game = game;
      $scope.pickedCards = [];
      let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      $scope.makeAWishFact = makeAWishFacts.pop();
      $scope.numberOfInvite = 1;
      $scope.invitedPlayersList = [];
      $scope.checkExist = true;

      $scope.pickCard = (card) => {
        if (!$scope.hasPickedCards) {
          if ($scope.pickedCards.indexOf(card.id) < 0) {
            $scope.pickedCards.push(card.id);
            if (game.curQuestion.numAnswers === 1) {
              $scope.sendPickedCards();
              $scope.hasPickedCards = true;
            } else if (game.curQuestion.numAnswers === 2 &&
              $scope.pickedCards.length === 2) {
              //delay and send
              $scope.hasPickedCards = true;
              $timeout($scope.sendPickedCards, 300);
            }
          } else {
            $scope.pickedCards.pop();
          }
        }
      };

      $scope.pointerCursorStyle = () => {
        if ($scope.isCzar() && $scope.game.state ===
          'waiting for czar to decide') {
          return {
            'cursor': 'pointer'
          };
        } else {
          return {};
        }
      };

      $scope.sendPickedCards = () => {
        game.pickCards($scope.pickedCards);
        $scope.showTable = true;
      };

      $scope.cardIsFirstSelected = (card) => {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[0];
        } else {
          return false;
        }
      };

      $scope.cardIsSecondSelected = (card) => {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[1];
        } else {
          return false;
        }
      };

      $scope.firstAnswer = ($index) => {
        if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
          return true;
        } else {
          return false;
        }
      };

      $scope.secondAnswer = ($index) => {
        if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
          return true;
        } else {
          return false;
        }
      };

      $scope.showFirst = (card) => {
        return game.curQuestion.numAnswers > 1 &&
          $scope.pickedCards[0] === card.id;
      };

      $scope.showSecond = (card) => {
        return game.curQuestion.numAnswers > 1 &&
          $scope.pickedCards[1] === card.id;
      };

      $scope.isCzar = () => {
        return game.czar === game.playerIndex;
      };

      $scope.isPlayer = ($index) => {
        return $index === game.playerIndex;
      };

      $scope.isCustomGame = () => {
        return !(/^\d+$/).test(game.gameID) &&
          game.state === 'awaiting players';
      };

      $scope.isPremium = ($index) => {
        return game.players[$index].premium;
      };

      $scope.currentCzar = ($index) => {
        return $index === game.czar;
      };

      $scope.winningColor = ($index) => {
        if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
          return $scope.colors[game.players[game.winningCardPlayer].color];
        } else {
          return '#f9f9f9';
        }
      };

      $scope.pickWinning = (winningSet) => {
        if ($scope.isCzar()) {
          game.pickWinning(winningSet.card[0]);
          $scope.winningCardPicked = true;
        }
      };

      $scope.winnerPicked = () => {
        return game.winningCard !== -1;
      };

      function startGameModal(message, template) {
        $scope.animationsEnabled = false;
        $scope.errorBody = message;
        $scope.modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          scope: $scope,
          ariaDescribedBy: 'modal-body',
          templateUrl: template,
          controller: 'GameController',
          size: 'sm',
          appendTo: angular.element(document).find('#gameplay-container'),
          resolve: {
            items: function () {
              return $scope.errorBody;
            }
          }
        });
      }


      $scope.startGame = () => {
        const minimumAlert = angular.element('#alertModal');
        const saveGame = angular.element('#gamePopup');
        if (game.players.length >= game.playerMinLimit &&
          $scope.isCustomGame()) {
          saveGame.modal('show');
          const message = 'You are about to start a game that will be saved';
          const template = '/views/save-game.html';
          startGameModal(message, template);
        } else if (game.players.length >= game.playerMinLimit) {
          game.startGame();
        } else {
          minimumAlert.modal('show');
        }
      };

      $scope.saveGame = () => {
        game.saveGame();
        const saveGame = angular.element('#gamePopup');
        saveGame.modal('hide');
        $scope.modalInstance.close();
      }

      $scope.closeModal = () => {
        const saveGame = angular.element('#gamePopup');
        saveGame.modal('hide');
        $scope.modalInstance.close();
      };

      $scope.abandonGame = () => {
        game.leaveGame();
        $location.path('/');
      };

      // Catches changes to round to update when no players pick card
      // (because game.state remains the same)
      $scope.$watch('game.round', () => {
        $scope.hasPickedCards = false;
        $scope.showTable = false;
        $scope.winningCardPicked = false;
        $scope.makeAWishFact = makeAWishFacts.pop();
        if (!makeAWishFacts.length) {
          makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
        }
        $scope.pickedCards = [];
      });

      // In case player doesn't pick a card in time, show the table
      $scope.$watch('game.state', () => {
        if (game.state === 'waiting for czar to decide' &&
          $scope.showTable === false) {
          $scope.showTable = true;
        }
      });

      $scope.$watch('game.gameID', () => {
        if (game.gameID && game.state === 'awaiting players') {
          if (!$scope.isCustomGame() && $location.search().game) {
            // If the player didn't successfully enter the request room,
            // reset the URL so they don't think they're in the requested room.
            $location.search({});
          } else if ($scope.isCustomGame() && !$location.search().game) {
            // Once the game ID is set,
            // update the URL if this is a game with friends,
            // where the link is meant to be shared.
            $location.search({
              game: game.gameID
            });
            if (!$scope.modalShown) {
              setTimeout(() => {
                $scope.link = document.URL;
                $('#lobby-how-to-play').html('<button class=' +
                  '"btn btn-info btn-lg" data-toggle="modal" ' +
                  'data-target="#inviteModal">Invite Friends</button>');
              }, 200);
              $scope.modalShown = true;
            }
          }
        }
      });

      if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
        game.joinGame('joinGame', $location.search().game);
      } else if ($location.search().custom) {
        game.joinGame('joinGame', null, true);
      } else {
        game.joinGame();
      }

      $scope.searchDB = (searchString) => {
        $scope.searchResult = [];
        searchService(searchString)
          .then((data) => {
            $scope.items = data;
          });
      };

      $scope.sendInvite = (email, name) => {
        const inviteAlert = angular.element('#alertInviteModal');
        const nameExistAlert = angular.element('#alertExistModal');
        const emailSent = angular.element('#emailSent');

        if ($scope.numberOfInvite <= game.playerMaxLimit) {
          if ($scope.invitedPlayersList.indexOf(email) === -1) {
            $scope.invitedPlayersList.push(email);
            sendEmail(email, name, document.URL)
              .then((data) => {
                emailSent.modal('show');
              });
            $scope.numberOfInvite += 1;
          } else {
            nameExistAlert.modal('show');
          }
        } else {
          inviteAlert.modal('show');
        }
      };

      $scope.checkPlayer = (email) => {
        return $scope.invitedPlayersList.includes(email);
      };
    }
  ]);